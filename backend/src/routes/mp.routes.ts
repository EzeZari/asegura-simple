
import { Router, Request, Response } from 'express';
import {
  crearSuscripcion,
  webhookMercadoPago,
  cancelarSuscripcion,
  obtenerHistorialPagos,
} from '../controllers/mp.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * DIAGNÓSTICO TEMPORAL DE MERCADO PAGO
 *
 * Comprueba si el Access Token configurado en Railway
 * permite autenticar una petición contra Mercado Pago.
 *
 * IMPORTANTE:
 * Eliminar esta ruta después de terminar el diagnóstico.
 */
router.get(
  '/diagnostico-token',
  async (_req: Request, res: Response): Promise<void> => {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();

    if (!token) {
      res.status(500).json({
        ok: false,
        paso: 'configuracion',
        error: 'Falta MERCADO_PAGO_ACCESS_TOKEN en el backend.',
      });
      return;
    }

    try {
      const respuesta = await fetch(
        'https://api.mercadopago.com/users/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        res.status(200).json({
          ok: false,
          paso: 'autenticacion',
          httpStatus: respuesta.status,
          error:
            datos?.message ??
            'Mercado Pago rechazó la autenticación.',
        });
        return;
      }

      res.status(200).json({
        ok: true,
        paso: 'autenticacion',
        httpStatus: respuesta.status,
        mensaje: 'El token permitió autenticar la consulta.',
      });
    } catch (error: unknown) {
      console.error(
        'Error en diagnóstico de Mercado Pago:',
        error instanceof Error ? error.message : 'Error desconocido',
      );

      res.status(200).json({
        ok: false,
        paso: 'conexion',
        error: 'No se pudo completar la consulta a Mercado Pago.',
      });
    }
  },
);

// Crear una suscripción
router.post('/create-subscription', crearSuscripcion);

// Webhook de Mercado Pago
router.post('/webhook', webhookMercadoPago);

// Cancelar una suscripción
router.post('/cancelar', verificarToken, cancelarSuscripcion);

// Historial de pagos
router.get('/historial', verificarToken, obtenerHistorialPagos);

export default router;
