import { Router } from 'express';
import * as polizasController from '../controllers/polizas.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', polizasController.obtenerTodas);
router.get('/:id', polizasController.obtenerPorId);
router.post('/', polizasController.crearPoliza);
router.put('/:id', polizasController.actualizarPoliza);
router.delete('/:id', polizasController.eliminarPoliza);
router.post('/importar', polizasController.importarPolizas);
router.post('/:id/avisar-vencimiento', polizasController.avisarVencimiento);
router.post('/:id/subir-pdf', upload.single('pdf'), polizasController.subirPdf);

export default router;