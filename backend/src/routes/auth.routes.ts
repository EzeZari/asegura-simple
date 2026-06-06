import { Router } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';
import { register, login, refresh, logout, forgotPassword, resetPassword, verify2FALogin, verifyEmail } from '../controllers/auth.controller';
import { sendMail } from '../utils/mailer'; // ← cambio

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FALogin); 
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/reset-password', resetPassword); 

router.post('/change-password', async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    const { actual, nueva } = req.body;

    if (!email || !actual || !nueva) return res.status(400).json({ error: 'Faltan campos obligatorios.' });

    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const passwordCorrecta = await bcrypt.compare(actual, usuario.password);
    if (!passwordCorrecta) return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });

    const salt = await bcrypt.genSalt(10);
    const nuevaPasswordEncriptada = await bcrypt.hash(nueva, salt);

    await prisma.user.update({ where: { email }, data: { password: nuevaPasswordEncriptada } });

    return res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.put('/2fa', async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    const { enabled } = req.body;
    await prisma.user.update({ where: { email }, data: { twoFactorEnabled: enabled } });
    res.json({ message: 'Preferencia de 2FA actualizada.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar 2FA' });
  }
});

router.delete('/wipe-data', async (req, res) => {
  try {
    const { confirmacion } = req.body;
    if (confirmacion !== "ELIMINAR") return res.status(400).json({ error: 'Confirmación inválida.' });

    await prisma.actividad.deleteMany();
    await prisma.poliza.deleteMany();
    await prisma.asegurado.deleteMany();

    res.json({ message: 'Base de datos vaciada con éxito.' });
  } catch (error) {
    console.error("Error al vaciar datos:", error);
    res.status(500).json({ error: 'Error interno al vaciar la base de datos.' });
  }
});

router.put('/update-profile', async (req, res) => {
  try {
    const { id, nombre, email } = req.body;
    if (!id || !nombre || !email) return res.status(400).json({ error: 'ID, nombre y email son obligatorios.' });

    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { nombre, email }
    });

    const { password, ...datosPublicos } = usuarioActualizado;
    res.json(datosPublicos);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error al actualizar los datos personales.' });
  }
});

router.post('/request-email-change', async (req, res) => {
  try {
    const { id, newEmail } = req.body;
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: Number(id) },
      data: { codigoVerificacion: codigo, emailPendiente: newEmail }
    });

    await sendMail({
      to: newEmail,
      subject: "Código de Verificación - AseguraSimple",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #15803d; text-align: center;">Verificación de Cambio de Correo</h2>
          <p style="color: #374151; font-size: 16px;">Hola,</p>
          <p style="color: #374151; font-size: 16px;">Tu código de verificación es:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${codigo}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">Si no solicitaste este cambio, podés ignorar este correo.</p>
        </div>
      `
    });

    res.json({ message: 'Código enviado con éxito.' });
  } catch (error) {
    console.error("Error al solicitar cambio de email:", error);
    res.status(500).json({ error: 'Error al enviar el código de verificación.' });
  }
});

router.post('/verify-email-change', async (req, res) => {
  try {
    const { id, codigo } = req.body;
    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!usuario || usuario.codigoVerificacion !== codigo) {
      return res.status(400).json({ error: 'El código ingresado es incorrecto o expiró.' });
    }

    if (!usuario.emailPendiente) {
      return res.status(400).json({ error: 'No hay un correo pendiente para actualizar.' });
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { email: usuario.emailPendiente, codigoVerificacion: null, emailPendiente: null }
    });

    const { password, ...datosPublicos } = usuarioActualizado;
    res.json(datosPublicos);
  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({ error: 'Error interno al verificar el código.' });
  }
});

export default router;