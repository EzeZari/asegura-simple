import { Router } from 'express';
import { prisma } from '../config/db';
import { enviarCorreoBienvenida } from '../services/email.service'; // <-- Importamos el servicio

const router = Router();

// RUTA: GET /api/asegurados (Traer todos los clientes)
router.get('/', async (req, res) => {
  try {
    const asegurados = await prisma.asegurado.findMany({
      include: { _count: { select: { polizas: true } } },
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
      include: { compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });
    res.json(polizas);
  } catch (error) {
    console.error("Error al obtener pólizas:", error);
    res.status(500).json({ error: 'Error al obtener pólizas.' });
  }
});

// RUTA: POST /api/asegurados (Guarda un cliente nuevo)
router.post('/', async (req, res) => {
  try {
    const data = req.body;

    let productor = await prisma.productor.findFirst();
    if (!productor) {
      productor = await prisma.productor.create({
        data: {
          nombre: "Productor", apellido: "Prueba", email: "productor@asegurasimple.com",
          usuario: "admin", contrasenaHash: "123456",
        }
      });
    }

    const nuevoAsegurado = await prisma.asegurado.create({
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
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        productorId: productor.id,
      },
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta", entidad: "Asegurado", descripcion: "Nuevo cliente registrado",
        cliente: `${data.nombre} ${data.apellido || ''}`.trim()
      }
    });

    // Disparamos el email en segundo plano (sin await para no demorar la respuesta)
    enviarCorreoBienvenida(data.email, data.nombre, data.apellido, data.dni, data.telefono);

    res.status(201).json(nuevoAsegurado);

  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe un asegurado con ese DNI o CUIT.' });
    res.status(500).json({ error: 'Hubo un error al guardar el asegurado.' });
  }
});

// RUTA: PUT /api/asegurados/:id (Editar o dar de baja un cliente)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const viejo = await prisma.asegurado.findUnique({ where: { id: parseInt(id) } });

    const aseguradoActualizado = await prisma.asegurado.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre, apellido: data.apellido, tipo: data.tipo, dni: data.dni,
        condicionIva: data.condicionIva, email: data.email, telefono: data.telefono,
        direccion: data.direccion, codigoPostal: data.codigoPostal,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        activo: data.activo,
      },
    });

    let cambios = [];
    if (viejo && viejo.nombre !== data.nombre) cambios.push(`Nombre: ${viejo.nombre} -> ${data.nombre}`);
    if (viejo && viejo.apellido !== data.apellido) cambios.push(`Apellido: ${viejo.apellido} -> ${data.apellido}`);
    if (viejo && viejo.telefono !== data.telefono) cambios.push(`Tel: ${viejo.telefono || '-'} -> ${data.telefono || '-'}`);
    if (viejo && viejo.email !== data.email) cambios.push(`Email: ${viejo.email || '-'} -> ${data.email || '-'}`);
    if (viejo && viejo.dni !== data.dni) cambios.push(`DNI: ${viejo.dni} -> ${data.dni}`);

    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos";
    const accionReal = data.activo === false && viejo?.activo === true ? "Desactivación" : 
                       data.activo === true && viejo?.activo === false ? "Activación" : "Edición";
                       
    if (accionReal !== "Edición") {
        textoDetalle = accionReal === "Desactivación" ? "Cliente pasado a Inactivo" : "Cliente vuelto a Activar";
    }

    await prisma.actividad.create({
      data: {
        accion: accionReal, entidad: "Asegurado", descripcion: textoDetalle,
        cliente: `${data.nombre} ${data.apellido || ''}`.trim(),
      }
    });

    res.json(aseguradoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al actualizar el asegurado.' });
  }
});

// RUTA: DELETE /api/asegurados/:id (Eliminar definitivamente)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const aseguradoABorrar = await prisma.asegurado.findUnique({ where: { id: parseInt(id) } });

    await prisma.asegurado.delete({ where: { id: parseInt(id) } });

    if (aseguradoABorrar) {
      await prisma.actividad.create({
        data: {
          accion: "Baja", entidad: "Asegurado",
          descripcion: `${aseguradoABorrar.nombre} ${aseguradoABorrar.apellido || ''}`.trim(),
        }
      });
    }

    res.json({ message: 'Asegurado eliminado' });
  } catch (error: any) {
    if (error.code === 'P2003') return res.status(400).json({ error: 'No se puede eliminar un asegurado con pólizas activas.' });
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

export default router;