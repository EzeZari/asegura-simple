import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const verificarSuscripcionActiva = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  // 🔥 Leemos el userId exactamente como lo guarda tu verificarToken
  const userId = (req as any).userId; 
  
  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  // 🔥 REGLA 1: Si la petición es de LECTURA (GET), lo dejamos pasar siempre.
  if (req.method === 'GET') {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { suscripcion: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 🔥 REGLA 2: Si está en plan de prueba, pasa (las restricciones de cantidad se manejan en otro lado)
    if (user.plan === 'GRATUITO') {
      return next();
    }

    // 🔥 REGLA 3: Si tiene un plan pago, verificamos que Mercado Pago diga "autorizado"
    const tienePagoActivo = user.suscripcion?.estado === 'autorizado';

    if (!tienePagoActivo) {
      return res.status(403).json({ 
        error: 'Suscripción inactiva. Tu cuenta está en Modo Solo Lectura. Por favor, renová tu plan para realizar modificaciones.' 
      });
    }

    // Si tiene todo en regla, pasa y la petición continúa normal
    next();
  } catch (error) {
    console.error("Error verificando suscripción:", error);
    res.status(500).json({ error: 'Error interno verificando la suscripción' });
  }
};