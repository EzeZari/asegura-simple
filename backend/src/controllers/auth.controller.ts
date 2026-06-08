import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db'; 
import crypto from 'crypto'; 
import { sendMail } from '../utils/mailer';
import { templateConfirmacionCuenta, template2FA, templateRecuperarPassword } from '../utils/emailTemplates'; // ← Importamos las plantillas

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
      html: templateConfirmacionCuenta(newUser.nombre, verifyUrl) // ← Usamos la plantilla
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
    const user = await prisma.user.findUnique({ where: { email } });
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
          html: template2FA(user.nombre, codigo2fa) // ← Usamos la plantilla
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ 
      message: 'Ingreso exitoso', 
      accessToken, 
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled } 
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
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });

    if (!user) return res.redirect(`${frontendUrl}/login?error=invalid_token`);

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });

    return res.redirect(`${frontendUrl}/login?verified=true`);
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
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado.' });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    res.status(200).json({ 
      accessToken,
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled }
    });
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
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
      html: templateRecuperarPassword(user.nombre, resetUrl) // ← Usamos la plantilla
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
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user || user.codigoVerificacion !== codigo) {
      return res.status(400).json({ error: 'Código de seguridad incorrecto.' });
    }

    await prisma.user.update({ where: { id: user.id }, data: { codigoVerificacion: null } });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ 
      message: 'Ingreso exitoso', 
      accessToken, 
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al verificar el código.' });
  }
};