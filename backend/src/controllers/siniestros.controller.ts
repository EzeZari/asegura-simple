import { Request, Response } from 'express';
import { prisma } from '../config/db';
import crypto from 'crypto';
import { enviarNotificacionSiniestro } from '../services/email.service';

const obtenerProductorId = async (userId: number): Promise<number> => {
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;
  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  if (!productor) {
    const userDueño = idAgencia === userId ? usuarioActual : await prisma.user.findUnique({ where: { id: idAgencia } });
    const userEmail = userDueño?.email || `user${idAgencia}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: idAgencia }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: userDueño?.nombre || 'Productor',
          apellido: '',
          email: userEmail,
          usuario: userEmail,
          contrasenaHash: '',
          userId: idAgencia
        }
      });
    }
  }
  return productor.id;
};

export const getSiniestros = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    
    const siniestros = await prisma.siniestro.findMany({
      where: {
        productorId: productorId 
      },
      include: {
        poliza: {
          include: { asegurado: true, compania: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    return res.json(siniestros);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createSiniestro = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    const { nroSiniestro, fechaHecho, descripcionInicial, estadoSiniestro, polizaId } = req.body;

    if (!polizaId || !fechaHecho || !descripcionInicial) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (Póliza, Fecha o Descripción).' });
    }

    const poliza = await prisma.poliza.findFirst({
      where: { id: Number(polizaId), asegurado: { productorId: productorId } },
      include: { asegurado: true }
    });

    if (!poliza) return res.status(403).json({ error: 'La póliza no te pertenece o no existe.' });

    const nroFinal = nroSiniestro && nroSiniestro.trim() !== "" 
      ? nroSiniestro.trim() 
      : `SIN-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const nuevoSiniestro = await prisma.siniestro.create({
      data: {
        nroSiniestro: nroFinal,
        fechaHecho: new Date(fechaHecho),
        descripcionInicial,
        estadoSiniestro: estadoSiniestro || 'Denuncia Pendiente',
        polizaId: Number(polizaId),
        productorId: productorId 
      }
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Siniestro",
        descripcion: `Se registró un nuevo siniestro (${nuevoSiniestro.nroSiniestro}).`,
        cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.status(201).json(nuevoSiniestro);
  } catch (error: any) {
    console.error("Error al crear siniestro:", error);
    return res.status(500).json({ error: 'Error al registrar el siniestro. Verifica que el número no esté duplicado.' });
  }
};

export const updateSiniestro = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    const { id } = req.params;
    const { nroSiniestro, fechaHecho, descripcionInicial, estadoSiniestro } = req.body;

    const siniestroExistente = await prisma.siniestro.findFirst({
      where: { id: Number(id), productorId: productorId } 
    });

    if (!siniestroExistente) return res.status(403).json({ error: 'Siniestro no encontrado o no autorizado.' });

    const dataAActualizar: any = { nroSiniestro, descripcionInicial, estadoSiniestro };

    if (fechaHecho) dataAActualizar.fechaHecho = new Date(fechaHecho);
    
    if (estadoSiniestro === 'Cerrado' || estadoSiniestro === 'Pagado') {
      dataAActualizar.fechaCierre = new Date();
    } else {
      dataAActualizar.fechaCierre = null;
    }

    const siniestroActualizado = await prisma.siniestro.update({
      where: { id: Number(id) },
      data: dataAActualizar
    });

    return res.json(siniestroActualizado);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al actualizar el siniestro.' });
  }
};

// 🔥 ACÁ ESTÁ LA SOLUCIÓN AL ERROR 500
export const deleteSiniestro = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    const { id } = req.params;

    // 1. Buscamos el siniestro para obtener los datos del historial
    const siniestroExistente = await prisma.siniestro.findFirst({
      where: { id: Number(id), productorId: productorId },
      include: { poliza: { include: { asegurado: true } } }
    });

    if (!siniestroExistente) return res.status(403).json({ error: 'Siniestro no encontrado o no autorizado.' });

    // 2. 🔥 BORRAMOS TODAS LAS DEPENDENCIAS (Hijos) PARA EVITAR EL FOREIGN KEY CONSTRAINT ERROR (500)
    await prisma.notaSiniestro.deleteMany({ where: { siniestroId: Number(id) } });
    await prisma.linkConsulta.deleteMany({ where: { siniestroId: Number(id) } });
    await prisma.notificacion.deleteMany({ where: { siniestroId: Number(id) } });

    // 3. Ahora sí, borramos el siniestro principal (Padre)
    await prisma.siniestro.delete({ where: { id: Number(id) } });

    // 4. Guardamos la actividad de auditoría
    const clienteNombre = siniestroExistente.poliza?.asegurado?.nombre || 'Cliente';
    const clienteApellido = siniestroExistente.poliza?.asegurado?.apellido || '';

    await prisma.actividad.create({
      data: {
        accion: "Baja",
        entidad: "Siniestro",
        descripcion: `Se eliminó el expediente de siniestro #${siniestroExistente.nroSiniestro}.`,
        cliente: `${clienteNombre} ${clienteApellido}`.trim(),
        productorId 
      }
    });

    return res.json({ message: 'Siniestro eliminado correctamente.' });
  } catch (error: any) {
    console.error("Error crítico al eliminar siniestro:", error);
    return res.status(500).json({ error: 'Error interno en la base de datos al intentar eliminar el registro.' });
  }
};

export const getSiniestroById = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    const { id } = req.params;
    
    const siniestro = await prisma.siniestro.findFirst({
      where: { 
        id: Number(id),
        productorId: productorId 
      },
      include: {
        poliza: { include: { asegurado: true, compania: true } },
        notas: { orderBy: { fecha: 'desc' } },
        linksConsulta: { where: { activo: true, expiracion: { gte: new Date() } } }
      }
    });

    if (!siniestro) return res.status(404).json({ error: 'Siniestro no encontrado o no autorizado.' });

    return res.json(siniestro);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener el detalle del siniestro.' });
  }
};

export const agregarNota = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ error: 'El texto de la nota no puede estar vacío.' });
    }

    const siniestroCompleto = await prisma.siniestro.findFirst({
      where: { id: Number(id), productorId: productorId }, 
      include: {
        poliza: { include: { asegurado: true, compania: true } },
        linksConsulta: { where: { activo: true, expiracion: { gte: new Date() } } }
      }
    });

    if (!siniestroCompleto) return res.status(403).json({ error: 'Siniestro no encontrado o no autorizado.' });

    const nuevaNota = await prisma.notaSiniestro.create({
      data: {
        texto,
        siniestroId: Number(id),
        productorId: productorId 
      }
    });

    const emailCliente = siniestroCompleto.poliza.asegurado.email;
    const tokenActivo = siniestroCompleto.linksConsulta[0]?.token;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (emailCliente) {
      const urlSeguimiento = tokenActivo 
        ? `${baseUrl}/consulta/${tokenActivo}`
        : `${baseUrl}/siniestros`; 

      await prisma.notificacion.create({
        data: {
          canal: "EMAIL",
          destinatario: emailCliente,
          motivo: "Actualización de Siniestro",
          mensaje: texto,
          estadoEnvio: "ENVIADO",
          siniestroId: Number(id)
        }
      });

      await enviarNotificacionSiniestro(
        emailCliente,
        `${siniestroCompleto.poliza.asegurado.nombre} ${siniestroCompleto.poliza.asegurado.apellido || ''}`.trim(),
        siniestroCompleto.nroSiniestro,
        siniestroCompleto.poliza.nroPoliza,
        siniestroCompleto.poliza.compania?.nombre || 'Compañía Asignada',
        siniestroCompleto.poliza.tipoPoliza,
        siniestroCompleto.poliza.patente,
        `NUEVA ACTUALIZACIÓN DE SEGUIMIENTO`,
        texto, 
        urlSeguimiento
      );
    }

    return res.status(201).json(nuevaNota);
  } catch (error: any) {
    console.error("Error en bitácora con notificación:", error);
    return res.status(500).json({ error: 'Error al registrar la nota y enviar la notificación.' });
  }
};

export const obtenerOGenerarLink = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);
    const { id } = req.params;
    
    const siniestroCompleto = await prisma.siniestro.findFirst({
      where: { id: Number(id), productorId: productorId }, 
      include: { poliza: { include: { asegurado: true, compania: true } } }
    });

    if (!siniestroCompleto) return res.status(403).json({ error: 'Siniestro no encontrado o no autorizado.' });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    let linkConsulta = await prisma.linkConsulta.findFirst({
      where: { siniestroId: Number(id), activo: true, expiracion: { gte: new Date() } }
    });

    if (!linkConsulta) {
      const tokenUnico = crypto.randomBytes(24).toString('hex');
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 30); 

      linkConsulta = await prisma.linkConsulta.create({
        data: { token: tokenUnico, expiracion: fechaExpiracion, siniestroId: Number(id) }
      });

      const urlSeguimiento = `${baseUrl}/consulta/${tokenUnico}`;
      const emailCliente = siniestroCompleto.poliza?.asegurado?.email;

      if (emailCliente) {
        await prisma.notificacion.create({
          data: {
            canal: "EMAIL",
            destinatario: emailCliente,
            motivo: "Apertura de Siniestro",
            mensaje: "Se generó el link de seguimiento del reclamo.",
            estadoEnvio: "ENVIADO",
            siniestroId: Number(id)
          }
        });

        await enviarNotificacionSiniestro(
          emailCliente,
          `${siniestroCompleto.poliza.asegurado.nombre} ${siniestroCompleto.poliza.asegurado.apellido || ''}`.trim(),
          siniestroCompleto.nroSiniestro,
          siniestroCompleto.poliza.nroPoliza,
          siniestroCompleto.poliza.compania?.nombre || 'Compañía Asignada',
          siniestroCompleto.poliza.tipoPoliza,
          siniestroCompleto.poliza.patente,
          `ALERTA: Apertura de Expediente`,
          `Hemos generado el acceso seguro para que puedas seguir tu reclamo. Ya iniciamos las gestiones administrativas correspondientes frente a la aseguradora.`,
          urlSeguimiento
        );
      }
    }

    return res.json({ token: linkConsulta.token, urlPublica: `${baseUrl}/consulta/${linkConsulta.token}` });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Error al procesar el link de consulta y enviar el correo.' });
  }
};

export const getSiniestroPublicoPorToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.params.token as string; 

    const linkValido = await prisma.linkConsulta.findUnique({
      where: { token },
      include: {
        siniestro: {
          include: {
            poliza: { include: { compania: true } },
            notas: { orderBy: { fecha: 'desc' } }
          }
        }
      }
    });

    if (!linkValido || !linkValido.activo || linkValido.expiracion < new Date()) {
      return res.status(403).json({ error: 'El enlace de consulta expiró o es inválido.' });
    }

    return res.json(linkValido.siniestro);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al consultar el expediente público.' });
  }
};