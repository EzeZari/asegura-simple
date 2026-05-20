import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

// =======================================================
// RUTA 1: PARA TU PANTALLA DE INICIO ACTUAL (NO SE TOCA)
// =======================================================
router.get('/stats', async (req, res) => {
  try {
    const totalAsegurados = await prisma.asegurado.count({ where: { activo: true } });
    const polizasActivas = await prisma.poliza.count({ where: { estado: 'Vigente' } });
    
    const hoy = new Date();

    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasParaAviso = agencia?.diasAlertaVencimiento || 30;

    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + diasParaAviso);

    const vencimientos = await prisma.poliza.count({
      where: { 
        estado: 'Vigente', 
        fechaVencimiento: { gte: hoy, lte: fechaLimite } 
      }
    });
    
    const totalCompanias = await prisma.compania.count();

    const historial = await prisma.actividad.findMany({
      take: 6,
      orderBy: { fecha: 'desc' }
    });

    const actividadReciente = historial.map(h => ({
      id: h.id.toString(),
      type: `${h.accion} ${h.entidad}`, 
      detail: h.descripcion,
      client: h.cliente,
      date: h.fecha.toLocaleString('es-AR', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
    }));

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

// =======================================================
// RUTA 2: PARA LA NUEVA PESTAÑA DE ESTADÍSTICAS (GRÁFICOS)
// =======================================================
router.get('/graficos', async (req, res) => {
  try {
    // Agrupamos y contamos los datos reales de tu BD para los gráficos
    const [
      companiasConPolizas,
      polizasPorTipo,
      polizasPorEstado,
      totalSiniestrosAbiertos
    ] = await Promise.all([
      // 1. Para el gráfico de torta/dona: Pólizas por Compañía
      prisma.compania.findMany({
        select: {
          nombre: true,
          _count: { select: { polizas: true } }
        }
      }),
      // 2. Para gráfico de barras: tipos de pólizas (Auto, Moto, etc.)
      prisma.poliza.groupBy({
        by: ['tipoPoliza'],
        _count: { _all: true }
      }),
      // 3. Estados de las pólizas
      prisma.poliza.groupBy({
        by: ['estado'],
        _count: { _all: true }
      }),
      // 4. Siniestros pendientes
      prisma.siniestro.count({
        where: { estadoSiniestro: { not: 'Cerrado' } }
      })
    ]);

    // Formateamos la respuesta limpia para que el Front la entienda de una
    res.json({
      porCompania: companiasConPolizas
        .map(c => ({ name: c.nombre, value: c._count.polizas }))
        .filter(c => c.value > 0), // Solo las que tienen pólizas
      porTipo: polizasPorTipo.map(p => ({ name: p.tipoPoliza, value: p._count._all })),
      porEstado: polizasPorEstado.map(p => ({ name: p.estado, value: p._count._all })),
      siniestrosAbiertos: totalSiniestrosAbiertos
    });

  } catch (error) {
    console.error("Error al cargar datos de gráficos:", error);
    res.status(500).json({ error: 'Error al procesar las estadísticas de los gráficos' });
  }
});

export default router;