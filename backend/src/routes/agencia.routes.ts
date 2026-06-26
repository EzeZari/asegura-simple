import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware'; // 🔥 FIX 1: Nombre correcto de tu middleware

const router = Router();

// GET: Obtener los datos de la agencia
router.get('/', verificarToken, async (req: any, res) => {
  try {
    let agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    
    if (!agencia) {
      agencia = await prisma.agencia.create({
        data: { id: 1, nombre: 'AseguraSimple' }
      });
    }
    
    res.json(agencia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los datos de la agencia' });
  }
});

// PUT: Actualizar los datos de la agencia
router.put('/', verificarToken, async (req: any, res) => {
  try {
    const { 
      nombre, cuit, email, telefono, firma, 
      mensajeVencimiento, mensajeBienvenida,
      diasAlertaVencimiento, diasAlertaCritica,
      envioAutomaticoActivo, horaEnvioAutomatico,
      diasAvisoAutomatico, enviarMailBienvenida 
    } = req.body;
    
    // 🔥 FIX 2 y 3: Guardamos todo lo visual en la tabla Agencia (como pide tu schema.prisma)
    const agenciaActualizada = await prisma.agencia.update({
      where: { id: 1 },
      data: { 
        nombre, cuit, email, telefono, firma,
        mensajeVencimiento, mensajeBienvenida,
        diasAlertaVencimiento, diasAlertaCritica,
        envioAutomaticoActivo, horaEnvioAutomatico,
        diasAvisoAutomatico, enviarMailBienvenida 
      }
    });

    // 🔥 EXTRA: Actualizamos silenciosamente los datos del robot en el Productor actual para que funcione el Cron Job
    const idBruto = req.user?.userId || req.user?.id || req.userId;
    if (idBruto) {
      const user = await prisma.user.findUnique({ where: { id: Number(idBruto) } });
      if (user) {
        const idAgencia = user.jefeId ? user.jefeId : user.id;
        
        // Usamos updateMany para que no explote si el perfil de Productor aún no se completó del todo
        await prisma.productor.updateMany({
          where: { userId: idAgencia },
          data: {
            envioAutomaticoActivo,
            horaEnvioAutomatico,
            diasAvisoAutomatico
          }
        });
      }
    }

    res.json(agenciaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar los datos de la agencia' });
  }
});

export default router;