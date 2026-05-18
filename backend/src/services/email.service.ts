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

export const enviarAvisoVencimiento = async (
  email: string, 
  nombre: string, 
  nroPoliza: string, 
  compania: string, 
  tipoPoliza: string, 
  cobertura: string, 
  fechaVencimiento: string
) => {
  if (!email || !email.includes('@')) return;

  try {
    await transporter.sendMail({
      from: `"AseguraSimple" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Aviso Importante: Vencimiento de cobertura - Póliza #${nroPoliza}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; border-top: 6px solid #ea580c;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #ea580c; margin: 0; font-size: 22px;">Recordatorio de Vencimiento</h2>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Evitá quedarte sin cobertura en tus bienes</p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hola <strong>${nombre}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Te contactamos desde nuestra agencia para informarte que tu póliza de seguro está próxima a finalizar su vigencia de cobertura. A continuación, te detallamos los datos técnicos del riesgo:</p>
          
          <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <table style="width: 100%; font-size: 14px; color: #4b5563; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #9a3412; width: 35%;">Póliza Nro:</td>
                <td style="padding: 6px 0; color: #1f2937; font-family: monospace; font-size: 15px;">#${nroPoliza}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Compañía:</td>
                <td style="padding: 6px 0; color: #1f2937; font-weight: 600;">${compania}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Ramo / Riesgo:</td>
                <td style="padding: 6px 0; color: #1f2937;">${tipoPoliza}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #9a3412;">Plan / Cobertura:</td>
                <td style="padding: 6px 0; color: #1f2937; italic;">${cobertura || 'Detalle según condiciones generales'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #c2410c; font-size: 15px; border-top: 1px dashed #fed7aa;">FECHA FIN:</td>
                <td style="padding: 8px 0; color: #9a3412; font-size: 16px; font-weight: bold; border-top: 1px dashed #fed7aa;">${fechaVencimiento} a las 12:00 hs</td>
              </tr>
            </table>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;"><strong>¿Cómo proceder?</strong><br>Para coordinar la renovación del riesgo o evaluar mejoras en los costos y planes vigentes, simplemente podés responder a este correo electrónico o comunicarte directamente a nuestras vías de contacto habituales.</p>
          
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 0;">Este es un aviso informativo automatizado enviado por el asesor de seguros a través de AseguraSimple.</p>
        </div>
      `
    });
  } catch (error) {
    console.error("Error en el email service:", error);
  }
};