import { Router } from 'express';
import { obtenerEquipo, agregarMiembro, eliminarMiembro } from '../controllers/equipo.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, obtenerEquipo);
router.post('/', verificarToken, agregarMiembro);
router.delete('/:id', verificarToken, eliminarMiembro);

export default router;