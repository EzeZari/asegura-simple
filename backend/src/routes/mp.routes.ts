import { Router } from 'express';
import { crearSuscripcion, webhookMercadoPago } from '../controllers/mp.controller';

const router = Router();

// El frontend llama acá para crear el link de pago
router.post('/create-subscription', crearSuscripcion);

// Mercado Pago llama acá por detrás para avisarnos del pago
router.post('/webhook', webhookMercadoPago); 

export default router;