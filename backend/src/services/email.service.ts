import { sendMail } from '../utils/mailer';
import { 
  templateBienvenida, 
  templateVencimiento, 
  templateSiniestro,
  templateInvitacionEquipo,
  templateContacto // 🔥 Agregamos esta
} from '../utils/emailTemplates';

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
      html: templateInvitacionEquipo(nombre, jefeNombre, email, contrasena, loginUrl)
    });
    
    console.log(`📧 Mail de invitación enviado a ${email}`);
  } catch (error) {
    console.error("Error al enviar el correo de invitación:", error);
  }
};
export const enviarCorreoContacto = async (nombre: string, email: string, mensaje: string) => {
  try {
    await sendMail({
      to: 'asegurasimple@gmail.com', // 🔥 Todo llega directo acá
      subject: `🚨 Nueva consulta en AseguraSimple de ${nombre}`,
      html: templateContacto(nombre, email, mensaje)
    });
    console.log(`📧 Mail de contacto recibido de ${email}`);
  } catch (error) {
    console.error("Error al enviar el correo de contacto:", error);
  }
};