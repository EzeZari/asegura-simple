import { Router } from 'express';
import { 
  loginAdmin, 
  getAgencias, 
  updatePlan, 
  updateSuscripcionManual, 
  deleteAgencia, 
  getComunicadoGlobal, 
  updateComunicadoGlobal, 
  impersonateUser, 
  getEstadisticasAdmin,
  getDescuentos,
  createDescuento,
  updateDescuento,
  deleteDescuento
} from '../controllers/admin.controller';
import { verifyAdminToken } from '../middlewares/adminAuth.middleware';

const router = Router();

// Rutas base
router.post('/login', loginAdmin);
router.get('/agencias', verifyAdminToken, getAgencias);
router.put('/agencias/:id/plan', verifyAdminToken, updatePlan);
router.put('/agencias/:id/suscripcion', verifyAdminToken, updateSuscripcionManual);
router.delete('/agencias/:id', verifyAdminToken, deleteAgencia);

// 🔥 ACÁ ESTÁ EL CAMBIO: Lo pasamos a SINGULAR para que coincida con tu frontend
router.get('/comunicado', getComunicadoGlobal);
router.put('/comunicado', verifyAdminToken, updateComunicadoGlobal);

router.post('/impersonate/:id', verifyAdminToken, impersonateUser);
router.get('/estadisticas', verifyAdminToken, getEstadisticasAdmin);

// Rutas de descuentos
router.get('/descuentos', verifyAdminToken, getDescuentos);
router.post('/descuentos', verifyAdminToken, createDescuento);
router.put('/descuentos/:id', verifyAdminToken, updateDescuento);
router.delete('/descuentos/:id', verifyAdminToken, deleteDescuento);

export default router;