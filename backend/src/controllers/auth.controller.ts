import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db'; 
import crypto from 'crypto'; 
import { sendMail } from '../utils/mailer';
import { templateConfirmacionCuenta, template2FA, templateRecuperarPassword } from '../utils/emailTemplates';

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Formato de email inválido").toLowerCase(), 
  telefono: z.string().min(8, "El teléfono es muy corto"),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/, "La contraseña no cumple los requisitos de seguridad"),
});

const loginSchema = z.object({
  email: z.string().email("Formato de email inválido").toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const generateTokens = (userId: number, role: string) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<any> => {
  const validData = registerSchema.safeParse(req.body);
  if (!validData.success) return res.status(400).json({ error: validData.error.issues[0].message });

  const { nombre, email, telefono, password } = validData.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await prisma.user.create({
      data: { nombre, email, telefono, password: hashedPassword, verificationToken },
    });

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const verifyUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;

    await sendMail({
      to: newUser.email,
      subject: "Confirmá tu cuenta - AseguraSimple",
      html: templateConfirmacionCuenta(newUser.nombre, verifyUrl)
    });

    res.status(201).json({ message: 'Cuenta creada. Revisá tu correo.', userId: newUser.id });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: 'Ocurrió un error al crear la cuenta.' });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const validData = loginSchema.safeParse(req.body);
  if (!validData.success) return res.status(400).json({ error: validData.error.issues[0].message });

  const { email, password } = validData.data;

  try {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { suscripcion: true } 
    });
    
    if (!user) return res.status(400).json({ error: 'Credenciales incorrectas.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Credenciales incorrectas.' });

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Por favor, confirmá tu correo electrónico antes de iniciar sesión. Revisá tu bandeja de entrada o spam.' });
    }

    if (user.twoFactorEnabled) {
      const codigo2fa = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.user.update({
        where: { id: user.id },
        data: { codigoVerificacion: codigo2fa }
      });

      try {
        await sendMail({
          to: user.email,
          subject: "Código de Seguridad (2FA) - AseguraSimple",
          html: template2FA(user.nombre, codigo2fa)
        });
      } catch (errorMail) {
        console.error("Falló el envío del código 2FA:", errorMail);
        return res.status(500).json({ error: 'Hubo un problema al enviar el correo de seguridad.' });
      }

      return res.status(200).json({
        message: 'Código 2FA enviado al correo.',
        require2FA: true,
        userId: user.id
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ 
      message: 'Ingreso exitoso', 
      accessToken, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        role: user.role,
        jefeId: user.jefeId,
        twoFactorEnabled: user.twoFactorEnabled,
        plan: user.plan, 
        suscripcion: user.suscripcion 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  const token = req.params.token as string; 
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const userByToken = await prisma.user.findUnique({ where: { verificationToken: token } });

    if (userByToken) {
      await prisma.user.update({
        where: { id: userByToken.id },
        data: { isVerified: true, verificationToken: null }
      });
      const urlDestino = `${frontendUrl}/planes?email=${encodeURIComponent(userByToken.email)}`;
      return res.redirect(urlDestino);
    }

    return res.redirect(`${frontendUrl}/login?error=invalid_token`);
  } catch (error) {
    console.error("Error al verificar email:", error);
    return res.redirect(`${frontendUrl}/login?error=server_error`);
  }
};

export const refresh = async (req: Request, res: Response): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No hay sesión activa.' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: number };
    
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      include: { suscripcion: true }
    });
    
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado.' });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    res.status(200).json({ 
      accessToken,
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        role: user.role, 
        jefeId: user.jefeId,
        twoFactorEnabled: user.twoFactorEnabled,
        plan: user.plan, 
        suscripcion: user.suscripcion 
      }
    });
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

export const logout = (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', { 
    httpOnly: true, 
    secure: isProd, 
    sameSite: isProd ? 'none' : 'lax' 
  });
  res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  const email = req.body.email?.toLowerCase(); 
  if (!email) return res.status(400).json({ error: 'El email es obligatorio' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'Si el email está registrado, recibirás un enlace de recuperación.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); 

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: tokenExpiry }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/nueva-contrasena?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: 'Recuperá tu contraseña - AseguraSimple',
      html: templateRecuperarPassword(user.nombre, resetUrl) 
    });

    res.status(200).json({ message: 'Si el email está registrado, recibirás un enlace de recuperación.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });

  try {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } }
    });

    if (!user) return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null }
    });

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }
};

export const verify2FALogin = async (req: Request, res: Response): Promise<any> => {
  const { userId, codigo } = req.body;
  if (!userId || !codigo) return res.status(400).json({ error: 'Faltan datos de validación.' });

  try {
    const user = await prisma.user.findUnique({ 
      where: { id: Number(userId) },
      include: { suscripcion: true }
    });

    if (!user || user.codigoVerificacion !== codigo) {
      return res.status(400).json({ error: 'Código de seguridad incorrecto.' });
    }

    await prisma.user.update({ where: { id: user.id }, data: { codigoVerificacion: null } });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ 
      message: 'Ingreso exitoso', 
      accessToken, 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        email: user.email, 
        role: user.role, 
        jefeId: user.jefeId,
        twoFactorEnabled: user.twoFactorEnabled,
        plan: user.plan,
        suscripcion: user.suscripcion 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al verificar el código.' });
  }
};

export const resendConfirmationEmail = async (req: Request, res: Response): Promise<any> => {
  const email = req.body.email?.toLowerCase();
  
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio para reenviar la confirmación.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Esta cuenta ya está verificada. Podés iniciar sesión directamente.' });
    }

    const newVerificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: newVerificationToken }
    });

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const verifyUrl = `${baseUrl}/api/auth/verify-email/${newVerificationToken}`;

    await sendMail({
      to: user.email,
      subject: "Confirmá tu cuenta - AseguraSimple",
      html: templateConfirmacionCuenta(user.nombre, verifyUrl)
    });

    return res.status(200).json({ message: 'Correo de confirmación reenviado con éxito.' });
  } catch (error) {
    console.error("Error al reenviar correo de confirmación:", error);
    return res.status(500).json({ error: 'Ocurrió un error en el servidor al intentar reenviar el correo.' });
  }
};

export const refreshUserData = async (req: any, res: Response): Promise<any> => {
  try {
    const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;

    if (!idBruto) {
      console.error("Token decodificado incompleto:", req.user || req.usuario || req.userId);
      return res.status(401).json({ error: "No se pudo extraer el ID del usuario del token." });
    }

    const userId = Number(idBruto);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { suscripcion: true }
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const accessToken = jwt.sign(
      { userId: user.id, id: user.id, email: user.email, plan: user.plan, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      user: {
        ...user,
        jefeId: user.jefeId 
      }, 
      accessToken 
    });
  } catch (error) {
    console.error("Error al refrescar datos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔥 FUNCIÓN WIPE DATA TOTALMENTE BLINDADA
export const wipeData = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, confirmacion } = req.body;

    if (confirmacion !== "ELIMINAR") {
      return res.status(400).json({ error: "Palabra de confirmación incorrecta." });
    }

    // Buscamos al usuario que hace la petición
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    // Identificamos a qué Agencia (Productor) pertenece este usuario
    const idAgencia = user.jefeId ? user.jefeId : user.id;
    const productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });

    if (!productor) {
      return res.status(404).json({ error: "No se encontró el perfil de productor." });
    }

    const productorId = productor.id;

    // 🔥 PREVENCIÓN DE CASCADA: Buscamos primero los IDs de todo lo que le pertenece
    const asegurados = await prisma.asegurado.findMany({ where: { productorId }, select: { id: true } });
    const aseguradoIds = asegurados.map(a => a.id);

    const polizas = await prisma.poliza.findMany({ where: { aseguradoId: { in: aseguradoIds } }, select: { id: true } });
    const polizaIds = polizas.map(p => p.id);

    const siniestros = await prisma.siniestro.findMany({ where: { polizaId: { in: polizaIds } }, select: { id: true } });
    const siniestroIds = siniestros.map(s => s.id);

    // 🔥 BORRADO SEGURO CON TRANSACCIÓN (Solo afecta a los IDs calculados arriba)
    await prisma.$transaction([
      prisma.notificacion.deleteMany({ where: { siniestroId: { in: siniestroIds } } }),
      prisma.linkConsulta.deleteMany({ where: { siniestroId: { in: siniestroIds } } }),
      prisma.historialSiniestro.deleteMany({ where: { productorId } }),
      prisma.notaSiniestro.deleteMany({ where: { productorId } }),
      prisma.siniestro.deleteMany({ where: { polizaId: { in: polizaIds } } }),
      prisma.alerta.deleteMany({ where: { productorId } }),
      prisma.poliza.deleteMany({ where: { aseguradoId: { in: aseguradoIds } } }),
      prisma.compania.deleteMany({ where: { productorId } }),
      prisma.asegurado.deleteMany({ where: { productorId } }),
      prisma.actividad.deleteMany({ where: { productorId } })
    ]);

    res.status(200).json({ message: "La base de datos de tu agencia fue vaciada exitosamente." });
  } catch (error) {
    console.error("Error al vaciar datos:", error);
    res.status(500).json({ error: "Ocurrió un error crítico al vaciar los datos." });
  }
};