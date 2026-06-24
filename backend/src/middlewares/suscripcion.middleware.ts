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
    // 1. Buscamos al usuario que está haciendo la petición
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!currentUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    // 🔥 LA MAGIA DEL EQUIPO: Determinar de quién es la cuenta principal
    // Si tiene un jefe (jefeId), miramos la suscripción del jefe. Si no, miramos la suya.
    const accountOwnerId = currentUser.jefeId ? currentUser.jefeId : userId;

    // 2. Buscamos al dueño de la cuenta con su suscripción y su plan
    const accountOwner = await prisma.user.findUnique({
      where: { id: accountOwnerId },
      include: { suscripcion: true }
    });

    if (!accountOwner) return res.status(404).json({ error: 'Dueño de cuenta no encontrado' });

    // Si la agencia entera está en plan Gratuito, no verificamos pagos
    // (El límite de 10 clientes lo ataja otro middleware)
    if (accountOwner.plan === 'GRATUITO') {
      return next();
    }

    const suscripcion = accountOwner.suscripcion;

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