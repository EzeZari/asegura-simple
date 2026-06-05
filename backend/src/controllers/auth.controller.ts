import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/db'; 
import crypto from 'crypto'; 
import { transporter } from '../utils/mailer'; 

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
    
    // 🔥 1. Generamos el token de verificación único
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await prisma.user.create({
      data: { 
        nombre, 
        email, 
        telefono, 
        password: hashedPassword,
        verificationToken // Lo guardamos en la base de datos
      },
    });

    // 🔥 2. Armamos la URL que el usuario va a clickear en el mail
    // Usamos req.get('host') para que detecte automáticamente si estás en localhost o en Railway
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const verifyUrl = `${baseUrl}/api/auth/verify-email/${verificationToken}`;

    // 🔥 3. Mandamos el correo
    await transporter.sendMail({
      from: `"AseguraSimple" <${process.env.EMAIL_USER}>`,
      to: newUser.email,
      subject: "Confirmá tu cuenta - AseguraSimple",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #15803d; text-align: center;">¡Bienvenido a AseguraSimple!</h2>
          <p style="color: #374151; font-size: 16px;">Hola ${newUser.nombre},</p>
          <p style="color: #374151; font-size: 16px;">Para poder iniciar sesión y empezar a gestionar tu cartera, necesitamos confirmar que este es tu correo electrónico.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirmar mi cuenta</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
          <p style="color: #6b7280; font-size: 12px; text-align: center; word-break: break-all;">${verifyUrl}</p>
        </div>
      `
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

    // 🔥 4. BLOQUEO: Si no está verificado, no entra
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Por favor, confirmá tu correo electrónico antes de iniciar sesión. Revisá tu bandeja de entrada o spam.' });
    }

    if (user.twoFactorEnabled) {
      const codigo2fa = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.user.update({
        where: { id: user.id },
        data: { codigoVerificacion: codigo2fa }
      });

      console.log(`🔑 CÓDIGO DE ACCESO PARA ${user.email}: ${codigo2fa}`);

      try {
        await transporter.sendMail({
          from: `"AseguraSimple Seguridad" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Código de Seguridad (2FA) - AseguraSimple",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
              <h2 style="color: #15803d; text-align: center;">Código de Acceso</h2>
              <p style="color: #374151; font-size: 16px;">Hola ${user.nombre},</p>
              <p style="color: #374151; font-size: 16px;">Tu código de seguridad para iniciar sesión es:</p>
              <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${codigo2fa}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px; text-align: center;">Si no intentaste iniciar sesión, cambiá tu contraseña de inmediato.</p>
            </div>
          `
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

// 🔥 5. LA FUNCIÓN QUE FALTABA (Se ejecuta cuando tocan el link del mail)
export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  // Le agregamos "as string" para que TypeScript no se queje
  const token = req.params.token as string; 
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const user = await prisma.user.findUnique({ where: { verificationToken: token } });

    if (!user) {
      // Si el token es viejo o no existe, lo mandamos al login con un error en la URL
      return res.redirect(`${frontendUrl}/login?error=invalid_token`);
    }

    // Si está todo bien, lo marcamos como verificado y borramos el token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true, 
        verificationToken: null 
      }
    });

    // Lo redirigimos al login con un mensaje de éxito en la URL
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
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true, 
    sameSite: 'none', 
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
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() } 
      }
    });

    if (!user) return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,    
        resetPasswordExpires: null   
      }
    });

    res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }
};
export const verify2FALogin = async (req: Request, res: Response): Promise<any> => {
  const { userId, codigo } = req.body;

  if (!userId || !codigo) {
    return res.status(400).json({ error: 'Faltan datos de validación.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

    if (!user || user.codigoVerificacion !== codigo) {
      return res.status(400).json({ error: 'Código de seguridad incorrecto.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { codigoVerificacion: null }
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // O 'none' si lo tenías configurado así para cross-domain
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