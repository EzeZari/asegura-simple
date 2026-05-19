import { Router } from 'express';
import { prisma } from '../config/db'
import bcrypt from 'bcrypt';
// 1. Asegurate de que resetPassword esté en esta lista de acá arriba:
import { register, login, refresh, logout, forgotPassword, resetPassword, verify2FALogin } from '../controllers/auth.controller'; // <--- Fijate que sumé verify2FALogin al final
import { transporter } from '../utils/mailer'; 

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FALogin); 
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
// PUT: Actualizar datos del perfil personal
router.put('/update-profile', async (req, res) => {
  try {
    const { id, nombre, email } = req.body;

    if (!id || !nombre || !email) {
      return res.status(400).json({ error: 'ID, nombre y email son obligatorios.' });
    }

    // Actualizamos el usuario
    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { nombre, email }
    });

    // Devolvemos el usuario actualizado (sin la contraseña por seguridad)
    const { password, ...datosPublicos } = usuarioActualizado;
    res.json(datosPublicos);

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: 'Error al actualizar los datos personales.' });
  }
});
// POST: Paso 1 - Solicitar cambio de email (Genera código y envía mail)
router.post('/request-email-change', async (req, res) => {
  try {
    const { id, newEmail } = req.body;

    // 1. Generar un código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Guardar el código y el email pendiente en la base de datos
    await prisma.user.update({
      where: { id: Number(id) },
      data: { 
        codigoVerificacion: codigo,
        emailPendiente: newEmail
      }
    });

    // 3. Enviar el correo usando tu transporter
    await transporter.sendMail({
      from: `"AseguraSimple" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: "Código de Verificación - AseguraSimple",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #15803d; text-align: center;">Verificación de Cambio de Correo</h2>
          <p style="color: #374151; font-size: 16px;">Hola,</p>
          <p style="color: #374151; font-size: 16px;">Has solicitado cambiar tu correo de acceso en AseguraSimple. Tu código de verificación es:</p>
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

// POST: Paso 2 - Verificar código y aplicar el nuevo email
router.post('/verify-email-change', async (req, res) => {
  try {
    const { id, codigo } = req.body;

    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!usuario || usuario.codigoVerificacion !== codigo) {
      return res.status(400).json({ error: 'El código ingresado es incorrecto o expiró.' });
    }

    // --> ESTA ES LA VALIDACIÓN QUE LE FALTABA A TYPESCRIPT <--
    if (!usuario.emailPendiente) {
      return res.status(400).json({ error: 'No hay un correo pendiente para actualizar.' });
    }

    // Si el código es correcto, actualizamos el email real y limpiamos los temporales
    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { 
        email: usuario.emailPendiente, // Ahora TS sabe que 100% es un string y no un null
        codigoVerificacion: null,
        emailPendiente: null
      }
    });

    // Devolvemos el usuario sin la contraseña
    const { password, ...datosPublicos } = usuarioActualizado;
    res.json(datosPublicos);

  } catch (error) {
    console.error("Error al verificar código:", error);
    res.status(500).json({ error: 'Error interno al verificar el código.' });
  }
});
export default router;