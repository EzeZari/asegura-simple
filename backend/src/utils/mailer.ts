<<<<<<< HEAD
import { Resend } from 'resend';
=======
import nodemailer from 'nodemailer';
import dns from 'dns';
>>>>>>> daeac1a1c3c1c6b562a9da0c0c71d3a73ce2c298
import dotenv from 'dotenv';

dotenv.config();

<<<<<<< HEAD
const resend = new Resend(process.env.RESEND_API_KEY);
=======
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
>>>>>>> daeac1a1c3c1c6b562a9da0c0c71d3a73ce2c298

export const sendMail = async ({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const { error } = await resend.emails.send({
    from: 'AseguraSimple <noreply@asegurasimple.com>',
    to,
    subject,
    html
  });

  if (error) {
    throw new Error(error.message);
  }
};