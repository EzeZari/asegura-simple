import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA: GET /api/polizas
router.get('/', async (req, res) => {
  try {
    const polizas = await prisma.poliza.findMany({
      include: { asegurado: true, compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });
    res.json(polizas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las pólizas.' });
  }
});

// RUTA: GET /api/polizas/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poliza = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });
    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });
    res.json(poliza);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el detalle.' });
  }
});

// RUTA: POST /api/polizas (Crea una póliza nueva)
router.post('/', async (req, res) => {
  try {
    const { nroPoliza, tipoPoliza, fechaInicio, fechaVencimiento, estado, cobertura, aseguradoId, companiaId } = req.body;

    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza, tipoPoliza, 
        fechaInicio: new Date(fechaInicio), 
        fechaVencimiento: new Date(fechaVencimiento), 
        estado, cobertura, 
        aseguradoId: parseInt(aseguradoId), 
        companiaId: parseInt(companiaId),
      },
      include: { asegurado: true }
    });

    // REGISTRO SEPARADO: Detalle y Cliente
    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Póliza",
        descripcion: `Póliza #${nroPoliza} (${tipoPoliza})`,
        cliente: `${nuevaPoliza.asegurado.nombre} ${nuevaPoliza.asegurado.apellido || ''}`.trim()
      }
    });

    res.status(201).json(nuevaPoliza);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar.' });
  }
});

// RUTA: PUT /api/polizas/:id (Editar o cambiar estado)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 1. Buscamos la versión anterior
    const vieja = await prisma.poliza.findUnique({ 
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });

    // 2. Actualizamos
    const actualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: {
        nroPoliza: data.nroPoliza,
        tipoPoliza: data.tipoPoliza,
        fechaInicio: new Date(data.fechaInicio),
        fechaVencimiento: new Date(data.fechaVencimiento),
        estado: data.estado,
        cobertura: data.cobertura,
        aseguradoId: parseInt(data.aseguradoId),
        companiaId: parseInt(data.companiaId) 
      },
      include: { asegurado: true, compania: true }
    });

    // 3. Comparamos cambios
    let cambios = [];
    if (vieja && vieja.estado !== data.estado) cambios.push(`Estado: ${vieja.estado} -> ${data.estado}`);
    if (vieja && vieja.nroPoliza !== data.nroPoliza) cambios.push(`Nro: ${vieja.nroPoliza} -> ${data.nroPoliza}`);
    if (vieja && vieja.companiaId !== actualizada.companiaId) cambios.push(`Compañía: ${vieja.compania.nombre} -> ${actualizada.compania.nombre}`);
    
    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos técnicos";

    // 4. Registro en historial
    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: textoDetalle,
        cliente: `${actualizada.asegurado.nombre} ${actualizada.asegurado.apellido || ''}`.trim()
      }
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
});

// RUTA: DELETE /api/polizas/:id (Eliminar)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const polizaABorrar = await prisma.poliza.findUnique({ 
      where: { id: parseInt(id) },
      include: { asegurado: true } 
    });
    
    await prisma.poliza.delete({ where: { id: parseInt(id) } });

    // REGISTRO SEPARADO: Detalle y Cliente
    if (polizaABorrar) {
      await prisma.actividad.create({
        data: {
          accion: "Baja",
          entidad: "Póliza",
          descripcion: `Se eliminó la póliza #${polizaABorrar.nroPoliza}`,
          cliente: `${polizaABorrar.asegurado.nombre} ${polizaABorrar.asegurado.apellido || ''}`.trim()
        }
      });
    }

    res.json({ message: 'Póliza eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

export default router;