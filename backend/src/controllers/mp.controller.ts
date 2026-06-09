import { Request, Response } from 'express';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

// Configuramos el cliente con tu clave
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

export const crearSuscripcion = async (req: Request, res: Response) => {
  const { plan, email } = req.body;

  // 🔥 ACTUALIZADO: Precios en Pesos Argentinos
  const planes = {
    BASICO: { title: "Plan Básico - AseguraSimple", price: 8000 },
    PROFESIONAL: { title: "Plan Profesional - AseguraSimple", price: 14000 },
    AGENCIA: { title: "Plan Agencia - AseguraSimple", price: 22000 }
  };

  const planSeleccionado = planes[plan as keyof typeof planes];

  try {
    const preapproval = new PreApproval(client);
    
    const result = await preapproval.create({
      body: {
        reason: planSeleccionado.title,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planSeleccionado.price,
          currency_id: 'ARS' // 🔥 ACTUALIZADO: Pesos Argentinos
        },
        back_url: `${process.env.FRONTEND_URL}/configuracion/planes/exito`,
        payer_email: email
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error("Error creando suscripción en MP:", error);
    res.status(500).json({ error: "No se pudo crear la suscripción" });
  }
};