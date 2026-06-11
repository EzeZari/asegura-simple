import { Request, Response } from 'express';
import { prisma } from '../config/db';

// 🔥 Función helper para sincronizar el User con el Productor y obtener el ID real
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

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    // 🔥 Obtenemos el ID del Productor para aislar TODO el panel
    const productorId = await obtenerProductorId(userId);

    // Ejecutamos las consultas en paralelo usando productorId para máxima seguridad y velocidad
    const [
      totalAsegurados,
      totalPolizas,
      totalSiniestros,
      companiasConPolizas,
      polizasPorTipo,
      polizasPorEstado,
      aseguradosPorTipo,
      historialActividad // 🔥 Agregamos el historial de Actividad a la consulta
    ] = await Promise.all([
      
      // 1. Total Asegurados
      prisma.asegurado.count({ where: { activo: true, productorId } }),

      // 2. Total Pólizas
      prisma.poliza.count({ where: { asegurado: { productorId } } }),

      // 3. Siniestros abiertos
      prisma.siniestro.count({
        where: { estadoSiniestro: { not: "Cerrado" }, poliza: { asegurado: { productorId } } }
      }),

      // 4. Compañías (Solo contamos las pólizas del productor actual en cada compañía)
      prisma.compania.findMany({
        where: { polizas: { some: { asegurado: { productorId } } } },
        select: { nombre: true, _count: { select: { polizas: { where: { asegurado: { productorId } } } } } }
      }),

      // 5. Distribución por Tipo de Riesgo
      prisma.poliza.groupBy({ by: ['tipoPoliza'], where: { asegurado: { productorId } }, _count: { _all: true } }),

      // 6. Estados de Pólizas
      prisma.poliza.groupBy({ by: ['estado'], where: { asegurado: { productorId } }, _count: { _all: true } }),

      // 7. Tipo de Asegurados (Individuo vs Empresa)
      prisma.asegurado.groupBy({ by: ['tipo'], where: { productorId }, _count: { _all: true } }),

      // 8. 🔥 Historial de Actividad (SOLO LAS DEL USUARIO LOGUEADO)
      prisma.actividad.findMany({
        where: { productorId },
        take: 6,
        orderBy: { fecha: 'desc' }
      })
    ]);

    // 🔥 Formateamos la actividad para que el frontend la lea bien
    const actividadReciente = historialActividad.map(h => ({
      id: h.id.toString(),
      type: `${h.accion} ${h.entidad}`, 
      detail: h.descripcion,
      client: h.cliente,
      date: h.fecha.toLocaleString('es-AR', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
    }));

    // Formateamos las estructuras exactamente para los gráficos de Recharts del Front
    const statsData = {
      kpis: {
        aseguradosActivos: totalAsegurados,
        polizasTotales: totalPolizas,
        siniestrosAbiertos: totalSiniestros,
      },
      
      porCompania: companiasConPolizas
        .map(c => ({ name: c.nombre, value: c._count.polizas }))
        .filter(c => c.value > 0)
        .sort((a, b) => b.value - a.value),

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
      })),

      actividadReciente // 🔥 Inyectamos la actividad acá para que el frontend la reciba
    };

    return res.status(200).json(statsData);

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return res.status(500).json({ error: 'Hubo un error al calcular las estadísticas.' });
  }
};