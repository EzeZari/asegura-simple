import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

// 🔥 HELPER ACTUALIZADO: Sincroniza al equipo con la base de datos del Dueño
const obtenerProductorId = async (userId: number): Promise<number> => {
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  
  // Si tiene jefe, usamos el ID del jefe (dueño de la agencia). Si no, usa su propio ID.
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;

  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  if (!productor) {
    const userDueño = idAgencia === userId ? usuarioActual : await prisma.user.findUnique({ where: { id: idAgencia } });
    const userEmail = userDueño?.email || `user${idAgencia}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: idAgencia }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: userDueño?.nombre || 'Productor',
          apellido: '',
          email: userEmail,
          usuario: userEmail,
          contrasenaHash: '',
          userId: idAgencia
        }
      });
    }
  }
  
  return productor.id;
};

router.get('/', async (req, res) => {
  try {
    const hoy = new Date();
    // 🔥 Ahora sí: el Lector o Productor obtendrán el productorId de su jefe
    const productorId = await obtenerProductorId(req.userId!); 

    // 1. LEER CONFIGURACIÓN DINÁMICA DE LA AGENCIA
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasCritica = agencia?.diasAlertaCritica || 7;      
    const diasMax = agencia?.diasAlertaVencimiento || 30;     

    // --- MAGIA 1: LIMPIEZA AUTOMÁTICA ---
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const polizasCaducadas = await prisma.poliza.findMany({
      where: {
        estado: { in: ['Vigente', 'Pendiente de Pago'] },
        fechaVencimiento: { lt: hace30Dias },
        asegurado: { productorId: productorId } 
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
            cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(),
            productorId 
          }
        });
      }
    }
    // --- FIN LIMPIEZA AUTOMÁTICA ---

    // --- LÓGICA DINÁMICA DE ALERTAS ---
    const enXDias = new Date();
    enXDias.setDate(hoy.getDate() + diasMax);

    const polizasPorVencer = await prisma.poliza.findMany({
      where: {
        estado: { in: ['Vigente', 'Pendiente de Pago'] },
        fechaVencimiento: { lte: enXDias },
        asegurado: { productorId: productorId } 
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

    // Filtrar Críticas
    const criticas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias >= 0 && diffDias <= diasCritica;
    });

    // Filtrar Próximas
    const proximas = polizasPorVencer.filter(p => {
      const diffDias = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
      return diffDias > diasCritica && diffDias <= diasMax;
    });

    res.json({ 
      vencidas, 
      criticas, 
      proximas,
      config: { diasCritica, diasMax } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

export default router;