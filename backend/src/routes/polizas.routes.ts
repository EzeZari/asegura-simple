import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA 1: Traer TODAS las pólizas (Esta es la que faltaba y tiraba error 404)
router.get('/', async (req, res) => {
  try {
    const polizas = await prisma.poliza.findMany({
      include: {
        asegurado: true,
        compania: true
      },
      orderBy: { fechaVencimiento: 'asc' } // Opcional: para que salgan ordenadas
    });
    res.json(polizas);
  } catch (error) {
    console.error("Error al obtener las pólizas:", error);
    res.status(500).json({ error: 'Error al obtener las pólizas.' });
  }
});

// RUTA 2: Traer UNA SOLA póliza (La que agregamos para la pantalla de detalle)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poliza = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
      include: {
        asegurado: true,
        compania: true
      }
    });

    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });
    
    res.json(poliza);
  } catch (error) {
    console.error("Error al obtener el detalle de la póliza:", error);
    res.status(500).json({ error: 'Error al obtener el detalle de la póliza.' });
  }
});

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
      companiaId
    } = req.body;

    // --- PARCHE INTELIGENTE PARA LA COMPAÑÍA ---
    let companiaRealId = companiaId;
    
    if (!companiaRealId) {
      let compania = await prisma.compania.findFirst();
      if (!compania) {
        compania = await prisma.compania.create({
          data: { 
            nombre: "Compañía de Prueba (Ej: Federación Patronal)",
            email: "contacto@compania.com"
          }
        });
      }
      companiaRealId = compania.id;
    }

    // Guardamos la Póliza en la base de datos
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
        companiaId: parseInt(companiaId), // <--- ACÁ ESTÁ LA CLAVE. Tiene que tener el parseInt()
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
// RUTA: PUT /api/polizas/:id (Editar o cambiar estado de una póliza)
// RUTA: PUT /api/polizas/:id (Editar o cambiar estado de una póliza)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nroPoliza,
      tipoPoliza,
      fechaInicio,
      fechaVencimiento,
      estado,
      cobertura,
      aseguradoId,
      companiaId // <-- ¡Faltaba recibir esto del frontend!
    } = req.body;

    const polizaActualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: {
        nroPoliza,
        tipoPoliza,
        fechaInicio: new Date(fechaInicio),
        fechaVencimiento: new Date(fechaVencimiento),
        estado,
        cobertura,
        aseguradoId: parseInt(aseguradoId),
        companiaId: parseInt(companiaId) // <-- ¡Faltaba decirle a la BD que lo actualice!
      },
      include: {
        asegurado: true,
        compania: true
      }
    });

    res.json(polizaActualizada);
  } catch (error) {
    console.error("Error al actualizar la póliza:", error);
    res.status(500).json({ error: 'Hubo un error al actualizar la póliza.' });
  }
});
// RUTA: DELETE /api/polizas/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.poliza.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Póliza eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la póliza.' });
  }
});

export default router;