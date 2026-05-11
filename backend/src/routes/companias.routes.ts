import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA: GET /api/companias (Listar todas)
router.get('/', async (req, res) => {
  try {
    const companias = await prisma.compania.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(companias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las compañías.' });
  }
});

// RUTA: POST /api/companias (Crear una nueva)
// RUTA: POST /api/polizas (Crea una póliza nueva)
router.post('/', async (req, res) => {
  try {
    const {
      nroPoliza,
      tipoPoliza,
      fechaInicio,
      fechaVencimiento,
      estado,
      cobertura,
      aseguradoId,
      companiaId // <-- Ahora exigimos que venga la compañía elegida
    } = req.body;

    // Guardamos la Póliza conectando Cliente y Compañía reales
    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza,
        tipoPoliza,
        fechaInicio: new Date(fechaInicio),
        fechaVencimiento: new Date(fechaVencimiento),
        estado,
        cobertura,
        aseguradoId: parseInt(aseguradoId),
        companiaId: parseInt(companiaId), // <-- Conexión real
      },
      include: {
        asegurado: true,
        compania: true
      }
    });

    res.status(201).json(nuevaPoliza);

  } catch (error: any) {
    console.error("Error al guardar la póliza:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe una póliza con ese número.' });
    }
    res.status(500).json({ error: 'Hubo un error al guardar la póliza.' });
  }
});
// RUTA: DELETE /api/companias/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.compania.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Compañía eliminada correctamente' });
  } catch (error: any) {
    // Si el error es P2003, significa que hay pólizas usando esta compañía
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'No se puede eliminar la compañía porque tiene pólizas asociadas.' });
    }
    res.status(500).json({ error: 'Error al eliminar la compañía.' });
  }
});
export default router;