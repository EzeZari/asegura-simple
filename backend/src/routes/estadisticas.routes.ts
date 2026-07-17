import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

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

// =======================================================
// RUTA: ESTADÍSTICAS AVANZADAS CON FILTRO DE TIEMPO
// =======================================================
router.get('/graficos', verificarToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { periodo, inicio, fin } = req.query; 

    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado.' });
    
    const productorId = await obtenerProductorId(userId);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    let fechaInicioActual = new Date(0); 
    let fechaFinActual = new Date(); 
    let fechaInicioAnterior = new Date(0);
    let fechaFinAnterior = new Date();

    if (periodo === 'mes') {
      fechaInicioActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      fechaInicioAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      fechaFinAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59);
    } else if (periodo === 'trimestre') {
      fechaInicioActual = new Date();
      fechaInicioActual.setMonth(hoy.getMonth() - 3);
      fechaInicioAnterior = new Date();
      fechaInicioAnterior.setMonth(hoy.getMonth() - 6);
      fechaFinAnterior = new Date();
      fechaFinAnterior.setMonth(hoy.getMonth() - 3);
    } else if (periodo === 'anio') {
      fechaInicioActual = new Date(hoy.getFullYear(), 0, 1);
      fechaInicioAnterior = new Date(hoy.getFullYear() - 1, 0, 1);
      fechaFinAnterior = new Date(hoy.getFullYear() - 1, 11, 31, 23, 59, 59);
    } else if (periodo === 'personalizado' && inicio && fin) {
      fechaInicioActual = new Date(inicio as string);
      fechaFinActual = new Date(fin as string);
      fechaFinActual.setHours(23, 59, 59, 999);

      const diffTime = fechaFinActual.getTime() - fechaInicioActual.getTime();
      fechaFinAnterior = new Date(fechaInicioActual.getTime() - 1);
      fechaInicioAnterior = new Date(fechaFinAnterior.getTime() - diffTime);
    }

    const whereActual: any = { asegurado: { productorId: productorId } };
    if (periodo !== 'historico') {
      whereActual.fechaInicio = { gte: fechaInicioActual, lte: fechaFinActual };
    }

    const whereAnterior: any = { asegurado: { productorId: productorId } };
    if (periodo !== 'historico') {
      whereAnterior.fechaInicio = { gte: fechaInicioAnterior, lte: fechaFinAnterior };
    }

    // 1. TRAEMOS TODAS LAS PÓLIZAS
    const polizasRaw = await prisma.poliza.findMany({
      where: whereActual,
      select: { estado: true, fechaVencimiento: true }
    });

    const conteoEstados: Record<string, number> = {};
    
    // 2. FILTRO INTELIGENTE
    polizasRaw.forEach(p => {
      let estadoReal = p.estado;
      if (new Date(p.fechaVencimiento) < hoy && !['Anulada', 'Renovada'].includes(p.estado)) {
        estadoReal = 'Vencida';
      }
      conteoEstados[estadoReal] = (conteoEstados[estadoReal] || 0) + 1;
    });

    const polizasPorEstadoCalculado = Object.keys(conteoEstados).map(key => ({
      name: key,
      value: conteoEstados[key]
    }));

    const [
      companiasConPolizas, polizasPorTipo, totalSiniestrosAbiertos, polizasPeriodoActual, polizasPeriodoAnterior
    ] = await Promise.all([
      prisma.compania.findMany({
        where: { productorId: productorId, polizas: { some: { asegurado: { productorId: productorId } } } },
        select: { nombre: true, _count: { select: { polizas: { where: whereActual } } } }
      }),
      prisma.poliza.groupBy({ by: ['tipoPoliza'], where: whereActual, _count: { _all: true } }),
      prisma.siniestro.count({ 
        where: { estadoSiniestro: { not: 'Cerrado' }, poliza: { asegurado: { productorId: productorId } } } 
      }),
      prisma.poliza.count({ where: whereActual }),
      prisma.poliza.count({ where: whereAnterior })
    ]);

    let tendenciaPorcentaje = 0;
    if (periodo !== 'historico' && polizasPeriodoAnterior > 0) {
      tendenciaPorcentaje = ((polizasPeriodoActual - polizasPeriodoAnterior) / polizasPeriodoAnterior) * 100;
    } else if (periodo !== 'historico' && polizasPeriodoAnterior === 0 && polizasPeriodoActual > 0) {
      tendenciaPorcentaje = 100;
    }

    res.json({
      porCompania: companiasConPolizas.map(c => ({ name: c.nombre, value: c._count.polizas })).filter(c => c.value > 0), 
      porTipo: polizasPorTipo.map(p => ({ name: p.tipoPoliza, value: p._count._all })),
      porEstado: polizasPorEstadoCalculado,
      siniestrosAbiertos: totalSiniestrosAbiertos,
      tendencia: { porcentaje: Math.round(tendenciaPorcentaje), unidadesActuales: polizasPeriodoActual }
    });

  } catch (error) {
    console.error("Error al procesar los gráficos:", error);
    res.status(500).json({ error: 'Error al procesar los gráficos' });
  }
});

export default router;