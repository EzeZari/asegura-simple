import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response): Promise<any> => {
  const { plan, email } = req.body;

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
        external_reference: `${email}|${plan}` 
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Error creando suscripción en MP:", error);
    res.status(500).json({ error: "No se pudo crear la suscripción" });
  }
};

// 🔥 EL WEBHOOK: Escucha cuando pagan y cuando cancelan
export const webhookMercadoPago = async (req: Request, res: Response) => {
  res.status(200).send("OK");

  try {
    const { type, data } = req.body;

    if (type === 'subscription_preapproval') {
      const preapproval = new PreApproval(client);
      const suscripcionMP = await preapproval.get({ id: data.id });

      const [email, planNombre] = (suscripcionMP.external_reference || "").split("|");

      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (user) {
          // ESCENARIO A: El pago entró perfecto
          if (suscripcionMP.status === 'authorized') {
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: planNombre as any }
            });

            await prisma.suscripcion.upsert({
              where: { userId: user.id },
              update: { mpPreapprovalId: suscripcionMP.id, estado: "autorizado" },
              create: { userId: user.id, mpPreapprovalId: suscripcionMP.id, estado: "autorizado" }
            });

            console.log(`✅ ¡ÉXITO! Suscripción ${planNombre} activada para ${email}`);
          }
          // 🔥 ESCENARIO B: Cancelaron o rebotó la tarjeta
          else if (suscripcionMP.status === 'cancelled' || suscripcionMP.status === 'paused') {
            await prisma.suscripcion.update({
              where: { userId: user.id },
              data: { estado: suscripcionMP.status }
            });
            console.log(`❌ Atención: Suscripción de ${email} pasó a estado ${suscripcionMP.status}. Modo Sólo Lectura activado.`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error procesando Webhook de MP:", error);
  }
};