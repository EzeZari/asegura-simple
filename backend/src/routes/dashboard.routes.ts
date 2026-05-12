import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const totalAsegurados = await prisma.asegurado.count({ where: { activo: true } });
    const polizasActivas = await prisma.poliza.count({ where: { estado: 'Vigente' } });
    
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const vencimientos = await prisma.poliza.count({
      where: { estado: 'Vigente', fechaVencimiento: { gte: hoy, lte: en30Dias } }
    });
    
    const totalCompanias = await prisma.compania.count();

    // ACÁ ESTÁ LA MAGIA NUEVA: Traemos el historial real
    const historial = await prisma.actividad.findMany({
      take: 6, // Traemos los últimos 6 movimientos
      orderBy: { fecha: 'desc' }
    });

    const actividadReciente = historial.map(h => ({
  id: h.id.toString(),
  type: `${h.accion} ${h.entidad}`, 
  detail: h.descripcion,            // <--- IMPORTANTE: que diga 'detail'
  client: h.cliente,                // <--- IMPORTANTE: que diga 'client'
  date: h.fecha.toLocaleString('es-AR', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
}));

    res.json({ totalAsegurados, polizasActivas, vencimientos, totalCompanias, actividadReciente });

  } catch (error) {
    console.error("Error al cargar stats:", error);
    res.status(500).json({ error: 'Error al cargar estadísticas del dashboard' });
  }
});

export default router;