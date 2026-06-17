import { Router } from 'express';
// 🔥 Agregamos obtenerHistorialPagos
import { crearSuscripcion, webhookMercadoPago, cancelarSuscripcion, obtenerHistorialPagos } from '../controllers/mp.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// El frontend llama acá para crear el link de pago
router.post('/create-subscription', crearSuscripcion);

// Mercado Pago llama acá por detrás para avisarnos del pago
router.post('/webhook', webhookMercadoPago); 

// 🔥 3. La ruta nueva para que el usuario cancele su débito automático
router.post('/cancelar', verificarToken, cancelarSuscripcion);

router.get('/historial', verificarToken, obtenerHistorialPagos);
export default router;