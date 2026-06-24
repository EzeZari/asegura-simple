import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    // Verificamos que el token pertenezca a nuestro SUPERADMIN
    if (decoded.rol !== 'SUPERADMIN') {
      res.status(403).json({ error: 'No tienes permisos de super administrador.' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token de administrador inválido o expirado.' });
  }
};