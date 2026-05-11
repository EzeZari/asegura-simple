import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA: GET /api/polizas (Trae todas las pólizas con los datos del cliente y la compañía)
router.get('/', async (req, res) => {
  try {
    const polizas = await prisma.poliza.findMany({
      include: {
        asegurado: true, // Magia de Prisma: nos trae los datos del cliente asociado
        compania: true,  // Y los datos de la compañía
      },
      orderBy: { fechaInicio: 'desc' }
    });
    res.json(polizas);
  } catch (error) {
    console.error("Error al obtener pólizas:", error);
    res.status(500).json({ error: 'Hubo un error al obtener la lista de pólizas.' });
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
    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza,
        tipoPoliza,
        fechaInicio: new Date(fechaInicio),
        fechaVencimiento: new Date(fechaVencimiento),
        estado,
        cobertura,
        aseguradoId: parseInt(aseguradoId), // Conectamos con el cliente
        companiaId: companiaRealId,         // Conectamos con la compañía
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