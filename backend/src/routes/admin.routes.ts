import { Router } from 'express';
import { loginAdmin, getAgencias, updatePlan, deleteAgencia } from '../controllers/admin.controller';
import { verifyAdminToken } from '../middlewares/adminAuth.middleware';

const router = Router();

// Ruta pública (Login)
router.post('/login', loginAdmin);

// Rutas protegidas (Requieren token de Super Admin)
router.get('/agencias', verifyAdminToken, getAgencias);
router.put('/agencias/:id/plan', verifyAdminToken, updatePlan); 
router.delete('/agencias/:id', verifyAdminToken, deleteAgencia); // 🔥 NUEVA RUTA PARA ELIMINAR

export default router;