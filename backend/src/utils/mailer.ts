import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async ({
  to,
  subject,
  html,
  attachments // 🔥 NUEVO: Soporte para adjuntos
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: any[]; // 🔥 NUEVO: Es opcional, por si mandamos mails sin archivo
}) => {
  const payload: any = {
    from: 'AseguraSimple <noreply@asegurasimple.com>',
    to,
    subject,
    html
  };

  // Si nos pasan adjuntos, los sumamos al paquete
  if (attachments && attachments.length > 0) {
    payload.attachments = attachments;
  }

  const { error } = await resend.emails.send(payload);

  if (error) {
    throw new Error(error.message);
  }
};