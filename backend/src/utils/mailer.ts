import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  // 🔥 Le decimos que se rinda a los 3 segundos en vez de esperar un minuto
  connectionTimeout: 3000,
  greetingTimeout: 3000,
  socketTimeout: 3000,
});

// ❌ Borramos el transporter.verify() de acá abajo para que no explote al prender el servidor