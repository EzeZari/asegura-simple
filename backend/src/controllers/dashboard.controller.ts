import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // Ejecutamos múltiples consultas en paralelo para que sea súper rápido
    const [
      totalAsegurados,
      totalPolizas,
      totalSiniestros,
      companiasConPolizas,
      polizasPorTipo,
      polizasPorEstado,
      aseguradosPorTipo
    ] = await Promise.all([
      // 1. KPIs Generales
      prisma.asegurado.count({ where: { activo: true } }),
      prisma.poliza.count(), // Todas, o podes filtrar por estado
      prisma.siniestro.count({ where: { estadoSiniestro: { not: "Cerrado" } } }), // Siniestros abiertos

      // 2. Distribución de Cartera por Compañía (Para gráfico de Dona)
      prisma.compania.findMany({
        select: {
          nombre: true,
          _count: { select: { polizas: true } }
        }
      }),

      // 3. Distribución por Tipo de Riesgo/Póliza (Auto, Moto, Combinado, etc.)
      prisma.poliza.groupBy({
        by: ['tipoPoliza'],
        _count: { _all: true }
      }),

      // 4. Estados de Pólizas (Vigentes vs Vencidas)
      prisma.poliza.groupBy({
        by: ['estado'],
        _count: { _all: true }
      }),

      // 5. Tipo de Asegurados (Individuo vs Empresa)
      prisma.asegurado.groupBy({
        by: ['tipo'],
        _count: { _all: true }
      })
    ]);

    // Formateamos los datos exactamente como los pide "Recharts" en el Frontend
    const statsData = {
      // Tarjetas de arriba (KPIs)
      kpis: {
        aseguradosActivos: totalAsegurados,
        polizasTotales: totalPolizas,
        siniestrosAbiertos: totalSiniestros,
      },
      
      // Datos para los Gráficos
      porCompania: companiasConPolizas
        .map(c => ({ name: c.nombre, value: c._count.polizas }))
        .filter(c => c.value > 0) // Solo mostramos las que tienen pólizas cargadas
        .sort((a, b) => b.value - a.value), // De mayor a menor

      porTipoPoliza: polizasPorTipo.map(p => ({
        name: p.tipoPoliza,
        value: p._count._all
      })),

      porEstadoPoliza: polizasPorEstado.map(p => ({
        name: p.estado,
        value: p._count._all
      })),

      aseguradosPorTipo: aseguradosPorTipo.map(a => ({
        name: a.tipo,
        value: a._count._all
      }))
    };

    res.status(200).json(statsData);

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: 'Hubo un error al calcular las estadísticas.' });
  }
};