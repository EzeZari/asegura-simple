import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA: GET /api/asegurados (Traer todos los clientes)
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
    let productor = await prisma.productor.findFirst();
    
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
        productorId: productor.id,
      },
    });

    // REGISTRO DE ACTIVIDAD: Alta
    await prisma.actividad.create({
    data: {
    accion: "Alta",
    entidad: "Asegurado",
    descripcion: "Nuevo cliente registrado",
    cliente: `${nombre} ${apellido || ''}`.trim()
  }
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
// RUTA: PUT /api/asegurados/:id (Editar o dar de baja un cliente)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 1. Buscamos cómo estaban los datos ANTES de editar para poder compararlos
    const viejo = await prisma.asegurado.findUnique({ where: { id: parseInt(id) } });

    // 2. Hacemos la actualización en la base de datos
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
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        activo: data.activo,
      },
    });

    // 3. Comparamos y armamos el texto de "Viejo -> Nuevo"
    let cambios = [];
    if (viejo && viejo.nombre !== data.nombre) cambios.push(`Nombre: ${viejo.nombre} -> ${data.nombre}`);
    if (viejo && viejo.apellido !== data.apellido) cambios.push(`Apellido: ${viejo.apellido} -> ${data.apellido}`);
    if (viejo && viejo.telefono !== data.telefono) cambios.push(`Tel: ${viejo.telefono || '-'} -> ${data.telefono || '-'}`);
    if (viejo && viejo.email !== data.email) cambios.push(`Email: ${viejo.email || '-'} -> ${data.email || '-'}`);
    if (viejo && viejo.dni !== data.dni) cambios.push(`DNI: ${viejo.dni} -> ${data.dni}`);

    // Si cambió algo, unimos los textos. Si no detectó cambios específicos, ponemos un texto genérico.
    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos";
    
    // Si lo que se hizo fue desactivar/activar al cliente, pisamos el texto con algo más claro
    const accionReal = data.activo === false && viejo?.activo === true ? "Desactivación" : 
                       data.activo === true && viejo?.activo === false ? "Activación" : "Edición";
                       
    if (accionReal !== "Edición") {
        textoDetalle = accionReal === "Desactivación" ? "Cliente pasado a Inactivo" : "Cliente vuelto a Activar";
    }

    // 4. REGISTRO DE ACTIVIDAD (Acá arreglamos el 'No aplica' mandando el cliente)
    await prisma.actividad.create({
      data: {
        accion: accionReal,
        entidad: "Asegurado",
        descripcion: textoDetalle, // Acá va el "viejo -> nuevo"
        cliente: `${data.nombre} ${data.apellido || ''}`.trim(), // Acá mandamos el nombre a su columna
      }
    });

    res.json(aseguradoActualizado);
  } catch (error) {
    console.error("Error al actualizar el asegurado:", error);
    res.status(500).json({ error: 'Hubo un error al actualizar el asegurado.' });
  }
});

// RUTA: DELETE /api/asegurados/:id (Eliminar definitivamente)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero buscamos al asegurado para saber su nombre antes de borrarlo
    const aseguradoABorrar = await prisma.asegurado.findUnique({
      where: { id: parseInt(id) }
    });

    await prisma.asegurado.delete({
      where: { id: parseInt(id) }
    });

    // REGISTRO DE ACTIVIDAD: Baja
    if (aseguradoABorrar) {
      await prisma.actividad.create({
        data: {
          accion: "Baja",
          entidad: "Asegurado",
          descripcion: `${aseguradoABorrar.nombre} ${aseguradoABorrar.apellido || ''}`.trim(),
        }
      });
    }

    res.json({ message: 'Asegurado eliminado' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'No se puede eliminar un asegurado con pólizas activas.' });
    }
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

export default router;