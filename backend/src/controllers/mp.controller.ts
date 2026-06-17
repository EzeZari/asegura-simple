import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response): Promise<any> => {
  // 🔥 1. Ahora también extraemos mpEmail (el correo que eligen en el modal)
  const { plan, email, mpEmail } = req.body;

  const planes = {
    BASICO: { title: "Plan Básico - AseguraSimple", price: 100 },
    PROFESIONAL: { title: "Plan Profesional - AseguraSimple", price: 14000 },
    AGENCIA: { title: "Plan Agencia - AseguraSimple", price: 22000 }
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
        // 🔥 2. Mercado Pago usará el mpEmail para validar la cuenta al pagar
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
  // Le respondemos "OK" rápido a MP para que no vuelva a insistir
  res.status(200).send("OK");

  try {
    const { type, topic, data } = req.body;
    
    // 🔥 1. Blindaje: MP a veces manda 'type' y a veces 'topic'. Aceptamos los dos.
    const evento = type || topic;

    // 🔥 2. Registro: Esto aparecerá en los logs de Railway para saber si MP nos está hablando
    if (evento) {
      console.log(`📩 Webhook MP recibido - Evento: ${evento} - ID: ${data?.id}`);
    }

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

            // Calculamos 30 días a partir del momento en que entra el pago
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
  } catch (error) {
    console.error("Error procesando Webhook de MP:", error);
  }
};
// 🔥 NUEVA FUNCIÓN: Cancelar suscripción activa en MP
export const cancelarSuscripcion = async (req: any, res: Response): Promise<any> => {
  try {
    // 🔥 Buscamos el ID en todos los lugares posibles
    const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;

    if (!idBruto) {
      console.error("Token decodificado incompleto:", req.user || req.usuario || req.userId);
      return res.status(401).json({ error: "No se pudo extraer el ID del usuario del token." });
    }

    // Convertimos a Número
    const userId = Number(idBruto);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { suscripcion: true }
    });

    if (!user || !user.suscripcion || !user.suscripcion.mpPreapprovalId) {
      return res.status(400).json({ error: "No se encontró una suscripción activa para cancelar." });
    }

    // 1. Le avisamos a Mercado Pago que cancele el débito automático
    const preapproval = new PreApproval(client);
    await preapproval.update({
      id: user.suscripcion.mpPreapprovalId,
      body: { status: 'cancelled' }
    });

    // 2. Actualizamos nuestra base de datos local
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