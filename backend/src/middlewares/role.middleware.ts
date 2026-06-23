import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const verificarRol = (rolesPermitidos: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      // req.userId viene del middleware de autenticación (auth.middleware.ts)
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const user = await prisma.user.findUnique({ 
        where: { id: req.userId },
        select: { role: true, jefeId: true } // Solo traemos lo necesario por rendimiento
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // 🔥 LÓGICA DE NEGOCIO INTELIGENTE:
      // Si el usuario no tiene jefe (jefeId === null), es el DUEÑO de la agencia.
      const rolEfectivo = user.jefeId === null ? 'DUENO' : user.role;

      if (!rolesPermitidos.includes(rolEfectivo)) {
        return res.status(403).json({ 
          error: 'Acceso denegado. Tu rol no tiene permisos para realizar esta acción.' 
        });
      }

      // Si todo está bien, lo dejamos pasar al controlador
      next();
    } catch (error) {
      console.error("Error en role.middleware:", error);
      return res.status(500).json({ error: 'Error al verificar permisos del usuario.' });
    }
  };
};