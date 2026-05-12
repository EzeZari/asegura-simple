import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const polizasPorVencer = await prisma.poliza.findMany({
      where: {
        estado: 'Vigente',
        fechaVencimiento: { lte: en30Dias }
      },
      include: { asegurado: true, compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });

    const hoyMs = hoy.getTime();
    
    // 1. VENCIDAS (Menos de 0 días)
    const vencidas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias < 0;
    });

    // 2. CRÍTICAS (0 a 7 días)
    const criticas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias >= 0 && diffDias <= 7;
    });

    // 3. PRÓXIMAS (8 a 30 días)
    const proximas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias > 7 && diffDias <= 30;
    });

    // Ahora mandamos los 3 grupos
    res.json({ vencidas, criticas, proximas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

export default router;