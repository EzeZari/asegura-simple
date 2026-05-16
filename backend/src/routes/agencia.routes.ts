import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// GET: Obtener los datos de la agencia (Si no existe, la crea vacía por defecto)
router.get('/', async (req, res) => {
  try {
    let agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    
    if (!agencia) {
      agencia = await prisma.agencia.create({
        data: { id: 1, nombre: 'AseguraSimple' }
      });
    }
    
    res.json(agencia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos de la agencia' });
  }
});

  // PUT: Actualizar los datos de la agencia (incluyendo plantillas)
router.put('/', async (req, res) => {
  try {
    const { 
      nombre, cuit, email, telefono, firma, 
      mensajeVencimiento, mensajeBienvenida // <-- Agregamos los campos acá
    } = req.body;
    
    const agenciaActualizada = await prisma.agencia.update({
      where: { id: 1 },
      data: { 
        nombre, cuit, email, telefono, firma,
        mensajeVencimiento, mensajeBienvenida // <-- Y los guardamos acá
      }
    });

    res.json(agenciaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar los datos de la agencia' });
  }
});

export default router;