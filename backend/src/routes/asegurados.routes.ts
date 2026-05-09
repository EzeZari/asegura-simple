import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA: GET /api/asegurados (Trae la lista para mostrar en la tabla)
router.get('/', async (req, res) => {
  try {
    const asegurados = await prisma.asegurado.findMany({
      orderBy: { fechaRegistro: 'desc' }, // Los más nuevos primero
    });
    res.json(asegurados);
  } catch (error) {
    console.error("Error al obtener asegurados:", error);
    res.status(500).json({ error: 'Hubo un error al obtener la lista de asegurados.' });
  }
});

// RUTA: POST /api/asegurados (Guarda un cliente nuevo)
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      tipo,
      dni,
      fechaNacimiento,
      condicionIva,
      email,
      telefono,
      direccion,
      codigoPostal
    } = req.body;

    // --- PARCHE INTELIGENTE PARA LA PRUEBA ---
    // Buscamos el primer productor que exista en la base de datos
    let productor = await prisma.productor.findFirst();
    
    // Si la base de datos está vacía, creamos uno de prueba automáticamente
    if (!productor) {
      productor = await prisma.productor.create({
        data: {
          nombre: "Productor",
          apellido: "Prueba",
          email: "productor@asegurasimple.com",
          usuario: "admin",
          contrasenaHash: "123456",
        }
      });
    }

    // Ahora sí, guardamos el asegurado asignándolo al ID de ese productor real
    const nuevoAsegurado = await prisma.asegurado.create({
      data: {
        nombre,
        apellido,
        tipo,
        dni,
        condicionIva,
        email,
        telefono,
        direccion,
        codigoPostal,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        productorId: productor.id, // <-- Usamos el ID dinámico que aseguramos arriba
      },
    });

    res.status(201).json(nuevoAsegurado);

  } catch (error: any) {
    console.error("Error al guardar el asegurado:", error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Ya existe un asegurado con ese DNI o CUIT.' });
    }

    res.status(500).json({ error: 'Hubo un error al guardar el asegurado.' });
  }
});

export default router;