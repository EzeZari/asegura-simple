import { Router } from 'express';
import { loginAdmin, getAgencias, updatePlan } from '../controllers/admin.controller';
import { verifyAdminToken } from '../middlewares/adminAuth.middleware';

const router = Router();

// Ruta pública (Login)
router.post('/login', loginAdmin);

// Rutas protegidas (Requieren token de Super Admin)
router.get('/agencias', verifyAdminToken, getAgencias);
router.put('/agencias/:id/plan', verifyAdminToken, updatePlan); // 🔥 NUEVA RUTA PARA CAMBIAR PLAN

export default router;