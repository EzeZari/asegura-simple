import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Consulta minúscula para ver si Supabase responde
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'AseguraSimple Backend y Base de Datos ON 🔥',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🚨 Error crítico en Health Check:', error);
    
    res.status(503).json({ 
      status: 'error', 
      message: 'El servidor está arriba, pero Supabase está caído' 
    });
  }
};