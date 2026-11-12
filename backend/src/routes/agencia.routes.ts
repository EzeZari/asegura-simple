import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

// Helper para obtener el Productor asociado al usuario o a su agencia jefa
const obtenerProductorId = async (userId: number): Promise<number> => {
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;

  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  if (!productor) {
    const userDueno = idAgencia === userId ? usuarioActual : await prisma.user.findUnique({ where: { id: idAgencia } });
    const userEmail = userDueno?.email || `user${idAgencia}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: idAgencia }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: userDueno?.nombre || 'Productor',
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

// GET: Obtener los datos de la agencia DEL PRODUCTOR ACTUAL
router.get('/', verificarToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.userId;
    const productorId = await obtenerProductorId(userId);

    // 🔥 Buscamos la agencia usando el productorId
    let agencia = await prisma.agencia.findUnique({ where: { productorId } });
    
    // Si es la primera vez que entra, se la creamos
    if (!agencia) {
      agencia = await prisma.agencia.create({
        data: { 
          productorId, 
          nombre: 'Mi Agencia' 
        }
      });
    }
    
    res.json(agencia);
  } catch (error) {
    console.error("Error al obtener la agencia:", error);
    res.status(500).json({ error: 'Error al obtener los datos de la agencia' });
  }
});

// PUT: Actualizar los datos de la agencia DEL PRODUCTOR ACTUAL
router.put('/', verificarToken, async (req: any, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.userId;
    const productorId = await obtenerProductorId(userId);

    const { 
      nombre, cuit, email, telefono, firma, usarFirma, 
      mensajeVencimiento, mensajeBienvenida,
      mensajePolizaCritica, mensajePolizaVencida, 
      diasAlertaVencimiento, diasAlertaCritica,
      envioAutomaticoActivo, horaEnvioAutomatico,
      diasAvisoAutomatico, enviarMailBienvenida 
    } = req.body;
    
    // 🔥 Actualizamos (o creamos) usando el productorId
    const agenciaActualizada = await prisma.agencia.upsert({
      where: { productorId },
      update: { 
        nombre, cuit, email, telefono, firma, usarFirma, 
        mensajeVencimiento, mensajeBienvenida,
        mensajePolizaCritica, mensajePolizaVencida, 
        diasAlertaVencimiento, diasAlertaCritica,
        envioAutomaticoActivo, horaEnvioAutomatico,
        diasAvisoAutomatico, enviarMailBienvenida 
      },
      create: {
        productorId,
        nombre, cuit, email, telefono, firma, usarFirma, 
        mensajeVencimiento, mensajeBienvenida,
        mensajePolizaCritica, mensajePolizaVencida, 
        diasAlertaVencimiento, diasAlertaCritica,
        envioAutomaticoActivo, horaEnvioAutomatico,
        diasAvisoAutomatico, enviarMailBienvenida 
      }
    });

    // Mantenemos sincronizado el perfil del Productor por seguridad
    await prisma.productor.update({
      where: { id: productorId },
      data: {
        envioAutomaticoActivo,
        horaEnvioAutomatico,
        diasAvisoAutomatico
      }
    });

    res.json(agenciaActualizada);
  } catch (error) {
    console.error("Error al actualizar agencia:", error);
    res.status(500).json({ error: 'Error al actualizar los datos de la agencia' });
  }
});

export default router;