import { Request, Response } from 'express';
import { prisma } from '../config/db';
import crypto from 'crypto';
import { enviarNotificacionSiniestro } from '../services/email.service';

export const getSiniestros = async (req: Request, res: Response) => {
  try {
    const siniestros = await prisma.siniestro.findMany({
      include: {
        poliza: {
          include: {
            asegurado: true,
            compania: true
          }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(siniestros);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSiniestro = async (req: Request, res: Response) => {
  try {
    const { nroSiniestro, fechaHecho, descripcionInicial, estadoSiniestro, polizaId } = req.body;

    if (!polizaId || !fechaHecho || !descripcionInicial) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (Póliza, Fecha o Descripción).' });
    }

    // 1. Solo guardamos el siniestro en la base (SIN mandar mail todavía)
    const nuevoSiniestro = await prisma.siniestro.create({
      data: {
        nroSiniestro: nroSiniestro || `SIN-${Date.now().toString().slice(-6)}`,
        fechaHecho: new Date(fechaHecho),
        descripcionInicial,
        estadoSiniestro: estadoSiniestro || 'Denuncia Pendiente',
        polizaId: Number(polizaId)
      }
    });

    // 2. Dejamos el registro en la tabla de actividad
    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Siniestro",
        descripcion: `Se registró un nuevo siniestro (${nuevoSiniestro.nroSiniestro}).`,
        cliente: "Sistema"
      }
    });

    res.status(201).json(nuevoSiniestro);
  } catch (error: any) {
    console.error("Error al crear siniestro:", error);
    res.status(500).json({ error: 'Error al registrar el siniestro. Verifica que el número no esté duplicado.' });
  }
};

export const updateSiniestro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nroSiniestro, fechaHecho, descripcionInicial, estadoSiniestro } = req.body;

    const dataAActualizar: any = {
      nroSiniestro,
      descripcionInicial,
      estadoSiniestro
    };

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

    res.json(siniestroActualizado);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar el siniestro.' });
  }
};

export const deleteSiniestro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.siniestro.delete({ where: { id: Number(id) } });
    res.json({ message: 'Siniestro eliminado correctamente.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar el siniestro.' });
  }
};

// BUSCAR UN SINIESTRO POR ID
export const getSiniestroById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const siniestro = await prisma.siniestro.findUnique({
      where: { id: Number(id) },
      include: {
        poliza: {
          include: {
            asegurado: true,
            compania: true
          }
        },
        notas: {
          orderBy: { fecha: 'desc' } 
        }
      }
    });

    if (!siniestro) {
      return res.status(404).json({ error: 'Siniestro no encontrado' });
    }

    res.json(siniestro);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener el detalle del siniestro.' });
  }
};

// AGREGAR NOTA (Con Notificación Automática)
export const agregarNota = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ error: 'El texto de la nota no puede estar vacío.' });
    }

    const nuevaNota = await prisma.notaSiniestro.create({
      data: {
        texto,
        siniestroId: Number(id),
        productorId: 1
      }
    });

    const siniestroCompleto = await prisma.siniestro.findUnique({
      where: { id: Number(id) },
      include: {
        poliza: { include: { asegurado: true, compania: true } },
        linksConsulta: { where: { activo: true, expiracion: { gte: new Date() } } }
      }
    });

    const emailCliente = siniestroCompleto?.poliza?.asegurado?.email;
    const tokenActivo = siniestroCompleto?.linksConsulta[0]?.token;

    // Si el cliente tiene mail cargado, le mandamos el correo con la novedad
    if (emailCliente) {
      const urlSeguimiento = tokenActivo 
        ? `http://localhost:3000/consulta/${tokenActivo}`
        : `http://localhost:3000/siniestros`; 

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

      // Usamos la nueva plantilla limpia para avisar la nueva nota de la bitácora
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

    // Devolvemos la nota creada al Frontend
    res.status(201).json(nuevaNota);

  } catch (error: any) {
    console.error("Error en bitácora con notificación:", error);
    res.status(500).json({ error: 'Error al registrar la nota y enviar la notificación.' });
  }
};

// GENERAR O OBTENER EL LINK DE CONSULTA PÚBLICO (Acá se manda el mail inicial)
export const obtenerOGenerarLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let linkConsulta = await prisma.linkConsulta.findFirst({
      where: {
        siniestroId: Number(id),
        activo: true,
        expiracion: { gte: new Date() } 
      }
    });

    // Si NO existe el link, lo creamos y MANDAMOS EL MAIL POR ÚNICA VEZ
    if (!linkConsulta) {
      const tokenUnico = crypto.randomBytes(24).toString('hex');
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 30); 

      linkConsulta = await prisma.linkConsulta.create({
        data: {
          token: tokenUnico,
          expiracion: fechaExpiracion,
          siniestroId: Number(id)
        }
      });

      const urlSeguimiento = `http://localhost:3000/consulta/${tokenUnico}`;

      // Buscamos los datos completos para armar el correo
      const siniestroCompleto = await prisma.siniestro.findUnique({
        where: { id: Number(id) },
        include: { poliza: { include: { asegurado: true, compania: true } } }
      });

      const emailCliente = siniestroCompleto?.poliza?.asegurado?.email;

      if (emailCliente && siniestroCompleto) {
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

    res.json({
      token: linkConsulta.token,
      urlPublica: `http://localhost:3000/consulta/${linkConsulta.token}`
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el link de consulta y enviar el correo.' });
  }
};

// ENDPOINT PÚBLICO
export const getSiniestroPublicoPorToken = async (req: Request, res: Response) => {
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

    res.json(linkValido.siniestro);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar el expediente público.' });
  }
};