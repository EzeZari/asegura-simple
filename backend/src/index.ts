import express from 'express';
import dotenv from 'dotenv';
// 🔥 SENTRY 1: Importamos los paquetes arriba de todo
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

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
import estadisticasRoutes from './routes/estadisticas.routes';
import alertasRoutes from './routes/alertas.routes';
import agenciaRoutes from './routes/agencia.routes';
import siniestrosRoutes from './routes/siniestros.routes';
import mpRoutes from './routes/mp.routes'; 
import equipoRoutes from './routes/equipo.routes';
import adminRoutes from './routes/admin.routes';
import contactoRoutes from './routes/contacto.routes';
import healthRoutes from './routes/health.routes';

dotenv.config();

// 🔥 SENTRY 2: Inicializamos la configuración (Debe ir ANTES de armar la app)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  // 1.0 significa que captura el 100% de los errores
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://asegurasimple.com',
    'https://www.asegurasimple.com',
    'https://asegura-simple-flug.vercel.app' 
  ],
  credentials: true 
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
});
app.use('/api', limiter); 

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// --- RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/asegurados', aseguradosRoutes);
app.use('/api/polizas', polizasRoutes);
app.use('/api/companias', companiasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/agencia', agenciaRoutes);
app.use('/api/siniestros', siniestrosRoutes);
app.use('/api/pagos', mpRoutes); 
app.use('/api/equipo', equipoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/health', healthRoutes); // 🟢 El Health Check de UptimeRobot

// 🔥 SENTRY 3: Atrapamos los errores (Debe ir SIEMPRE después de las rutas y antes del listen)
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 3001;

// 🤖 Arrancamos los mails automáticos (Preventivos + Críticos)
iniciarTareasProgramadas();

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo y blindado en puerto ${PORT}`);
});