import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { prisma } from '../config/db';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response): Promise<any> => {
  const { plan, email } = req.body;

  const planes = {
    BASICO: { title: "Plan Básico - AseguraSimple", price: 10 },
    PROFESIONAL: { title: "Plan Profesional - AseguraSimple", price: 14000 },
    AGENCIA: { title: "Plan Agencia - AseguraSimple", price: 22000 }
  };

  const planSeleccionado = planes[plan as keyof typeof planes];
  if (!planSeleccionado) return res.status(400).json({ error: "Plan no válido" });

  try {
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
        payer_email: email,
        // 🔥 Escondemos el email y el plan acá para recuperarlos en el webhook
        external_reference: `${email}|${plan}` 
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Error creando suscripción en MP:", error);
    res.status(500).json({ error: "No se pudo crear la suscripción" });
  }
};

// 🔥 EL WEBHOOK: Escucha a Mercado Pago y actualiza tu modelo Suscripcion
export const webhookMercadoPago = async (req: Request, res: Response) => {
  res.status(200).send("OK");

  try {
    const { type, data } = req.body;

    if (type === 'subscription_preapproval') {
      const preapproval = new PreApproval(client);
      const suscripcionMP = await preapproval.get({ id: data.id });

      if (suscripcionMP.status === 'authorized') {
        const [email, planNombre] = (suscripcionMP.external_reference || "").split("|");

        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });
          
          if (user) {
            // 1. Actualizamos el plan del usuario (GRATUITO, BASICO, etc)
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: planNombre as any }
            });

            // 2. Creamos o actualizamos el registro en la tabla Suscripcion
            await prisma.suscripcion.upsert({
              where: { userId: user.id },
              update: {
                mpPreapprovalId: suscripcionMP.id,
                estado: "autorizado"
              },
              create: {
                userId: user.id,
                mpPreapprovalId: suscripcionMP.id,
                estado: "autorizado"
              }
            });

            console.log(`✅ ¡ÉXITO! Suscripción ${planNombre} activada para ${email}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error procesando Webhook de MP:", error);
  }
};