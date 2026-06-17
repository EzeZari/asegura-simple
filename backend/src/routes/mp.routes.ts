import { Router } from 'express';
// 🔥 1. Sumamos cancelarSuscripcion a la importación
import { crearSuscripcion, webhookMercadoPago, cancelarSuscripcion } from '../controllers/mp.controller';
// 🔥 2. Importamos el middleware de seguridad
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// El frontend llama acá para crear el link de pago
router.post('/create-subscription', crearSuscripcion);

// Mercado Pago llama acá por detrás para avisarnos del pago
router.post('/webhook', webhookMercadoPago); 

// 🔥 3. La ruta nueva para que el usuario cancele su débito automático
router.post('/cancelar', verificarToken, cancelarSuscripcion);

export default router;