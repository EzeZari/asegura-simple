import { Router } from 'express';
// 🔥 Importamos las nuevas funciones del comunicado
import { loginAdmin, getAgencias, updatePlan, deleteAgencia, getComunicadoGlobal, updateComunicadoGlobal } from '../controllers/admin.controller';
import { verifyAdminToken } from '../middlewares/adminAuth.middleware';

const router = Router();

// Ruta pública (Login)
router.post('/login', loginAdmin);

// Rutas protegidas (Requieren token de Super Admin)
router.get('/agencias', verifyAdminToken, getAgencias);
router.put('/agencias/:id/plan', verifyAdminToken, updatePlan); 
router.delete('/agencias/:id', verifyAdminToken, deleteAgencia);

// 🔥 NUEVAS RUTAS: Control del Banner de Comunicados
router.get('/comunicado', verifyAdminToken, getComunicadoGlobal);
router.put('/comunicado', verifyAdminToken, updateComunicadoGlobal);

export default router;