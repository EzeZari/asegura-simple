import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const totalAsegurados = await prisma.asegurado.count({ where: { activo: true } });
    const polizasActivas = await prisma.poliza.count({ where: { estado: 'Vigente' } });
    
    const hoy = new Date();

    // 1. LEER LA CONFIGURACIÓN DE LA AGENCIA
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasParaAviso = agencia?.diasAlertaVencimiento || 30; // 30 por defecto

    // 2. CALCULAR LA FECHA LÍMITE DINÁMICA
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + diasParaAviso);

    // 3. BUSCAR VENCIMIENTOS USANDO LA NUEVA FECHA
    const vencimientos = await prisma.poliza.count({
      where: { 
        estado: 'Vigente', 
        fechaVencimiento: { gte: hoy, lte: fechaLimite } 
      }
    });
    
    const totalCompanias = await prisma.compania.count();

    // 4. HISTORIAL DE ACTIVIDAD RECIENTE
    const historial = await prisma.actividad.findMany({
      take: 6, // Traemos los últimos 6 movimientos
      orderBy: { fecha: 'desc' }
    });

    const actividadReciente = historial.map(h => ({
      id: h.id.toString(),
      type: `${h.accion} ${h.entidad}`, 
      detail: h.descripcion,
      client: h.cliente,
      date: h.fecha.toLocaleString('es-AR', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
    }));

    // ENVIAR TODO AL FRONTEND
    res.json({ 
      totalAsegurados, 
      polizasActivas, 
      vencimientos, 
      totalCompanias, 
      actividadReciente
    });

  } catch (error) {
    console.error("Error al cargar stats:", error);
    res.status(500).json({ error: 'Error al cargar estadísticas del dashboard' });
  }
});

export default router;