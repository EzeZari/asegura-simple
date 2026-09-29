import { Response } from 'express';
import { prisma } from '../config/db';
import { enviarAlertaSugerencia } from '../services/email.service'; // 🔥 Importamos el mail

export const crearSugerencia = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = Number(req.user?.userId || req.user?.id || req.userId);
    const { titulo, descripcion } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (user.plan === 'GRATUITO') {
      return res.status(403).json({ 
        error: "El buzón de sugerencias es exclusivo para clientes con planes activos." 
      });
    }

    // 1. Guardamos la sugerencia en la base de datos
    const nuevaSugerencia = await prisma.sugerencia.create({
      data: {
        titulo,
        descripcion,
        userId
      }
    });

    // 🔥 2. Te mandamos el mail avisándote
    await enviarAlertaSugerencia(
      user.nombre,
      user.email,
      user.plan,
      titulo,
      descripcion
    );

    res.json({ success: true, message: "¡Sugerencia enviada con éxito!", sugerencia: nuevaSugerencia });
  } catch (error) {
    console.error("Error al crear sugerencia:", error);
    res.status(500).json({ error: "Error interno al enviar la sugerencia." });
  }
};