import { Request, Response } from 'express';
import { prisma } from '../config/db';

const obtenerIdSeguro = (req: any): number => {
  const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;
  if (!idBruto) throw new Error("No autorizado. Token inválido o sin ID.");
  return Number(idBruto);
};

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
        data: { nombre: userDueño?.nombre || 'Productor', apellido: '', email: userEmail, usuario: userEmail, contrasenaHash: '', userId: idAgencia }
      });
    }
  }
  return productor.id;
};

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = obtenerIdSeguro(req);
    const productorId = await obtenerProductorId(userId); 

    const totalAsegurados = await prisma.asegurado.count({
      where: { productorId: productorId, activo: true }
    });

    const polizasActivas = await prisma.poliza.count({
      where: { productorId: productorId, estado: 'Vigente' }
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const vencimientos = await prisma.poliza.count({
      where: {
        productorId: productorId,
        fechaVencimiento: { gte: hoy, lte: en30Dias },
        estado: 'Vigente' 
      }
    });

    const totalCompanias = await prisma.compania.count({
      where: { productorId: productorId }
    });

    const historial = await prisma.actividad.findMany({
      where: { productorId: productorId },
      take: 10,
      orderBy: { fecha: 'desc' }
    });

    const actividadReciente = historial.map(h => ({
      id: h.id.toString(),
      type: `${h.accion} ${h.entidad}`, 
      detail: h.descripcion,
      client: h.cliente,
      date: h.fecha.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit' })
    }));

    // 🔥 AHORA TRAEMOS TODOS LOS VENCIMIENTOS DEL MES (Sin el 'take: 7')
    const renovacionesProximas = await prisma.poliza.findMany({
      where: {
        productorId: productorId,
        estado: 'Vigente',
        fechaVencimiento: { gte: hoy, lte: en30Dias }
      },
      include: {
        asegurado: { select: { nombre: true, apellido: true } },
        compania: { select: { nombre: true } }
      },
      orderBy: { fechaVencimiento: 'asc' }
    });

    // 🔥 AHORA TRAEMOS TODOS LOS SINIESTROS ACTIVOS (Sin el 'take: 5')
    const siniestrosActivosRaw = await prisma.siniestro.findMany({
      where: {
        productorId: productorId,
        estadoSiniestro: { not: 'Cerrado' }
      },
      include: {
        poliza: { include: { asegurado: { select: { nombre: true, apellido: true } } } }
      },
      orderBy: { fechaHecho: 'desc' }
    });

    const siniestrosActivos = siniestrosActivosRaw.map(sin => ({
      ...sin,
      asegurado: sin.poliza?.asegurado,
      fechaOcurrencia: sin.fechaHecho,
      estado: sin.estadoSiniestro
    }));

    const actividadRobots = await prisma.actividad.findMany({
      where: { productorId: productorId, accion: 'Automatización' },
      orderBy: { fecha: 'desc' },
      take: 5
    });

    res.json({
      totalAsegurados,
      polizasActivas,
      vencimientos,
      totalCompanias,
      actividadReciente,
      renovacionesProximas,
      siniestrosActivos,
      actividadRobots
    });
  } catch (error: any) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ error: "Error interno al cargar el dashboard." });
  }
};