import { sendMail } from '../utils/mailer';
import { prisma } from '../config/db'; 
import { 
  templateBienvenida, 
  templateVencimiento, 
  templateSiniestro,
  templateInvitacionEquipo,
  templateContacto,
  templateAlertaError,
  templateAvisoSuscripcion,
  templateSuscripcionVencida 
} from '../utils/emailTemplates';

// 🔥 Función interna: El botón de pánico que te avisa a vos
export const enviarAlertaErrorSistema = async (funcion: string, detalleError: any, datosExtra: string) => {
  try {
    await sendMail({
      to: 'asegurasimple@gmail.com',
      subject: `🚨 URGENTE: Error en AseguraSimple (${funcion})`,
      html: templateAlertaError(funcion, detalleError, datosExtra)
    });
  } catch (error) {
    console.error("Fallo crítico: No se pudo enviar ni la alerta de error", error);
  }
};

// ============================================================================
// CORREOS PARA CLIENTES (INCLUYEN FIRMA DINÁMICA DE LA AGENCIA)
// ============================================================================

export const enviarCorreoBienvenida = async (email: string, nombre: string, apellido: string, dni: string, telefono: string) => {
  if (!email || !email.includes('@')) return;

  try {
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });

    await sendMail({
      to: email,
      subject: `¡Bienvenido a nuestra Agencia, ${nombre}!`,
      html: templateBienvenida(nombre, apellido, dni, telefono, agencia) 
    });
  } catch (error: any) {
    console.error("Error al enviar mail de bienvenida:", error);
    await enviarAlertaErrorSistema('enviarCorreoBienvenida', error.message || error, `Cliente: ${nombre} ${apellido} | Email: ${email}`);
  }
};

export const enviarAvisoVencimiento = async (
  email: string, nombre: string, nroPoliza: string, compania: string, 
  tipoPoliza: string, cobertura: string, fechaVencimiento: string,
  patente?: string | null, marca?: string | null, modelo?: string | null,
  ubicacionRiesgo?: string | null, cantidadEmpleados?: string | null,
  cuponeraUrl?: string | null 
) => {
  if (!email || !email.includes('@')) return;

  try {
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });

    let attachments = [];
    if (cuponeraUrl) {
      attachments.push({
        filename: `Cupon_de_Pago_Poliza_${nroPoliza}.pdf`,
        path: cuponeraUrl 
      });
    }

    await sendMail({
      to: email,
      subject: `Aviso Importante: Vencimiento de cobertura - Póliza #${nroPoliza}`,
      html: templateVencimiento(
        nombre, nroPoliza, compania, tipoPoliza, cobertura, fechaVencimiento, 
        patente, marca, modelo, ubicacionRiesgo, cantidadEmpleados, 
        agencia 
      ),
      attachments: attachments.length > 0 ? attachments : undefined 
    });
  } catch (error: any) {
    console.error("Error en el email service:", error);
    await enviarAlertaErrorSistema(
      'enviarAvisoVencimiento', 
      error.message || error, 
      `Póliza: #${nroPoliza} | Cliente: ${nombre} | Email destino: ${email}`
    );
  }
};

export const enviarNotificacionSiniestro = async (
  email: string, nombre: string, nroSiniestro: string, nroPoliza: string, 
  compania: string, tipoPoliza: string, patente: string | null, 
  asuntoPersonalizado: string, descripcionNovedad: string, urlSeguimiento: string
) => {
  if (!email || !email.includes('@')) return;

  try {
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });

    await sendMail({
      to: email,
      subject: `${asuntoPersonalizado} - Trámite #${nroSiniestro}`,
      html: templateSiniestro(
        nombre, nroSiniestro, nroPoliza, compania, tipoPoliza, 
        patente, descripcionNovedad, urlSeguimiento, 
        agencia 
      )
    });
  } catch (error: any) {
    console.error("Error en el servicio de email al enviar alerta de siniestro:", error);
    await enviarAlertaErrorSistema('enviarNotificacionSiniestro', error.message || error, `Siniestro: #${nroSiniestro} | Cliente: ${nombre} | Email: ${email}`);
  }
};

// ============================================================================
// CORREOS INTERNOS DEL SISTEMA (NO LLEVAN LA FIRMA DE TU AGENCIA)
// ============================================================================

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
  } catch (error: any) {
    console.error("Error al enviar el correo de invitación:", error);
    await enviarAlertaErrorSistema('enviarCorreoInvitacion', error.message || error, `Invitado: ${nombre} | Email: ${email}`);
  }
};

export const enviarCorreoContacto = async (nombre: string, email: string, mensaje: string) => {
  try {
    await sendMail({
      to: 'asegurasimple@gmail.com', 
      subject: `🚨 Nueva consulta en AseguraSimple de ${nombre}`,
      html: templateContacto(nombre, email, mensaje)
    });
    console.log(`📧 Mail de contacto recibido de ${email}`);
  } catch (error: any) {
    console.error("Error al enviar el correo de contacto:", error);
  }
};

// ============================================================================
// CORREOS DEL ROBOT COBRADOR (SaaS)
// ============================================================================

export const enviarRecordatorioSuscripcion = async (email: string, nombre: string, fechaVencimiento: Date) => {
  if (!email || !email.includes('@')) return;

  try {
    const linkPago = `${process.env.FRONTEND_URL || 'https://asegurasimple.com'}/configuracion`;
    const fechaFormat = fechaVencimiento.toLocaleDateString("es-AR");

    await sendMail({
      to: email,
      subject: `⚠️ Tu suscripción a AseguraSimple vence en 3 días`,
      html: templateAvisoSuscripcion(nombre, fechaFormat, linkPago)
    });
    
    console.log(`📧 Recordatorio de pago enviado a ${email}`);
  } catch (error: any) {
    console.error("Error al enviar el correo de cobro preventivo:", error);
    await enviarAlertaErrorSistema('enviarRecordatorioSuscripcion', error.message || error, `Cliente: ${nombre} | Email: ${email}`);
  }
};

export const enviarAvisoCuentaSuspendida = async (email: string, nombre: string) => {
  if (!email || !email.includes('@')) return;

  try {
    const linkPago = `${process.env.FRONTEND_URL || 'https://asegurasimple.com'}/configuracion`;

    await sendMail({
      to: email,
      subject: `⛔ Tu suscripción a AseguraSimple ha vencido`,
      html: templateSuscripcionVencida(nombre, linkPago)
    });
    
    console.log(`📧 Aviso de vencimiento (Día 0) enviado a ${email}`);
  } catch (error: any) {
    console.error("Error al enviar el correo de vencimiento:", error);
    await enviarAlertaErrorSistema('enviarAvisoCuentaSuspendida', error.message || error, `Cliente: ${nombre} | Email: ${email}`);
  }
};