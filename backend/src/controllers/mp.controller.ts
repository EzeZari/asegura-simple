import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response): Promise<any> => {
  const { plan, email, mpEmail } = req.body;

  // 🔥 1. SÚPER DEBUGGER ACTIVADO (No lo sacamos más)
  console.log("=== DEBUG MP SUPER DETALLADO ===");
  console.log("Plan a comprar:", plan);
  console.log("Email de la cuenta:", email);
  console.log("Email para pagar (mpEmail):", mpEmail);
  console.log("================================");

  if (!email) return res.status(400).json({ error: "Faltan datos obligatorios del usuario." });

  // Títulos ultra limpios sin tildes ni guiones por las dudas
  const planes = {
    BASICO: { title: "AseguraSimple Basico", price: 9990 }, 
    PROFESIONAL: { title: "AseguraSimple Profesional", price: 14990 },
    AGENCIA: { title: "AseguraSimple Agencia", price: 24990 }
  };

  const planSeleccionado = planes[plan as keyof typeof planes];
  if (!planSeleccionado) return res.status(400).json({ error: "Plan no válido" });

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { suscripcion: true }
    });
    
    if (!user) return res.status(404).json({ error: "Usuario no encontrado en la base de datos." });

    if (user.plan === plan && user.suscripcion?.estado === 'autorizado') {
      return res.status(400).json({ 
        error: `Ya tenés el plan activo. No es necesario que vuelvas a pagar.` 
      });
    }

    let frontendUrl = process.env.FRONTEND_URL || 'https://www.asegurasimple.com';
    if (!frontendUrl.startsWith('http')) frontendUrl = `https://${frontendUrl}`; 
    if (frontendUrl.endsWith('/')) frontendUrl = frontendUrl.slice(0, -1);

    const referenciaSegura = `${user.id}---${plan}`;
    
    // 🔥 MERCADO PAGO REQUIERE EL EMAIL DEL PAGADOR. LO VOLVEMOS A PONER.
    const correoPago = (mpEmail || email).trim().toLowerCase();

    const bodyMP = {
      reason: planSeleccionado.title,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planSeleccionado.price,
        currency_id: 'ARS' 
      },
      back_url: `${frontendUrl}/login?exito=true`,
      external_reference: referenciaSegura,
      payer_email: correoPago
    };

    console.log("JSON enviado a Mercado Pago:", JSON.stringify(bodyMP, null, 2));

    const preapproval = new PreApproval(client);
    const result = await preapproval.create({ body: bodyMP });

    res.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("=== ERROR COMPLETO DE MERCADO PAGO ===");
    
    let detallesExcepcion = "Error general de conexión";
    
    // 🔥 2. EXTRACCIÓN MILIMÉTRICA DEL ERROR DE MERCADO PAGO
    if (error.cause && Array.isArray(error.cause) && error.cause.length > 0) {
        // Extraemos qué propiedad exactamente rechazó (ej. 'payer_email' o 'back_url')
        detallesExcepcion = error.cause.map((c: any) => `Causa: ${c.description} (Código: ${c.code})`).join(' | ');
    } else if (error.response && error.response.message) {
        detallesExcepcion = error.response.message;
    } else if (error.message) {
        detallesExcepcion = error.message;
    }
    
    console.error(detallesExcepcion);
    
    // Esto va a hacer que el cartel verde/rojo de tu página te diga EL MOTIVO EXACTO.
    res.status(500).json({ error: `Rechazo MP: ${detallesExcepcion}` });
  }
};

export const webhookMercadoPago = async (req: Request, res: Response) => {
  res.status(200).send("OK");

  try {
    const { type, topic, data } = req.body;
    const evento = type || topic;

    if (evento === 'subscription_preapproval' && data?.id) {
      const preapproval = new PreApproval(client);
      const suscripcionMP = await preapproval.get({ id: data.id });

      const partesRef = (suscripcionMP.external_reference || "").split("---");
      const refId = partesRef[0];
      const planNombre = partesRef[1];

      if (refId && planNombre) {
        let user = null;
        if (refId.includes('@')) {
          user = await prisma.user.findUnique({ where: { email: refId } });
        } else {
          user = await prisma.user.findUnique({ where: { id: Number(refId) } });
        }
        
        if (user) {
          if (suscripcionMP.status === 'authorized') {
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: planNombre as any }
            });

            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

            await prisma.suscripcion.upsert({
              where: { userId: user.id },
              update: { mpPreapprovalId: suscripcionMP.id, estado: "autorizado", fechaVencimiento: fechaVencimiento },
              create: { userId: user.id, mpPreapprovalId: suscripcionMP.id, estado: "autorizado", fechaVencimiento: fechaVencimiento }
            });
            console.log(`✅ Éxito: Suscripción activada para el usuario ID ${user.id}.`);
          }
          else if (suscripcionMP.status === 'cancelled' || suscripcionMP.status === 'paused') {
            await prisma.suscripcion.update({
              where: { userId: user.id },
              data: { estado: suscripcionMP.status }
            });
          }
        }
      }
    }

    if (evento === 'payment' && data?.id) {
      const payment = new Payment(client);
      const infoPago = await payment.get({ id: data.id });

      let user = null;
      
      if (infoPago.external_reference) {
        const refId = infoPago.external_reference.split("---")[0];
        if (refId.includes('@')) {
          user = await prisma.user.findUnique({ where: { email: refId } });
        } else {
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

export const cancelarSuscripcion = async (req: any, res: Response): Promise<any> => {
  try {
    const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;
    if (!idBruto) return res.status(401).json({ error: "No se pudo extraer el ID del usuario del token." });

    const userId = Number(idBruto);
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { suscripcion: true } });

    if (!user || !user.suscripcion || !user.suscripcion.mpPreapprovalId) {
      return res.status(400).json({ error: "No se encontró una suscripción activa para cancelar." });
    }

    const preapproval = new PreApproval(client);
    await preapproval.update({ id: user.suscripcion.mpPreapprovalId, body: { status: 'cancelled' } });

    await prisma.suscripcion.update({ where: { userId: user.id }, data: { estado: 'cancelled' } });
    res.json({ success: true, message: "Suscripción cancelada correctamente." });
  } catch (error: any) {
    res.status(500).json({ error: "Error interno al intentar cancelar la suscripción." });
  }
};

export const obtenerHistorialPagos = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = Number(req.user?.userId || req.user?.id || req.usuario?.id || req.userId);
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const pagos = await prisma.pago.findMany({ where: { userId }, orderBy: { fechaPago: 'desc' } });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: "Error interno al obtener pagos." });
  }
};