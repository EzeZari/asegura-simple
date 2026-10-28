import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response): Promise<void> => {
  const { plan, email, mpEmail } = req.body;

  if (!email) {
    res.status(400).json({ error: "Faltan datos obligatorios del usuario." });
    return;
  }

  const planes = {
    BASICO: { title: "AseguraSimple Basico", price: 9990 }, 
    PROFESIONAL: { title: "AseguraSimple Profesional", price: 14990 },
    AGENCIA: { title: "AseguraSimple Agencia", price: 24990 }
  };

  const planSeleccionado = planes[plan as keyof typeof planes];
  if (!planSeleccionado) {
    res.status(400).json({ error: "Plan no válido" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { suscripcion: true }
    });
    
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado en la base de datos." });
      return;
    }

    if (user.plan === plan && user.suscripcion?.estado === 'autorizado') {
      res.status(400).json({ error: `Ya tenés el plan activo. No es necesario que vuelvas a pagar.` });
      return;
    }

    let frontendUrl = process.env.FRONTEND_URL || 'https://www.asegurasimple.com';
    if (!frontendUrl.startsWith('http')) frontendUrl = `https://${frontendUrl}`; 
    if (frontendUrl.endsWith('/')) frontendUrl = frontendUrl.slice(0, -1);

    const correoPago = (mpEmail || email).trim().toLowerCase();

    const bodyMP = {
      reason: planSeleccionado.title,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planSeleccionado.price,
        currency_id: 'ARS' 
      },
      back_url: `${frontendUrl}/login`, 
      external_reference: `${user.id}---${plan}`,
      payer_email: correoPago
    };

    const preapproval = new PreApproval(client);
    const result = await preapproval.create({ body: bodyMP });

    // ¡ÉXITO! Si pasa esto, te redirige a Mercado Pago
    res.json({ init_point: result.init_point });
  } catch (error: any) {
    let errorExacto = error.message || "Error de conexión";
    
    // 🔥 EL SECRETO: Extraemos la causa exacta que el SDK de Mercado Pago oculta
    if (error.api_response && error.api_response.body && error.api_response.body.cause && error.api_response.body.cause.length > 0) {
      errorExacto = error.api_response.body.cause.map((c: any) => `Campo [${c.data}]: ${c.description}`).join(' | ');
    } else if (error.response && error.response.cause && error.response.cause.length > 0) {
      errorExacto = error.response.cause.map((c: any) => `Campo [${c.data}]: ${c.description}`).join(' | ');
    }
    
    console.error("=== ERROR REAL MP ===", errorExacto);
    res.status(500).json({ error: `MP rechazó el pago. Motivo exacto: ${errorExacto}` });
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