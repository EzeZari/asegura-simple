import { Router } from 'express';
import { obtenerEquipo, agregarMiembro, eliminarMiembro } from '../controllers/equipo.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { verificarRol } from '../middlewares/role.middleware'; // 🔥 IMPORTAMOS EL GUARDIA

const router = Router();

// Todos los autenticados pueden ver el equipo (Dueño, Productores y Vendedores)
router.get('/', verificarToken, obtenerEquipo);

// 🔥 SOLO EL DUEÑO puede invitar nuevos miembros o eliminarlos
router.post('/', verificarToken, verificarRol(['DUENO']), agregarMiembro);
router.delete('/:id', verificarToken, verificarRol(['DUENO']), eliminarMiembro);

export default router;