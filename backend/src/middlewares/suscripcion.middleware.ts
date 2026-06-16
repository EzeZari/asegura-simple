import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const verificarSuscripcionActiva = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = (req as any).userId; 
  
  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  if (req.method === 'GET') {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { suscripcion: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.plan === 'GRATUITO') {
      return next();
    }

    const suscripcion = user.suscripcion;

    // 🔥 REGLA A: Si tiene la tarjeta y el cobro al día, lo dejamos pasar.
    const pagoAutorizado = suscripcion?.estado === 'autorizado';

    // 🔥 REGLA B (NUEVA): Si no está autorizado (ej. canceló), pero la fecha de vencimiento es a futuro, TAMBIÉN lo dejamos pasar.
    const tieneDiasAFavor = suscripcion?.fechaVencimiento && new Date(suscripcion.fechaVencimiento) > new Date();

    if (!pagoAutorizado && !tieneDiasAFavor) {
      return res.status(403).json({ 
        error: 'Suscripción inactiva. Tu cuenta está en Modo Solo Lectura. Por favor, renová tu plan para realizar modificaciones.',
        codigo: 'SUSCRIPCION_INACTIVA'
      });
    }

    // Si tiene el pago al día O tiene días a favor, sigue de largo sin problema.
    next();
  } catch (error) {
    console.error("Error verificando suscripción:", error);
    res.status(500).json({ error: 'Error interno verificando la suscripción' });
  }
};