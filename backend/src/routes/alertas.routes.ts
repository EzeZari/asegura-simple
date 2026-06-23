import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware'; // 🔥 Agregamos seguridad

const router = Router();

// 🔥 Aplicamos el middleware a TODAS las rutas
router.use(verificarToken);

// Función helper para aislar los datos del usuario logueado
const obtenerProductorId = async (userId: number): Promise<number> => {
  let productor = await prisma.productor.findUnique({ where: { userId } });
  
  if (!productor) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userEmail = user?.email || `user${userId}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: userId }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: user?.nombre || 'Productor',
          apellido: '',
          email: userEmail,
          usuario: userEmail,
          contrasenaHash: '',
          userId: userId
        }
      });
    }
  }
  
  return productor.id;
};

router.get('/', async (req, res) => {
  try {
    const hoy = new Date();
    const productorId = await obtenerProductorId(req.userId!); // 🔥 Obtenemos tu ID

    // 1. LEER CONFIGURACIÓN DINÁMICA DE LA AGENCIA
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasCritica = agencia?.diasAlertaCritica || 7;      // 7 por defecto
    const diasMax = agencia?.diasAlertaVencimiento || 30;     // 30 por defecto

    // --- MAGIA 1: LIMPIEZA AUTOMÁTICA ---
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const polizasCaducadas = await prisma.poliza.findMany({
      where: {
        // 🔥 AHORA LIMPIA TANTO VIGENTES COMO PENDIENTES DE PAGO QUE SE VENCIERON HACE MUCHO
        estado: { in: ['Vigente', 'Pendiente de Pago'] },
        fechaVencimiento: { lt: hace30Dias },
        asegurado: { productorId: productorId } // 🔥 SEGURIDAD: Solo limpia TUS pólizas
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
            productorId // 🔥 INYECTAMOS EL PRODUCTOR PARA QUE QUEDE EN SU HISTORIAL
          }
        });
      }
    }
    // --- FIN LIMPIEZA AUTOMÁTICA ---

    // --- LÓGICA DINÁMICA DE ALERTAS ---
    // Buscamos todas las pólizas vigentes o pendientes de pago hasta el rango máximo
    const enXDias = new Date();
    enXDias.setDate(hoy.getDate() + diasMax);

    const polizasPorVencer = await prisma.poliza.findMany({
      where: {
        // 🔥 ACÁ ESTÁ LA CLAVE: TRAE LAS PÓLIZAS ACTIVAS Y LAS QUE DEBEN PLATA
        estado: { in: ['Vigente', 'Pendiente de Pago'] },
        fechaVencimiento: { lte: enXDias },
        asegurado: { productorId: productorId } // 🔥 SEGURIDAD: Solo trae TUS alertas
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
      config: { diasCritica, diasMax } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

export default router;