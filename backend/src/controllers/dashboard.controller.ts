import { Request, Response } from 'express';
import { prisma } from '../config/db';

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

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    // 🔥 Ahora este ID es el de la AGENCIA
    const productorId = await obtenerProductorId(userId);

    // Ejecutamos las consultas en paralelo usando productorId
    const [
      totalAsegurados,
      totalPolizas,
      totalSiniestros,
      companiasConPolizas,
      polizasPorTipo,
      polizasPorEstado,
      aseguradosPorTipo,
      historialActividad
    ] = await Promise.all([
      prisma.asegurado.count({ where: { activo: true, productorId } }),
      prisma.poliza.count({ where: { asegurado: { productorId } } }),
      prisma.siniestro.count({
        where: { estadoSiniestro: { not: "Cerrado" }, poliza: { asegurado: { productorId } } }
      }),
      prisma.compania.findMany({
        where: { polizas: { some: { asegurado: { productorId } } } },
        select: { nombre: true, _count: { select: { polizas: { where: { asegurado: { productorId } } } } } }
      }),
      prisma.poliza.groupBy({ by: ['tipoPoliza'], where: { asegurado: { productorId } }, _count: { _all: true } }),
      prisma.poliza.groupBy({ by: ['estado'], where: { asegurado: { productorId } }, _count: { _all: true } }),
      prisma.asegurado.groupBy({ by: ['tipo'], where: { productorId }, _count: { _all: true } }),
      prisma.actividad.findMany({
        where: { productorId },
        take: 6,
        orderBy: { fecha: 'desc' }
      })
    ]);

    const actividadReciente = historialActividad.map(h => ({
      id: h.id.toString(),
      type: `${h.accion} ${h.entidad}`, 
      detail: h.descripcion,
      client: h.cliente || 'Sistema',
      date: h.fecha.toLocaleString('es-AR', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
    }));

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
      actividadReciente 
    };

    return res.status(200).json(statsData);

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return res.status(500).json({ error: 'Hubo un error al calcular las estadísticas.' });
  }
};