import { Router } from 'express';
import { crearSugerencia } from '../controllers/sugerencia.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos la ruta para que solo usuarios logueados puedan enviar sugerencias
router.post('/', verificarToken, crearSugerencia);

export default router;