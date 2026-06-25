import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval, Payment } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response): Promise<any> => {
  const { plan, email, mpEmail } = req.body;

  // 🔥 NUEVOS PRECIOS ESTRATÉGICOS
  const planes = {
    BASICO: { title: "Plan Básico - AseguraSimple", price: 9990 },
    PROFESIONAL: { title: "Plan Profesional - AseguraSimple", price: 14990 },
    AGENCIA: { title: "Plan Agencia - AseguraSimple", price: 24990 }
  };

  const planSeleccionado = planes[plan as keyof typeof planes];
  if (!planSeleccionado) return res.status(400).json({ error: "Plan no válido" });

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { suscripcion: true }
    });
    
    if (user && user.plan === plan && user.suscripcion?.estado === 'autorizado') {
      return res.status(400).json({ 
        error: `Ya tenés el ${planSeleccionado.title} activo. No es necesario que vuelvas a pagar.` 
      });
    }

    const preapproval = new PreApproval(client);
    
    const result = await preapproval.create({
      body: {
        reason: planSeleccionado.title,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planSeleccionado.price,
          currency_id: 'ARS' 
        },
        back_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?exito=true`,
        external_reference: `${email}|${plan}`,
        payer_email: mpEmail || email 
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error creando suscripción en MP:", error);
    res.status(500).json({ error: `Backend crash: ${error.message || 'Error desconocido'}` });
  }
};

export const webhookMercadoPago = async (req: Request, res: Response) => {
  res.status(200).send("OK");

  try {
    const { type, topic, data } = req.body;
    const evento = type || topic;

    if (evento) {
      console.log(`📩 Webhook MP recibido - Evento: ${evento} - ID: ${data?.id}`);
    }

    // --- A. EVENTOS DE SUSCRIPCIÓN (Creación/Cancelación) ---
    if (evento === 'subscription_preapproval' && data?.id) {
      const preapproval = new PreApproval(client);
      const suscripcionMP = await preapproval.get({ id: data.id });

      const [email, planNombre] = (suscripcionMP.external_reference || "").split("|");

      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        
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
              update: {
                mpPreapprovalId: suscripcionMP.id,
                estado: "autorizado",
                fechaVencimiento: fechaVencimiento
              },
              create: {
                userId: user.id,
                mpPreapprovalId: suscripcionMP.id,
                estado: "autorizado",
                fechaVencimiento: fechaVencimiento
              }
            });

            console.log(`✅ ¡ÉXITO TOTAL! Suscripción ${planNombre} activada en DB para ${email}.`);
          }
          else if (suscripcionMP.status === 'cancelled' || suscripcionMP.status === 'paused') {
            await prisma.suscripcion.update({
              where: { userId: user.id },
              data: { estado: suscripcionMP.status }
            });
            console.log(`❌ Atención: Suscripción de ${email} cancelada/pausada.`);
          }
        }
      }
    }

    // --- B. EVENTOS DE PAGO (Las cuotas mensuales que entran) ---
    if (evento === 'payment' && data?.id) {
      const payment = new Payment(client);
      const infoPago = await payment.get({ id: data.id });

      let email = "";
      if (infoPago.external_reference) {
        email = infoPago.external_reference.split("|")[0];
      } else if (infoPago.payer?.email) {
        email = infoPago.payer.email;
      }

      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          const pagoExistente = await prisma.pago.findUnique({
            where: { mpPagoId: infoPago.id?.toString() }
          });

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
            console.log(`💰 ¡Caja! Pago de $${infoPago.transaction_amount} registrado para ${email}`);
          } else {
            await prisma.pago.update({
              where: { mpPagoId: infoPago.id?.toString() },
              data: { estado: infoPago.status || pagoExistente.estado }
            });
          }

          // 🔥 LA SOLUCIÓN AL "BUG DEL MES 2": Renovamos por 30 días si el pago es aprobado
          if (infoPago.status === 'approved') {
            const nuevaFechaVencimiento = new Date();
            nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + 30);

            await prisma.suscripcion.updateMany({
              where: { userId: user.id },
              data: { 
                estado: 'autorizado',
                fechaVencimiento: nuevaFechaVencimiento 
              }
            });
            console.log(`🔄 Suscripción de ${email} extendida por 30 días exitosamente.`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error procesando Webhook de MP:", error);
  }
};

// 🔥 FUNCIÓN: Cancelar suscripción activa en MP (Restaurada)
export const cancelarSuscripcion = async (req: any, res: Response): Promise<any> => {
  try {
    const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;

    if (!idBruto) {
      console.error("Token decodificado incompleto:", req.user || req.usuario || req.userId);
      return res.status(401).json({ error: "No se pudo extraer el ID del usuario del token." });
    }

    const userId = Number(idBruto);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { suscripcion: true }
    });

    if (!user || !user.suscripcion || !user.suscripcion.mpPreapprovalId) {
      return res.status(400).json({ error: "No se encontró una suscripción activa para cancelar." });
    }

    const preapproval = new PreApproval(client);
    await preapproval.update({
      id: user.suscripcion.mpPreapprovalId,
      body: { status: 'cancelled' }
    });

    await prisma.suscripcion.update({
      where: { userId: user.id },
      data: { estado: 'cancelled' }
    });

    res.json({ success: true, message: "Suscripción cancelada correctamente." });
  } catch (error: any) {
    console.error("Error al cancelar suscripción en MP:", error);
    res.status(500).json({ error: "Error interno al intentar cancelar la suscripción." });
  }
};

// 🔥 FUNCIÓN: Obtener historial de pagos (Restaurada)
export const obtenerHistorialPagos = async (req: any, res: Response): Promise<any> => {
  try {
    const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;
    const userId = Number(idBruto);

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const pagos = await prisma.pago.findMany({
      where: { userId },
      orderBy: { fechaPago: 'desc' }
    });

    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener historial de pagos:", error);
    res.status(500).json({ error: "Error interno al obtener pagos." });
  }
};