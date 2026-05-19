import { Request, Response } from 'express';
import { prisma } from '../config/db';
import crypto from 'crypto';
import { enviarAvisoVencimiento } from '../services/email.service'; // <-- Ruta corregida

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

    const nuevoSiniestro = await prisma.siniestro.create({
      data: {
        nroSiniestro: nroSiniestro || `SIN-${Date.now().toString().slice(-6)}`,
        fechaHecho: new Date(fechaHecho),
        descripcionInicial,
        estadoSiniestro: estadoSiniestro || 'Denuncia Pendiente',
        polizaId: Number(polizaId)
      }
    });

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
        poliza: { include: { asegurado: true } },
        linksConsulta: { where: { activo: true, expiracion: { gte: new Date() } } }
      }
    });

    const emailCliente = siniestroCompleto?.poliza?.asegurado?.email;
    const tokenActivo = siniestroCompleto?.linksConsulta[0]?.token;

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

      await enviarAvisoVencimiento(
        emailCliente,
        `${siniestroCompleto.poliza.asegurado.nombre} ${siniestroCompleto.poliza.asegurado.apellido || ''}`.trim(),
        siniestroCompleto.poliza.nroPoliza,
        `ACTUALIZACIÓN DE TRÁMITE (Siniestro #${siniestroCompleto.nroSiniestro})`,
        `Nueva novedad registrada: "${texto}". Podés seguir el avance en vivo desde tu link de acceso rápido de asegurado.`,
        urlSeguimiento,
        new Date().toLocaleDateString("es-AR")
      );
    }

    res.status(201).json(nuevaNota);
  } catch (error: any) {
    console.error("Error en bitácora con notificación:", error);
    res.status(500).json({ error: 'Error al registrar la nota y enviar la notificación.' });
  }
};

// GENERAR O OBTENER EL LINK DE CONSULTA PÚBLICO
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
    }

    res.json({
      token: linkConsulta.token,
      urlPublica: `http://localhost:3000/consulta/${linkConsulta.token}`
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al procesar el link de consulta.' });
  }
};

// ENDPOINT PÚBLICO
export const getSiniestroPublicoPorToken = async (req: Request, res: Response) => {
  try {
    // 🔥 CORRECCIÓN: Le aclaramos a TypeScript que esto es estrictamente un String
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