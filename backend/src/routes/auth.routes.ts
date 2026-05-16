import { Router } from 'express';
import { prisma } from '../config/db'
import bcrypt from 'bcrypt';
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

// POST: Cambiar contraseña de un usuario logueado
router.post('/change-password', async (req, res) => {
  try {
    const { email, actual, nueva } = req.body;

    if (!email || !actual || !nueva) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // 1. Buscar al usuario
    const usuario = await prisma.user.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // 2. MAGIA: Comparar la contraseña ingresada con la encriptada en la BD
    const passwordCorrecta = await bcrypt.compare(actual, usuario.password);
    
    if (!passwordCorrecta) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
    }

    // 3. MAGIA: Encriptar la NUEVA contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const nuevaPasswordEncriptada = await bcrypt.hash(nueva, salt);

    // 4. Guardar en la base de datos
    await prisma.user.update({
      where: { email },
      data: { password: nuevaPasswordEncriptada }
    });

    return res.json({ message: 'Contraseña actualizada con éxito.' });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;