import { Router } from 'express';
import * as polizasController from '../controllers/polizas.controller';
import { upload } from '../middlewares/upload.middleware';
import { verificarToken } from '../middlewares/auth.middleware';
import { verificarSuscripcionActiva } from '../middlewares/suscripcion.middleware'; // 🔥 El nuevo middleware

const router = Router();

// 🔥 Aplicamos los patovicas a TODO el archivo de una sola vez
router.use(verificarToken);
router.use(verificarSuscripcionActiva); // 🛡️ Deja leer (GET), pero bloquea crear/editar (POST/PUT/DELETE) si no pagó

router.get('/', polizasController.obtenerTodas);
router.get('/:id', polizasController.obtenerPorId);
router.post('/', polizasController.crearPoliza);
router.put('/:id', polizasController.actualizarPoliza);
router.delete('/:id', polizasController.eliminarPoliza);
router.post('/importar', polizasController.importarPolizas);
router.post('/:id/avisar-vencimiento', polizasController.avisarVencimiento);
router.post('/:id/subir-pdf', upload.single('pdf'), polizasController.subirPdf);

export default router;