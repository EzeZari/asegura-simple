import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db'; // Importamos la DB que separamos recién
import crypto from 'crypto'; // Viene incluido en Node.js, sirve para generar códigos aleatorios
import { transporter } from '../utils/mailer'; // Tu cartero

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Formato de email inválido"),
  telefono: z.string().min(8, "El teléfono es muy corto"),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/, "La contraseña no cumple los requisitos de seguridad"),
});

const loginSchema = z.object({
  email: z.string().email("Formato de email inválido"),
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
    const newUser = await prisma.user.create({
      data: { nombre, email, telefono, password: hashedPassword },
    });

    res.status(201).json({ message: 'Cuenta creada exitosamente', userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
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
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
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
    
    // ESTA ES LA LÍNEA QUE FALTA:
    res.status(200).json({ 
      accessToken,
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El email es obligatorio' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Por seguridad, si el usuario no existe, devolvemos OK igual para que los hackers no puedan adivinar qué correos están registrados.
    if (!user) {
      return res.status(200).json({ message: 'Si el email está registrado, recibirás un enlace de recuperación.' });
    }

    // 1. Generamos un código secreto temporal
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // Vence en 1 hora

    // 2. Lo guardamos en la base de datos de este usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiry
      }
    });

    // 3. Armamos el enlace que lo va a llevar de vuelta a tu frontend
    const resetUrl = `http://localhost:3000/nueva-contrasena?token=${resetToken}`;

    // 4. Le mandamos el correo usando tu Gmail
    await transporter.sendMail({
      from: `"AseguraSimple" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Recuperá tu contraseña - AseguraSimple',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #15803d;">AseguraSimple</h2>
          <p>Hola ${user.nombre},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #15803d; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
          <p>Este enlace es válido por 1 hora.</p>
          <p style="font-size: 12px; color: #666;">Si no solicitaste este cambio, podés ignorar este correo tranquilamente.</p>
        </div>
      `
    });

    res.status(200).json({ message: 'Si el email está registrado, recibirás un enlace de recuperación.' });
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ error: 'Ocurrió un error al intentar enviar el correo.' });
  }
};
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  try {
    // 1. Buscamos al usuario que tenga ese token y que NO esté vencido
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() } // "gt" significa mayor que (no vencido)
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });
    }

    // 2. Hasheamos la nueva contraseña (igual que en el registro)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Actualizamos al usuario y LIMPIAMOS los campos del token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,    // Ya no sirve más
        resetPasswordExpires: null   // Ya no sirve más
      }
    });

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }
};