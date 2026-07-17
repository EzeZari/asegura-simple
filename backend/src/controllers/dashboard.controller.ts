import { Request, Response } from 'express';
import { prisma } from '../config/db';

// 🔥 HELPER: Función antibug para sacar el ID del token
const obtenerIdSeguro = (req: any): number => {
  const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;
  if (!idBruto) throw new Error("No autorizado. Token inválido o sin ID.");
  return Number(idBruto);
};

// 🔥 HELPER: Detecta la Agencia para que el Vendedor vea los mismos números que el Dueño
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
    const productorId = await obtenerProductorId(userId); // 🔥 Acá unificamos las vistas

    // 1. Total Asegurados
    const totalAsegurados = await prisma.asegurado.count({
      where: { productorId: productorId, activo: true }
    });

    // 2. Pólizas Activas (Vigentes reales)
    const polizasActivas = await prisma.poliza.count({
      where: { 
        asegurado: { productorId: productorId },
        estado: 'Vigente' // 🔥 CORREGIDO: Ahora busca estrictamente "Vigente"
      }
    });

    // 3. Vencimientos próximos (30 días)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const vencimientos = await prisma.poliza.count({
      where: {
        asegurado: { productorId: productorId },
        fechaVencimiento: { gte: hoy, lte: en30Dias },
        estado: 'Vigente' // 🔥 CORREGIDO: Solo alerta sobre vencimientos de las que están vigentes
      }
    });

    // 4. Total Aseguradoras
    const totalCompanias = await prisma.compania.count({
      where: { productorId: productorId }
    });

    // 5. Actividad Reciente de TODA la agencia
    const actividadReciente = await prisma.actividad.findMany({
      where: { productorId: productorId },
      orderBy: { fecha: 'desc' },
      take: 10
    });

    res.json({
      totalAsegurados,
      polizasActivas,
      vencimientos,
      totalCompanias,
      actividadReciente
    });
  } catch (error: any) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    res.status(500).json({ error: "Error interno al cargar el dashboard." });
  }
};