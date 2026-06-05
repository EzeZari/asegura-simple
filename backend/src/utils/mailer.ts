import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // 🔥 Le dice a Node que ignore la barrera del antivirus
  tls: {
    rejectUnauthorized: false
  },
  // 🔥 MODO ESPÍA ACTIVADO: Nos va a imprimir toda la charla interna con Google
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