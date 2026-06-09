import { Router } from 'express';
import { crearSuscripcion } from '../controllers/mp.controller';

const router = Router();
router.post('/create-subscription', crearSuscripcion);

export default router;