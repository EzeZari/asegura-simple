import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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