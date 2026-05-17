import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Nos aseguramos de que las variables de entorno estén cargadas
dotenv.config();

// Creamos el transportador con tu configuración exacta para Gmail
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Esto le dice a Node que ignore el "falso positivo" de seguridad en tu entorno local
    rejectUnauthorized: false
  }
});

// Verificamos la conexión apenas arranca el servidor
transporter.verify().then(() => {
  console.log('✅ Servidor de correos (Nodemailer) conectado exitosamente con Gmail.');
}).catch((error) => {
  console.error('❌ Error al conectar Nodemailer. Revisá tu EMAIL_USER y EMAIL_PASS en el .env:', error);
});