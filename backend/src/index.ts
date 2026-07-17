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
import estadisticasRoutes from './routes/estadisticas.routes'; // 🔥 1. IMPORTAMOS LA NUEVA RUTA
import alertasRoutes from './routes/alertas.routes';
import agenciaRoutes from './routes/agencia.routes';
import siniestrosRoutes from './routes/siniestros.routes';
import mpRoutes from './routes/mp.routes'; 
import equipoRoutes from './routes/equipo.routes';
import adminRoutes from './routes/admin.routes';
import contactoRoutes from './routes/contacto.routes';

dotenv.config();

const app = express();

// 🔥 LÍNEA MÁGICA PARA RAILWAY: Le avisa a Express que está detrás de un proxy confiable
app.set('trust proxy', 1);

// 1. HELMET: Oculta información sensible del servidor y bloquea ataques comunes en las cabeceras HTTP.
app.use(helmet());

// 2. CORS: El "patovica" de dominios. Solo deja que tu frontend le hable al backend.
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://asegurasimple.com',
    'https://www.asegurasimple.com',
    'https://asegura-simple-flug.vercel.app' 
  ],
  credentials: true 
}));

// 3. RATE LIMIT: Evita ataques de fuerza bruta.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
});
app.use('/api', limiter); 

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- MIDDLEWARES CLÁSICOS ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/asegurados', aseguradosRoutes);
app.use('/api/polizas', polizasRoutes);
app.use('/api/companias', companiasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/estadisticas', estadisticasRoutes); // 🔥 2. LE DECIMOS A EXPRESS QUE ESCUCHE ESTA RUTA
app.use('/api/alertas', alertasRoutes);
app.use('/api/agencia', agenciaRoutes);
app.use('/api/siniestros', siniestrosRoutes);
app.use('/api/pagos', mpRoutes); 
app.use('/api/equipo', equipoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacto', contactoRoutes);

const PORT = process.env.PORT || 3001;

// 🔥 Arrancamos el robot automático (Cron Job)
iniciarTareasProgramadas();

// 🔥 Levantamos el servidor una sola vez
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo y blindado en puerto ${PORT}`);
});