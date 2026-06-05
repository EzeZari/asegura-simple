import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  // 🔥 CAMBIOS CLAVE: Usamos el puerto 587 y secure en false
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4, 
  logger: true,
  debug: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
} as any);

transporter.verify()
  .then(() => {
    console.log("🚀 Servidor de correos conectado y listo para enviar.");
  })
  .catch((error) => {
    console.error("❌ Error de correo:", error.message);
  });