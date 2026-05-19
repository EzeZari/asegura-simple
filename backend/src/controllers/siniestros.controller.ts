import { Request, Response } from 'express';
import { prisma } from '../config/db';

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

    // Validación básica
    if (!polizaId || !fechaHecho || !descripcionInicial) {
      return res.status(400).json({ error: 'Faltan datos obligatorios (Póliza, Fecha o Descripción).' });
    }

    const nuevoSiniestro = await prisma.siniestro.create({
      data: {
        nroSiniestro: nroSiniestro || `SIN-${Date.now().toString().slice(-6)}`, // Si no tiene nro de reclamo de compañía, generamos uno interno
        fechaHecho: new Date(fechaHecho),
        descripcionInicial,
        estadoSiniestro: estadoSiniestro || 'Denuncia Pendiente',
        polizaId: Number(polizaId)
      }
    });

    // Registramos en el historial de actividad general
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
    
    // Si lo estamos cerrando/pagando, le ponemos fecha de cierre
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
// BUSCAR UN SINIESTRO POR ID (Con todos sus detalles y notas)
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
          orderBy: { fecha: 'desc' } // Traemos las notas ordenadas de la más nueva a la más vieja
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

// AGREGAR UNA NOTA A LA BITÁCORA DEL SINIESTRO
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
        productorId: 1 // Asumimos el productor 1 por ahora
      }
    });

    res.status(201).json(nuevaNota);
  } catch (error: any) {
    console.error("Error al agregar nota:", error);
    res.status(500).json({ error: 'Error al guardar la nota.' });
  }
};