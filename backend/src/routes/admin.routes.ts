import { Router } from 'express';
import { 
  loginAdmin, 
  getAgencias, 
  updatePlan, 
  deleteAgencia, 
  getComunicadoGlobal, 
  updateComunicadoGlobal, 
  updateSuscripcionManual,
  impersonateUser // 🔥 IMPORTAMOS LA NUEVA FUNCIÓN
} from '../controllers/admin.controller';
import { verifyAdminToken } from '../middlewares/adminAuth.middleware';

const router = Router();

// Ruta pública
router.post('/login', loginAdmin);

// Rutas protegidas
router.get('/agencias', verifyAdminToken, getAgencias);
router.put('/agencias/:id/plan', verifyAdminToken, updatePlan); 
router.put('/agencias/:id/suscripcion', verifyAdminToken, updateSuscripcionManual);
router.delete('/agencias/:id', verifyAdminToken, deleteAgencia);

// Comunicados
router.get('/comunicado', verifyAdminToken, getComunicadoGlobal);
router.put('/comunicado', verifyAdminToken, updateComunicadoGlobal);

// 🔥 NUEVA RUTA: MODO DIOS (Impersonar Usuario)
router.post('/agencias/:id/impersonate', verifyAdminToken, impersonateUser);

export default router;