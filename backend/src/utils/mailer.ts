import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Forzamos IPv4 a nivel global de Node.js
dns.setDefaultResultOrder('ipv4first');

export const transporter = nodemailer.createTransport({
  host: '142.251.163.108', // IP directa de smtp.gmail.com (evitamos el DNS completamente)
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com' // Le decimos cuál es el host real para el certificado
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

transporter.verify()
  .then(() => {
    console.log("🚀 Servidor de correos conectado y listo para enviar.");
  })
  .catch((error) => {
    console.error("❌ Error de correo:", error.message);
  });