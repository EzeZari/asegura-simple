import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });


export const crearSuscripcion = async (req: any, res: any) => {
  try {
    const { plan, email, mpEmail } = req.body;

    // 1. Validar datos recibidos
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        error: "El correo electrónico del usuario es obligatorio.",
      });
    }

    const planes: Record<
      string,
      { title: string; price: number }
    > = {
      BASICO: {
        title: "AseguraSimple - Plan Básico",
        price: 9990,
      },
      PROFESIONAL: {
        title: "AseguraSimple - Plan Profesional",
        price: 14990,
      },
      AGENCIA: {
        title: "AseguraSimple - Plan Agencia",
        price: 24990,
      },
    };

    const planSeleccionado = planes[plan];

    if (!planSeleccionado) {
      return res.status(400).json({
        error: "El plan seleccionado no es válido.",
      });
    }

    // 2. Verificar que el usuario exista
    const usuario = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "No se encontró el usuario.",
      });
    }

    // 3. Preparar la solicitud a Mercado Pago
    const frontendUrl = (
      process.env.FRONTEND_URL ||
      "https://www.asegurasimple.com"
    ).replace(/\/+$/, "");

    const correoPago = (
      typeof mpEmail === "string" && mpEmail.trim()
        ? mpEmail
        : email
    )
      .trim()
      .toLowerCase();

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      console.error(
        "Falta configurar MERCADO_PAGO_ACCESS_TOKEN."
      );

      return res.status(500).json({
        error: "La configuración de pagos está incompleta.",
      });
    }

    const bodyMP = {
      reason: planSeleccionado.title,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: planSeleccionado.price,
        currency_id: "ARS",
      },
      back_url: `${frontendUrl}/login`,
      external_reference: `${usuario.id}---${plan}`,
      payer_email: correoPago,
    };

    // 4. Crear la suscripción
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });

    const preapproval = new PreApproval(client);

    const resultado = await preapproval.create({
      body: bodyMP,
    });

    console.log("Suscripción creada correctamente:", {
      usuarioId: usuario.id,
      plan,
      monto: planSeleccionado.price,
      status: resultado.status,
      tieneInitPoint: Boolean(resultado.init_point),
    });

    if (!resultado.init_point) {
      console.error(
        "Mercado Pago no devolvió init_point:",
        JSON.stringify(
          {
            id: resultado.id,
            status: resultado.status,
          },
          null,
          2
        )
      );

      return res.status(502).json({
        error:
          "Mercado Pago no devolvió el enlace de pago.",
      });
    }

    return res.status(200).json({
      init_point: resultado.init_point,
    });
  } catch (error: any) {
    // 5. Registrar el error real sin exponer credenciales
    console.error("=== ERROR REAL MERCADO PAGO ===");
    console.error("Mensaje:", error?.message);
    console.error("Status:", error?.status);
    console.error("Status HTTP:", error?.statusCode);

    console.error(
      "Causa:",
      JSON.stringify(error?.cause ?? null, null, 2)
    );

    console.error(
      "Respuesta API:",
      JSON.stringify(
        error?.api_response?.body ?? null,
        null,
        2
      )
    );

    console.error(
      "Respuesta adicional:",
      JSON.stringify(error?.response ?? null, null, 2)
    );

    console.error(
      "Datos de la solicitud:",
      JSON.stringify(
        {
          plan: req.body?.plan,
          tieneEmail: Boolean(req.body?.email),
          tieneEmailMP: Boolean(req.body?.mpEmail),
        },
        null,
        2
      )
    );

    return res.status(502).json({
      error:
        "Mercado Pago rechazó la creación de la suscripción.",
      mensaje:
        "Revisá los registros del backend para conocer la causa.",
    });
  }
};

export const webhookMercadoPago = async (req: Request, res: Response): Promise<void> => {
  res.status(200).send("OK");

  try {
    const { type, topic, data } = req.body;
    const evento = type || topic;

    if (evento === 'subscription_preapproval' && data?.id) {
      const preapproval = new PreApproval(client);
      const suscripcionMP = await preapproval.get({ id: data.id });
      
      const refRaw = suscripcionMP.external_reference || "";
      let user = null;
      let planNombre = "";

      if (refRaw.includes("---")) {
        const partes = refRaw.split("---");
        planNombre = partes[1];
        if (partes[0].includes('@')) {
          user = await prisma.user.findUnique({ where: { email: partes[0] } });
        } else {
          user = await prisma.user.findUnique({ where: { id: Number(partes[0]) } });
        }
      } else if (refRaw.includes("_plan_")) {
        const partes = refRaw.split("_plan_");
        planNombre = partes[1];
        const refId = partes[0].replace("user_", "");
        user = await prisma.user.findUnique({ where: { id: Number(refId) } });
      }

      if (user && planNombre) {
        if (suscripcionMP.status === 'authorized') {
          await prisma.user.update({ where: { id: user.id }, data: { plan: planNombre as any } });

          const fechaVencimiento = new Date();
          fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

          await prisma.suscripcion.upsert({
            where: { userId: user.id },
            update: { mpPreapprovalId: suscripcionMP.id, estado: "autorizado", fechaVencimiento },
            create: { userId: user.id, mpPreapprovalId: suscripcionMP.id, estado: "autorizado", fechaVencimiento }
          });
        } else if (suscripcionMP.status === 'cancelled' || suscripcionMP.status === 'paused') {
          await prisma.suscripcion.update({
            where: { userId: user.id },
            data: { estado: suscripcionMP.status }
          });
        }
      }
    }

    if (evento === 'payment' && data?.id) {
      const payment = new Payment(client);
      const infoPago = await payment.get({ id: data.id });

      let user = null;
      if (infoPago.external_reference) {
        const refRaw = infoPago.external_reference;
        if (refRaw.includes("---")) {
          const idStr = refRaw.split("---")[0];
          user = idStr.includes('@') 
            ? await prisma.user.findUnique({ where: { email: idStr } }) 
            : await prisma.user.findUnique({ where: { id: Number(idStr) } });
        } else if (refRaw.includes("_plan_")) {
          const refId = refRaw.split("_plan_")[0].replace("user_", "");
          user = await prisma.user.findUnique({ where: { id: Number(refId) } });
        }
      } else if (infoPago.payer?.email) {
        user = await prisma.user.findUnique({ where: { email: infoPago.payer.email } });
      }

      if (user) {
        const pagoExistente = await prisma.pago.findUnique({ where: { mpPagoId: infoPago.id?.toString() } });
        if (!pagoExistente) {
          await prisma.pago.create({
            data: {
              userId: user.id,
              mpPagoId: infoPago.id?.toString() || data.id.toString(),
              monto: infoPago.transaction_amount || 0,
              moneda: infoPago.currency_id || "ARS",
              estado: infoPago.status || "desconocido",
              metodoPago: infoPago.payment_type_id || "desconocido",
            }
          });
        } else {
          await prisma.pago.update({
            where: { mpPagoId: infoPago.id?.toString() },
            data: { estado: infoPago.status || pagoExistente.estado }
          });
        }
      }
    }
  } catch (error) {
    console.error("Error procesando Webhook de MP:", error);
  }
};

export const cancelarSuscripcion = async (req: any, res: Response): Promise<void> => {
  try {
    const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;
    if (!idBruto) {
      res.status(401).json({ error: "No se pudo extraer el ID del usuario del token." });
      return;
    }

    const userId = Number(idBruto);
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { suscripcion: true } });

    if (!user || !user.suscripcion || !user.suscripcion.mpPreapprovalId) {
      res.status(400).json({ error: "No se encontró una suscripción activa para cancelar." });
      return;
    }

    const preapproval = new PreApproval(client);
    await preapproval.update({ id: user.suscripcion.mpPreapprovalId, body: { status: 'cancelled' } });

    await prisma.suscripcion.update({ where: { userId: user.id }, data: { estado: 'cancelled' } });
    res.json({ success: true, message: "Suscripción cancelada correctamente." });
  } catch (error: any) {
    res.status(500).json({ error: "Error interno al intentar cancelar la suscripción." });
  }
};

export const obtenerHistorialPagos = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user?.userId || req.user?.id || req.usuario?.id || req.userId);
    if (!userId) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }

    const pagos = await prisma.pago.findMany({ where: { userId }, orderBy: { fechaPago: 'desc' } });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: "Error interno al obtener pagos." });
  }
};