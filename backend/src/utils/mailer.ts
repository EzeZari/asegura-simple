import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // 🔥 Obligamos a apuntar al host explícito
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  // 🔥 LA MAGIA PARA RAILWAY: Fuerza a usar IPv4 para evitar el error ENETUNREACH
  family: 4, 
  logger: true,
  debug: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify()
  .then(() => {
    console.log("🚀 Servidor de correos conectado y listo para enviar.");
  })
  .catch((error) => {
    console.error("❌ Error de correo:", error.message);
  });