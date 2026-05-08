import { Router } from 'express';
// 1. Asegurate de que resetPassword esté en esta lista de acá arriba:
import { register, login, refresh, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

// 2. Esta es la puerta que el frontend no estaba encontrando (¡agregala!):
router.post('/reset-password', resetPassword); 

export default router;