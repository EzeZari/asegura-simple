import { transporter } from '../utils/mailer';

export const enviarCorreoBienvenida = async (email: string, nombre: string, apellido: string, dni: string, telefono: string) => {
  if (!email || !email.includes('@')) return;

  try {
    await transporter.sendMail({
      from: `"AseguraSimple" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `¡Bienvenido a nuestra Agencia, ${nombre}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #15803d; margin: 0;">AseguraSimple</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Tu tranquilidad, en buenas manos</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 20px;" />
          <p style="color: #374151; font-size: 16px; leading-relaxed: 1.5;">Hola <strong>${nombre} ${apellido || ''}</strong>,</p>
          <p style="color: #374151; font-size: 16px; leading-relaxed: 1.5;">Queremos darte la bienvenida formal a nuestra agencia. Ya te encontrás registrado en nuestra plataforma de gestión de seguros.</p>
          
          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827; font-size: 14px; text-transform: uppercase; tracking-wider: 0.05em;">Tus datos registrados:</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #4b5563;"><strong>Documento / CUIT:</strong> ${dni}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #4b5563;"><strong>Teléfono de contacto:</strong> ${telefono || '-'}</p>
          </div>

          <p style="color: #374151; font-size: 16px;">Próximamente vas a recibir las copias digitales de tus pólizas vigentes y avisos de vencimiento directamente en esta casilla.</p>
          <p style="color: #374151; font-size: 16px; margin-top: 30px;">Ante cualquier consulta, no dudes en responder a este correo.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; text-align: center;">Este es un correo automático enviado por el sistema de gestión de AseguraSimple.</p>
        </div>
      `
    });
  } catch (error) {
    console.error("Error al enviar mail de bienvenida:", error);
  }
};