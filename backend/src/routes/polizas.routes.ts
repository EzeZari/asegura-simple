import { Router } from 'express';
import * as polizasController from '../controllers/polizas.controller';
import { upload } from '../middlewares/upload.middleware';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// 🔥 Aplicamos el patovica a TODO el archivo de una sola vez, igual que en Asegurados
router.use(verificarToken);

router.get('/', polizasController.obtenerTodas);
router.get('/:id', polizasController.obtenerPorId);
router.post('/', polizasController.crearPoliza);
router.put('/:id', polizasController.actualizarPoliza);
router.delete('/:id', polizasController.eliminarPoliza);
router.post('/importar', polizasController.importarPolizas);
router.post('/:id/avisar-vencimiento', polizasController.avisarVencimiento);
router.post('/:id/subir-pdf', upload.single('pdf'), polizasController.subirPdf);

export default router;