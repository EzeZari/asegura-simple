import { Router } from 'express';
import { prisma } from '../config/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const hoy = new Date();
    
    // 1. LEER CONFIGURACIÓN DINÁMICA DE LA AGENCIA
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasCritica = agencia?.diasAlertaCritica || 7;      // 7 por defecto
    const diasMax = agencia?.diasAlertaVencimiento || 30;     // 30 por defecto

    // --- MAGIA 1: LIMPIEZA AUTOMÁTICA ---
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const polizasCaducadas = await prisma.poliza.findMany({
      where: {
        estado: 'Vigente',
        fechaVencimiento: { lt: hace30Dias }
      },
      include: { asegurado: true }
    });

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

    // --- LÓGICA DINÁMICA DE ALERTAS ---
    // Buscamos todas las pólizas vigentes hasta el rango máximo configurado
    const enXDias = new Date();
    enXDias.setDate(hoy.getDate() + diasMax);

    const polizasPorVencer = await prisma.poliza.findMany({
      where: {
        estado: 'Vigente',
        fechaVencimiento: { lte: enXDias }
      },
      include: { asegurado: true, compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });

    const hoyMs = hoy.getTime();
    
    // Filtrar Vencidas
    const vencidas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias < 0;
    });

    // Filtrar Críticas (Usa los días configurados de forma dinámica)
    const criticas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias >= 0 && diffDias <= diasCritica;
    });

    // Filtrar Próximas (Arranca en díasCríticos + 1 hasta el máximo)
    const proximas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias > diasCritica && diffDias <= diasMax;
    });

    // Enviamos las alertas junto con la configuración actual del usuario
    res.json({ 
      vencidas, 
      criticas, 
      proximas,
      config: { diasCritica, diasMax } // <-- Enviamos esto al frontend
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

export default router;