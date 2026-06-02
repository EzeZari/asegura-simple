import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { iniciarTareasProgramadas } from './services/cron.service';

import authRoutes from './routes/auth.routes';
import aseguradosRoutes from './routes/asegurados.routes';
import polizasRoutes from './routes/polizas.routes';
import companiasRoutes from './routes/companias.routes';
import dashboardRoutes from './routes/dashboard.routes';
import alertasRoutes from './routes/alertas.routes';
import agenciaRoutes from './routes/agencia.routes';
import siniestrosRoutes from './routes/siniestros.routes';
dotenv.config();

const app = express();

// 1. HELMET: Oculta información sensible del servidor y bloquea ataques comunes en las cabeceras HTTP.
app.use(helmet());

// 2. CORS: El "patovica" de dominios. Solo deja que tu frontend (localhost:3000) le hable al backend.
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://asegurasimple.com',
    'https://www.asegurasimple.com',
    'https://asegura-simple-flug.vercel.app' // Agregamos también el link genérico de Vercel por las dudas
  ],
  credentials: true // Fundamental para que pasen las cookies
}));

// 3. RATE LIMIT: Evita ataques de fuerza bruta.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
});
app.use('/api', limiter); // Se lo aplicamos a todas las rutas de la API

// Hacer pública la carpeta de uploads para poder acceder a los archivos desde el navegador
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- MIDDLEWARES CLÁSICOS ---
app.use(express.json());
app.use(cookieParser());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/asegurados', aseguradosRoutes);
app.use('/api/polizas', polizasRoutes);
app.use('/api/companias', companiasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/agencia', agenciaRoutes);
app.use('/api/siniestros', siniestrosRoutes);

const PORT = process.env.PORT || 3001;

// 🔥 Arrancamos el robot automático (Cron Job)
iniciarTareasProgramadas();

// 🔥 Levantamos el servidor una sola vez
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo y blindado en http://localhost:${PORT}`);
});