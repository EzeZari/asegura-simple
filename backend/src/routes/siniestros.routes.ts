import { Router } from 'express';
import * as siniestrosController from '../controllers/siniestros.controller';

const router = Router();

router.get('/', siniestrosController.getSiniestros);
router.get('/:id', siniestrosController.getSiniestroById); // <-- NUEVA
router.post('/', siniestrosController.createSiniestro);
router.post('/:id/notas', siniestrosController.agregarNota); // <-- NUEVA
router.put('/:id', siniestrosController.updateSiniestro);
router.delete('/:id', siniestrosController.deleteSiniestro);

export default router;