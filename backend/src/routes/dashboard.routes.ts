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
// RUTA 1: ESTADÍSTICAS BÁSICAS DE INICIO (dashboard/KPIs)
// =======================================================
router.get('/stats', verificarToken, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Usuario no autenticado.' });

    const productorId = await obtenerProductorId(userId);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasParaAviso = agencia?.diasAlertaVencimiento || 30;

    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + diasParaAviso);

    const [
      totalAsegurados, polizasActivas, vencimientos, totalCompanias, historial
    ] = await Promise.all([
      prisma.asegurado.count({ where: { activo: true, productorId: productorId } }),
      prisma.poliza.count({ 
        where: { 
          fechaVencimiento: { gte: hoy },
          estado: { notIn: ['Anulada', 'Renovada', 'Vencida'] },
          asegurado: { productorId: productorId } 
        } 
      }),
      prisma.poliza.count({
        where: { 
          fechaVencimiento: { gte: hoy, lte: fechaLimite },
          estado: { notIn: ['Anulada', 'Renovada', 'Vencida'] },
          asegurado: { productorId: productorId }
        }
      }),
      prisma.compania.count({ where: { productorId: productorId } }),
      prisma.actividad.findMany({
        where: { productorId: productorId },
        take: 6,
        orderBy: { fecha: 'desc' }
      })
    ]);

    const actividadReciente = historial.map(h => ({
      id: h.id.toString(),
      type: `${h.accion} ${h.entidad}`, 
      detail: h.descripcion,
      client: h.cliente,
      date: h.fecha.toLocaleString('es-AR', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
    }));

    res.json({ totalAsegurados, polizasActivas, vencimientos, totalCompanias, actividadReciente });

  } catch (error) {
    console.error("Error al cargar stats:", error);
    res.status(500).json({ error: 'Error al cargar estadísticas del dashboard' });
  }
});

export default router;