import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';
import { verificarRol } from '../middlewares/role.middleware'; // 🔥 Importamos el guardia

const router = Router();
router.use(verificarToken);

// 🔥 FUNCIÓN HELPER: Sincroniza y detecta si es Dueño o Vendedor
const obtenerProductorId = async (userId: number): Promise<number> => {
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;
  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  if (!productor) {
    const userDueño = idAgencia === userId ? usuarioActual : await prisma.user.findUnique({ where: { id: idAgencia } });
    const userEmail = userDueño?.email || `user${idAgencia}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: idAgencia }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: userDueño?.nombre || 'Productor',
          apellido: '',
          email: userEmail,
          usuario: userEmail,
          contrasenaHash: '',
          userId: idAgencia
        }
      });
    }
  }
  return productor.id;
};

// 🟢 LECTURA: Pasa directo (Solo requiere token)
router.get('/', async (req, res) => {
  try {
    const productorId = await obtenerProductorId(req.userId!);
    
    const companias = await prisma.compania.findMany({
      where: { productorId: productorId },
      orderBy: { nombre: 'asc' }
    });
    res.json(companias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las compañías.' });
  }
});

// 🔴 ESCRITURA: Protegido por verificarRol
router.post('/', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res) => {
  try {
    const { nombre, cuit, telefonoSiniestros, email } = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    const nuevaCompania = await prisma.compania.create({
      data: {
        nombre, cuit, telefonoSiniestros, email, productorId 
      }
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Compañía",
        descripcion: `Aseguradora: ${nombre}`,
        productorId 
      }
    });

    res.status(201).json(nuevaCompania);
  } catch (error: any) {
    console.error("Error al guardar la compañía:", error);
    res.status(500).json({ error: 'Hubo un error al guardar la compañía.' });
  }
});

// 🔴 ESCRITURA: Protegido por verificarRol
router.post('/importar', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    const { companias } = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    if (!companias || !Array.isArray(companias) || companias.length === 0) {
      return res.status(400).json({ error: 'No se enviaron compañías para importar.' });
    }

    let importadosCount = 0;

    for (const data of companias) {
      if (!data.nombre) continue;

      const existeCompania = await prisma.compania.findFirst({
        where: { nombre: data.nombre, productorId: productorId }
      });

      if (!existeCompania) {
        await prisma.compania.create({
          data: {
            nombre: data.nombre,
            cuit: data.cuit || null,
            telefonoSiniestros: data.telefonoSiniestros || null,
            email: data.email || null,
            productorId 
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
        productorId // 🔥 INYECTADO
      }
    });

    res.status(201).json({ message: 'Importación exitosa', importados: importadosCount });
  } catch (error) {
    console.error("Error al importar compañías:", error);
    res.status(500).json({ error: 'Hubo un error al procesar el archivo Excel.' });
  }
});

// 🔴 ESCRITURA: Protegido por verificarRol
router.put('/:id', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    // 🔥 CORRECCIÓN TYPESCRIPT
    const id = req.params.id as string;
    const data = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    const vieja = await prisma.compania.findFirst({ 
        where: { id: parseInt(id), productorId: productorId } 
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
        cliente: actualizada.nombre,
        productorId // 🔥 INYECTADO
      }
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
});

// 🔴 ESCRITURA: Protegido por verificarRol
router.delete('/:id', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    // 🔥 CORRECCIÓN TYPESCRIPT
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);
    
    const companiaABorrar = await prisma.compania.findFirst({ 
        where: { id: parseInt(id), productorId: productorId } 
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
        productorId // 🔥 INYECTADO
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