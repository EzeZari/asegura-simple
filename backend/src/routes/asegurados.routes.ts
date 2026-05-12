import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA FALTANTE: GET /api/asegurados (Traer todos los clientes)
router.get('/', async (req, res) => {
  try {
    const asegurados = await prisma.asegurado.findMany({
      include: {
        _count: {
          select: { polizas: true } // Esto le dice a Prisma que sume las pólizas
        }
      },
      orderBy: { nombre: 'asc' }
    });
    res.json(asegurados);
  } catch (error) {
    console.error("Error al obtener asegurados:", error);
    res.status(500).json({ error: 'Error al obtener asegurados.' });
  }
});

// RUTA: GET /api/asegurados/:id/polizas (Traer pólizas de un cliente)
router.get('/:id/polizas', async (req, res) => {
  try {
    const { id } = req.params;
    const polizas = await prisma.poliza.findMany({
      where: { aseguradoId: parseInt(id) },
      include: { compania: true }, // Incluimos la compañía para mostrar el nombre
      orderBy: { fechaVencimiento: 'asc' } // Ordenamos por las que vencen primero
    });
    res.json(polizas);
  } catch (error) {
    console.error("Error al obtener las pólizas del asegurado:", error);
    res.status(500).json({ error: 'Error al obtener las pólizas del asegurado.' });
  }
});

// ... (El resto de tus rutas POST, PUT y DELETE quedan exactamente igual)

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
// RUTA: PUT /api/asegurados/:id (Editar o dar de baja un cliente)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const aseguradoActualizado = await prisma.asegurado.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        tipo: data.tipo,
        dni: data.dni,
        condicionIva: data.condicionIva,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        codigoPostal: data.codigoPostal,
        // Si hay fecha la convertimos, sino mandamos null
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        activo: data.activo, // Esto nos va a servir para "desactivarlo"
      },
    });

    res.json(aseguradoActualizado);
  } catch (error) {
    console.error("Error al actualizar el asegurado:", error);
    res.status(500).json({ error: 'Hubo un error al actualizar el asegurado.' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.asegurado.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Asegurado eliminado' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'No se puede eliminar un asegurado con pólizas activas.' });
    }
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

export default router;