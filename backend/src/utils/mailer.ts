import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 🔥 Le agregamos "as any" al final del objeto para que TypeScript en Railway nos deje compilar
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4, // La magia para evitar el ENETUNREACH
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