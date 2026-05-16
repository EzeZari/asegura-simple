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
// PUT: Activar/Desactivar 2FA
router.put('/2fa', async (req, res) => {
  try {
    const { email, enabled } = req.body;
    await prisma.user.update({
      where: { email },
      data: { twoFactorEnabled: enabled }
    });
    res.json({ message: 'Preferencia de 2FA actualizada.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar 2FA' });
  }
});

// DELETE: Zona de Peligro (Vaciar Base de Datos)
router.delete('/wipe-data', async (req, res) => {
  try {
    const { email, confirmacion } = req.body;
    if (confirmacion !== "ELIMINAR") {
      return res.status(400).json({ error: 'Confirmación inválida.' });
    }

    // Borramos todas las pólizas, asegurados y actividades
    // (Asegurate de que estos nombres coincidan con tus modelos en Prisma)
    await prisma.actividad.deleteMany();
    await prisma.poliza.deleteMany();
    await prisma.asegurado.deleteMany();

    res.json({ message: 'Base de datos vaciada con éxito.' });
  } catch (error) {
    console.error("Error al vaciar datos:", error);
    res.status(500).json({ error: 'Error interno al vaciar la base de datos.' });
  }
});
export default router;