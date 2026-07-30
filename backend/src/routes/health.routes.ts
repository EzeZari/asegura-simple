import { Router } from 'express';
import { checkHealth } from '../controllers/health.controller';

const router = Router();

// La ruta raíz de este router será el health check
router.get('/', checkHealth);

export default router;