import { Router } from 'express';
import * as siniestrosController from '../controllers/siniestros.controller';

const router = Router();

router.get('/', siniestrosController.getSiniestros);
router.post('/', siniestrosController.createSiniestro);
router.put('/:id', siniestrosController.updateSiniestro);
router.delete('/:id', siniestrosController.deleteSiniestro);

export default router;