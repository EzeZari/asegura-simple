import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import 'dotenv/config'; // Asegura que Node lea tu variable DATABASE_URL y los SECRETS del archivo .env
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// 1. Traemos la URL de tu base de datos
const connectionString = process.env.DATABASE_URL;

// 2. Creamos el adaptador que exige Prisma 7
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Inicializamos Prisma pasándole el adaptador
const prisma = new PrismaClient({ adapter });

const app = express();

// Configuración de CORS estricta para permitir el intercambio de cookies con tu frontend
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser()); // Habilitamos la lectura de cookies

// ==========================================
// ESQUEMAS DE VALIDACIÓN CON ZOD
// ==========================================
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

// Función auxiliar para generar tokens
const generateTokens = (userId: number, role: string) => {
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// ==========================================
// RUTA 1: REGISTRO DE USUARIO
// ==========================================
app.post('/api/auth/register', async (req, res): Promise<any> => {
  // Validación estricta con Zod
  const validData = registerSchema.safeParse(req.body);
  if (!validData.success) {
    return res.status(400).json({ error: validData.error.issues[0].message });
  }

  const { nombre, email, telefono, password } = validData.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { nombre, email, telefono, password: hashedPassword },
    });

    res.status(201).json({ message: 'Cuenta creada exitosamente', userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
});

// ==========================================
// RUTA 2: INICIO DE SESIÓN (LOGIN)
// ==========================================
app.post('/api/auth/login', async (req, res): Promise<any> => {
  // Validación con Zod
  const validData = loginSchema.safeParse(req.body);
  if (!validData.success) {
    return res.status(400).json({ error: validData.error.issues[0].message });
  }

  const { email, password } = validData.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Generamos los JWT
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Guardamos el Refresh Token en una cookie httpOnly segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // Devolvemos el Access Token y la data del usuario (ahora incluye el role)
    res.status(200).json({ 
      message: 'Ingreso exitoso', 
      accessToken, 
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
});

// ==========================================
// RUTA 3: REFRESH TOKEN (Renovar sesión)
// ==========================================
app.post('/api/auth/refresh', async (req, res): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No hay sesión activa.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: number };
    
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado. Por favor, iniciá sesión nuevamente.' });
  }
});

// ==========================================
// RUTA 4: LOGOUT (Cerrar sesión)
// ==========================================
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});