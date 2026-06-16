import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const verificarSuscripcionActiva = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = (req as any).userId; 
  
  if (!userId) return res.status(401).json({ error: 'No autorizado' });

  // Siempre permitimos las peticiones GET (Modo Lectura)
  if (req.method === 'GET') {
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { suscripcion: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Si es plan Gratuito, no verificamos pagos, pero el límite de 10 clientes lo ataja otro middleware
    if (user.plan === 'GRATUITO') {
      return next();
    }

    const suscripcion = user.suscripcion;

    const pagoAutorizado = suscripcion?.estado === 'autorizado';
    
    // Obtenemos la fecha de vencimiento (si no tiene, usamos una muy vieja)
    const fechaVencimiento = suscripcion?.fechaVencimiento ? new Date(suscripcion.fechaVencimiento) : new Date(0);
    const hoy = new Date();

    const tieneDiasAFavor = fechaVencimiento > hoy;

    // 🔥 EL CHANGÜÍ: Calculamos 3 días extra de gracia
    const fechaLimiteGracia = new Date(fechaVencimiento);
    fechaLimiteGracia.setDate(fechaLimiteGracia.getDate() + 3);
    
    const enPeriodoDeGracia = hoy <= fechaLimiteGracia;

    // Si no pagó, no tiene días a favor, Y ya pasaron los 3 días de gracia... ¡Afuera!
    if (!pagoAutorizado && !tieneDiasAFavor && !enPeriodoDeGracia) {
      return res.status(403).json({ 
        error: 'Suscripción inactiva. Tu cuenta está en Modo Solo Lectura. Por favor, renová tu plan para realizar modificaciones.',
        codigo: 'SUSCRIPCION_INACTIVA'
      });
    }

    // Si pasa alguna de las pruebas (pagó, le sobran días, o está en el changüí), lo dejamos seguir trabajando
    next();
  } catch (error) {
    console.error("Error verificando suscripción:", error);
    res.status(500).json({ error: 'Error interno verificando la suscripción' });
  }
};