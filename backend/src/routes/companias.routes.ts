import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// RUTA: GET /api/companias (Traer todas las compañías)
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

// RUTA: POST /api/companias (Crear una compañía nueva)
router.post('/', async (req, res) => {
  try {
    const { nombre, cuit, telefonoSiniestros, email } = req.body;

    const nuevaCompania = await prisma.compania.create({
      data: {
        nombre,
        cuit,
        telefonoSiniestros,
        email
      }
    });

    // REGISTRO DE ACTIVIDAD
    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Compañía",
        descripcion: `Aseguradora: ${nombre}`,
      }
    });

    res.status(201).json(nuevaCompania);
  } catch (error: any) {
    console.error("Error al guardar la compañía:", error);
    res.status(500).json({ error: 'Hubo un error al guardar la compañía.' }); // ¡Acá estaba el texto viejo!
  }
});

// RUTA: PUT /api/companias/:id (Editar una compañía)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const vieja = await prisma.compania.findUnique({ where: { id: parseInt(id) } });

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
    if (vieja && vieja.nombre !== data.nombre) cambios.push(`Nombre: ${vieja.nombre} -> ${data.nombre}`);
    if (vieja && vieja.cuit !== data.cuit) cambios.push(`CUIT: ${vieja.cuit || '-'} -> ${data.cuit || '-'}`);
    if (vieja && vieja.telefonoSiniestros !== data.telefonoSiniestros) cambios.push(`Tel: ${vieja.telefonoSiniestros || '-'} -> ${data.telefonoSiniestros || '-'}`);

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Compañía",
        descripcion: cambios.length > 0 ? cambios.join(" | ") : "Actualización de contacto",
        cliente: actualizada.nombre // En compañías usamos el nombre de la empresa como 'cliente'
      }
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
});

// RUTA: DELETE /api/companias/:id (Eliminar una compañía)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const companiaABorrar = await prisma.compania.findUnique({ where: { id: parseInt(id) } });

    await prisma.compania.delete({
      where: { id: parseInt(id) }
    });

    // REGISTRO DE ACTIVIDAD
    if (companiaABorrar) {
      await prisma.actividad.create({
        data: {
          accion: "Baja",
          entidad: "Compañía",
          descripcion: `Se eliminó la aseguradora: ${companiaABorrar.nombre}`,
        }
      });
    }

    res.json({ message: 'Compañía eliminada' });
  } catch (error: any) {
    // Si da error porque tiene pólizas asociadas, atajamos el código P2003 de Prisma
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'No podés eliminar una compañía que tiene pólizas activas.' });
    }
    res.status(500).json({ error: 'Error al eliminar la compañía.' });
  }
});

export default router;