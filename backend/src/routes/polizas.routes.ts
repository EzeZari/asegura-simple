import { Router } from 'express';
import { 
  obtenerTodas, obtenerPorId, crearPoliza, 
  actualizarPoliza, eliminarPoliza, avisarVencimiento, 
  subirPdf, importarPolizas 
} from '../controllers/polizas.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { verificarRol } from '../middlewares/role.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// 🟢 LECTURA: Todos los autenticados (Dueño, Admin Secundario y Empleado)
router.get('/', verificarToken, obtenerTodas);
router.get('/:id', verificarToken, obtenerPorId);

// 🔴 ESCRITURA/MODIFICACIÓN: Solo Dueño y Admin Secundario ('PRODUCTOR')
router.post('/', verificarToken, verificarRol(['DUENO', 'PRODUCTOR']), crearPoliza);
router.put('/:id', verificarToken, verificarRol(['DUENO', 'PRODUCTOR']), actualizarPoliza);
router.delete('/:id', verificarToken, verificarRol(['DUENO', 'PRODUCTOR']), eliminarPoliza);
router.post('/:id/aviso', verificarToken, verificarRol(['DUENO', 'PRODUCTOR']), avisarVencimiento);
router.post('/:id/subir-pdf', verificarToken, verificarRol(['DUENO', 'PRODUCTOR']), upload.single('pdf'), subirPdf);
router.post('/importar', verificarToken, verificarRol(['DUENO', 'PRODUCTOR']), importarPolizas);

export default router;