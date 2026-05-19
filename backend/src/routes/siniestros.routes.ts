import { Router } from 'express';
import * as siniestrosController from '../controllers/siniestros.controller';

const router = Router();

// Rutas Estándar de Gestión Privada
router.get('/', siniestrosController.getSiniestros);
router.get('/:id', siniestrosController.getSiniestroById);
router.post('/', siniestrosController.createSiniestro);
router.post('/:id/notas', siniestrosController.agregarNota);
router.put('/:id', siniestrosController.updateSiniestro);
router.delete('/:id', siniestrosController.deleteSiniestro);

// 🔥 NUEVAS RUTAS DE CONSULTA EXTERNA
router.post('/:id/generar-link', siniestrosController.obtenerOGenerarLink); // Genera el token seguro
router.get('/publico/consulta/:token', siniestrosController.getSiniestroPublicoPorToken); // API que usará el cliente sin login

export default router;