import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';

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
      nombre, cuit, email, telefono, firma, usarFirma, // 🔥 EXTRAEMOS EL NUEVO DATO
      mensajeVencimiento, mensajeBienvenida,
      diasAlertaVencimiento, diasAlertaCritica,
      envioAutomaticoActivo, horaEnvioAutomatico,
      diasAvisoAutomatico, enviarMailBienvenida 
    } = req.body;
    
    const agenciaActualizada = await prisma.agencia.update({
      where: { id: 1 },
      data: { 
        nombre, cuit, email, telefono, firma, usarFirma, // 🔥 LO GUARDAMOS
        mensajeVencimiento, mensajeBienvenida,
        diasAlertaVencimiento, diasAlertaCritica,
        envioAutomaticoActivo, horaEnvioAutomatico,
        diasAvisoAutomatico, enviarMailBienvenida 
      }
    });

    const idBruto = req.user?.userId || req.user?.id || req.userId;
    if (idBruto) {
      const user = await prisma.user.findUnique({ where: { id: Number(idBruto) } });
      if (user) {
        const idAgencia = user.jefeId ? user.jefeId : user.id;
        
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