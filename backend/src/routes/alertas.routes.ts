import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const hoy = new Date();
    
    // --- MAGIA 1: LIMPIEZA AUTOMÁTICA ---
    // Calculamos qué fecha fue hace 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    // Buscamos si quedó alguna póliza "Vigente" que haya vencido hace más de 30 días
    const polizasCaducadas = await prisma.poliza.findMany({
      where: {
        estado: 'Vigente',
        fechaVencimiento: { lt: hace30Dias }
      },
      include: { asegurado: true }
    });

    // Si encuentra, las anula una por una y deja el registro en el historial
    if (polizasCaducadas.length > 0) {
      for (const poliza of polizasCaducadas) {
        await prisma.poliza.update({
          where: { id: poliza.id },
          data: { estado: 'Anulada' }
        });

        await prisma.actividad.create({
          data: {
            accion: "Edición",
            entidad: "Póliza",
            descripcion: `Anulada automáticamente (> 30 días vencida)`,
            cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim()
          }
        });
      }
    }
    // --- FIN LIMPIEZA AUTOMÁTICA ---

    // --- LÓGICA NORMAL DE ALERTAS ---
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
    
    const vencidas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias < 0;
    });

    const criticas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias >= 0 && diffDias <= 7;
    });

    const proximas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias > 7 && diffDias <= 30;
    });

    res.json({ vencidas, criticas, proximas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

export default router;