import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import aseguradosRoutes from './routes/asegurados.routes'; // Ajustá la ruta según tu carpeta
import polizasRoutes from './routes/polizas.routes';
import companiasRoutes from './routes/companias.routes';
import dashboardRoutes from './routes/dashboard.routes'; // <-- Agregá esto arriba

dotenv.config();

const app = express();

// 1. HELMET: Oculta información sensible del servidor y bloquea ataques comunes en las cabeceras HTTP.
app.use(helmet());

// 2. CORS: El "patovica" de dominios. Solo deja que tu frontend (localhost:3000) le hable al backend.
app.use(cors({
  origin: 'http://localhost:3000', // Cuando lo subas a internet, acá va tu dominio real (.com)
  credentials: true // Fundamental para que pasen las cookies
}));

// 3. RATE LIMIT: Evita ataques de fuerza bruta (ej: alguien intentando adivinar contraseñas 1000 veces por segundo).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
});
app.use('/api', limiter); // Se lo aplicamos a todas las rutas de la API

// --- MIDDLEWARES CLÁSICOS ---
app.use(express.json());
app.use(cookieParser());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/asegurados', aseguradosRoutes);
app.use('/api/polizas', polizasRoutes);
app.use('/api/companias', companiasRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo y blindado en http://localhost:${PORT}`);
});