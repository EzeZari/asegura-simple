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

export default router;