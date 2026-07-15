import { Router } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';
import { 
  register, login, refresh, refreshUserData, logout, 
  forgotPassword, resetPassword, verify2FALogin, 
  verifyEmail, resendConfirmationEmail, wipeData 
} from '../controllers/auth.controller';
import { sendMail } from '../utils/mailer'; 
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// --- RUTAS PÚBLICAS (sin token) ---
router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FALogin); 
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/reset-password', resetPassword); 
router.post('/resend-confirmation', resendConfirmationEmail);

// --- RUTAS PROTEGIDAS (requieren token) ---
router.post('/refresh', verificarToken, refreshUserData);

// ✅ CORREGIDO: Token obligatorio + usa req.userId del token (no del body)
router.post('/change-password', verificarToken, async (req, res): Promise<any> => {
  try {
    const { actual, nueva } = req.body;

    if (!actual || !nueva) return res.status(400).json({ error: 'Faltan campos obligatorios.' });

    const usuario = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const passwordCorrecta = await bcrypt.compare(actual, usuario.password);
    if (!passwordCorrecta) return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });

    const salt = await bcrypt.genSalt(10);
    const nuevaPasswordEncriptada = await bcrypt.hash(nueva, salt);

    await prisma.user.update({ where: { id: req.userId }, data: { password: nuevaPasswordEncriptada } });

    return res.json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ✅ CORREGIDO: Token obligatorio + usa req.userId del token
router.put('/2fa', verificarToken, async (req, res): Promise<any> => {
  try {
    const { enabled } = req.body;
    await prisma.user.update({ 
      where: { id: req.userId }, 
      data: { twoFactorEnabled: enabled } 
    });
    res.json({ message: 'Preferencia de 2FA actualizada.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar 2FA' });
  }
});

router.delete('/wipe-data', verificarToken, wipeData);

// ✅ CORREGIDO: Token obligatorio + usa req.userId del token (no el id del body)
router.put('/update-profile', verificarToken, async (req, res): Promise<any> => {
  try {
    const { nombre, email } = req.body;
    if (!nombre || !email) return res.status(400).json({ error: 'Nombre y email son obligatorios.' });

    const usuarioActualizado = await prisma.user.update({
      where: { id: req.userId },
      data: { nombre, email }
    });

    const { password, ...datosPublicos } = usuarioActualizado;
    res.json(datosPublicos);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error al actualizar los datos personales.' });
  }
});

// ✅ CORREGIDO: Token obligatorio + usa req.userId del token
router.post('/request-email-change', verificarToken, async (req, res): Promise<any> => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ error: 'El nuevo email es obligatorio.' });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.user.update({
      where: { id: req.userId },
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

// ✅ CORREGIDO: Token obligatorio + usa req.userId del token
router.post('/verify-email-change', verificarToken, async (req, res): Promise<any> => {
  try {
    const { codigo } = req.body;
    const usuario = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!usuario || usuario.codigoVerificacion !== codigo) {
      return res.status(400).json({ error: 'El código ingresado es incorrecto o expiró.' });
    }

    if (!usuario.emailPendiente) {
      return res.status(400).json({ error: 'No hay un correo pendiente para actualizar.' });
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id: req.userId },
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