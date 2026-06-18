import { sendMail } from '../utils/mailer';
import { templateBienvenida, templateVencimiento, templateSiniestro } from '../utils/emailTemplates';

export const enviarCorreoBienvenida = async (email: string, nombre: string, apellido: string, dni: string, telefono: string) => {
  if (!email || !email.includes('@')) return;

  try {
    await sendMail({
      to: email,
      subject: `¡Bienvenido a nuestra Agencia, ${nombre}!`,
      html: templateBienvenida(nombre, apellido, dni, telefono)
    });
  } catch (error) {
    console.error("Error al enviar mail de bienvenida:", error);
  }
};

export const enviarAvisoVencimiento = async (
  email: string, nombre: string, nroPoliza: string, compania: string, 
  tipoPoliza: string, cobertura: string, fechaVencimiento: string,
  patente?: string | null, marca?: string | null, modelo?: string | null,
  ubicacionRiesgo?: string | null, cantidadEmpleados?: string | null
) => {
  if (!email || !email.includes('@')) return;

  try {
    await sendMail({
      to: email,
      subject: `Aviso Importante: Vencimiento de cobertura - Póliza #${nroPoliza}`,
      html: templateVencimiento(
        nombre, nroPoliza, compania, tipoPoliza, cobertura, fechaVencimiento, 
        patente, marca, modelo, ubicacionRiesgo, cantidadEmpleados
      )
    });
  } catch (error) {
    console.error("Error en el email service:", error);
  }
};

export const enviarNotificacionSiniestro = async (
  email: string, nombre: string, nroSiniestro: string, nroPoliza: string, 
  compania: string, tipoPoliza: string, patente: string | null, 
  asuntoPersonalizado: string, descripcionNovedad: string, urlSeguimiento: string
) => {
  if (!email || !email.includes('@')) return;

  try {
    await sendMail({
      to: email,
      subject: `${asuntoPersonalizado} - Trámite #${nroSiniestro}`,
      html: templateSiniestro(
        nombre, nroSiniestro, nroPoliza, compania, tipoPoliza, 
        patente, descripcionNovedad, urlSeguimiento
      )
    });
  } catch (error) {
    console.error("Error en el servicio de email al enviar alerta de siniestro:", error);
  }
};
export const enviarCorreoInvitacion = async (email: string, nombre: string, contrasena: string, jefeNombre: string) => {
  if (!email || !email.includes('@')) return;

  try {
    const loginUrl = process.env.FRONTEND_URL || 'https://asegurasimple.com/login';

    await sendMail({
      to: email,
      subject: `¡Fuiste invitado a AseguraSimple por ${jefeNombre}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">AseguraSimple</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #333333;">
            <h2 style="margin-top: 0;">¡Hola, ${nombre}!</h2>
            <p><strong>${jefeNombre}</strong> te ha invitado a unirte a su equipo de trabajo en AseguraSimple.</p>
            <p>Ya tenés una cuenta creada. Para ingresar, utilizá las siguientes credenciales temporales:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${contrasena}</p>
            </div>

            <p style="font-size: 14px; color: #666;"><em>Te recomendamos cambiar tu contraseña una vez que ingreses al sistema.</em></p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${loginUrl}" style="background-color: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Ingresar a la Plataforma
              </a>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">© ${new Date().getFullYear()} AseguraSimple. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    });
    console.log(`📧 Mail de invitación enviado a ${email}`);

  } catch (error) {
    console.error("Error al enviar el correo de invitación:", error);
  }
};