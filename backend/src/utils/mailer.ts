import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Esto le dice a Node que ignore el "falso positivo" de seguridad en tu entorno local (o de tu antivirus)
    rejectUnauthorized: false
  }
});