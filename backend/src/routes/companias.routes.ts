import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware'; // 🔥 Agregamos seguridad

const router = Router();

// 🔥 Aplicamos el middleware a TODAS las rutas
router.use(verificarToken);

// Función helper para obtener el Productor del usuario logueado
const obtenerProductorId = async (userId: number): Promise<number> => {
  let productor = await prisma.productor.findUnique({ where: { userId } });
  
  if (!productor) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userEmail = user?.email || `user${userId}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: userId }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: user?.nombre || 'Productor',
          apellido: '',
          email: userEmail,
          usuario: userEmail,
          contrasenaHash: '',
          userId: userId
        }
      });
    }
  }
  
  return productor.id;
};


// RUTA: GET /api/companias (Traer solo las compañías DEL PRODUCTOR LOGUEADO)
router.get('/', async (req, res) => {
  try {
    const productorId = await obtenerProductorId(req.userId!);
    
    // 🔥 FILTRO MULTI-TENANT: Trae solo tus compañías
    const companias = await prisma.compania.findMany({
      where: { productorId: productorId },
      orderBy: { nombre: 'asc' }
    });
    res.json(companias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las compañías.' });
  }
});

// RUTA: POST /api/companias (Crear una compañía nueva)
router.post('/', async (req, res) => {
  try {
    const { nombre, cuit, telefonoSiniestros, email } = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    const nuevaCompania = await prisma.compania.create({
      data: {
        nombre,
        cuit,
        telefonoSiniestros,
        email,
        productorId // 🔥 Enganchamos la compañía a TU cuenta
      }
    });

    await prisma.actividad.create({
  data: {
    accion: "Alta",
    entidad: "Compañía",
    descripcion: `Aseguradora: ${nombre}`,
    productorId  // ← AGREGAR
  }
});

    res.status(201).json(nuevaCompania);
  } catch (error: any) {
    console.error("Error al guardar la compañía:", error);
    res.status(500).json({ error: 'Hubo un error al guardar la compañía.' });
  }
});

// RUTA: POST /api/companias/importar (Importar compañías desde Excel)
router.post('/importar', async (req, res): Promise<any> => {
  try {
    const { companias } = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    if (!companias || !Array.isArray(companias) || companias.length === 0) {
      return res.status(400).json({ error: 'No se enviaron compañías para importar.' });
    }

    let importadosCount = 0;

    for (const data of companias) {
      if (!data.nombre) continue;

      // 🔥 Buscamos si ya existe, pero SOLO en tus compañías
      const existeCompania = await prisma.compania.findFirst({
        where: { 
            nombre: data.nombre,
            productorId: productorId
        }
      });

      if (!existeCompania) {
        await prisma.compania.create({
          data: {
            nombre: data.nombre,
            cuit: data.cuit || null,
            telefonoSiniestros: data.telefonoSiniestros || null,
            email: data.email || null,
            productorId // 🔥 La creamos para vos
          }
        });
      } else {
        await prisma.compania.update({
          where: { id: existeCompania.id },
          data: {
            cuit: data.cuit || existeCompania.cuit,
            telefonoSiniestros: data.telefonoSiniestros || existeCompania.telefonoSiniestros,
            email: data.email || existeCompania.email,
          }
        });
      }
      importadosCount++;
    }

    await prisma.actividad.create({
      data: {
        accion: 'Importó',
        entidad: 'Compañías',
        descripcion: `Se importaron ${importadosCount} compañías desde archivo Excel.`,
      }
    });

    res.status(201).json({ message: 'Importación exitosa', importados: importadosCount });
  } catch (error) {
    console.error("Error al importar compañías:", error);
    res.status(500).json({ error: 'Hubo un error al procesar el archivo Excel.' });
  }
});

// RUTA: PUT /api/companias/:id (Editar una compañía)
router.put('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    // 🔥 SEGURIDAD: Verificamos que sea TU compañía antes de editarla
    const vieja = await prisma.compania.findFirst({ 
        where: { 
            id: parseInt(id),
            productorId: productorId
        } 
    });

    if (!vieja) return res.status(403).json({ error: 'Compañía no encontrada o no autorizada.' });

    const actualizada = await prisma.compania.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre,
        cuit: data.cuit,
        telefonoSiniestros: data.telefonoSiniestros,
        email: data.email
      }
    });

    let cambios = [];
    if (vieja.nombre !== data.nombre) cambios.push(`Nombre: ${vieja.nombre} -> ${data.nombre}`);
    if (vieja.cuit !== data.cuit) cambios.push(`CUIT: ${vieja.cuit || '-'} -> ${data.cuit || '-'}`);
    if (vieja.telefonoSiniestros !== data.telefonoSiniestros) cambios.push(`Tel: ${vieja.telefonoSiniestros || '-'} -> ${data.telefonoSiniestros || '-'}`);

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Compañía",
        descripcion: cambios.length > 0 ? cambios.join(" | ") : "Actualización de contacto",
        cliente: actualizada.nombre
      }
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
});

// RUTA: DELETE /api/companias/:id (Eliminar una compañía)
router.delete('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
    const productorId = await obtenerProductorId(req.userId!);
    
    // 🔥 SEGURIDAD: Verificamos que sea TU compañía antes de borrarla
    const companiaABorrar = await prisma.compania.findFirst({ 
        where: { 
            id: parseInt(id),
            productorId: productorId
        } 
    });

    if (!companiaABorrar) return res.status(403).json({ error: 'Compañía no encontrada o no autorizada.' });

    await prisma.compania.delete({
      where: { id: parseInt(id) }
    });

    await prisma.actividad.create({
      data: {
        accion: "Baja",
        entidad: "Compañía",
        descripcion: `Se eliminó la aseguradora: ${companiaABorrar.nombre}`,
      }
    });

    res.json({ message: 'Compañía eliminada' });
  } catch (error: any) {
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'No podés eliminar una compañía que tiene pólizas activas.' });
    }
    res.status(500).json({ error: 'Error al eliminar la compañía.' });
  }
});

export default router;