import { Router } from 'express';
import { enviarCorreoContacto } from '../services/email.service';

const router = Router();

router.post('/', async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  // 1. Validamos que lleguen los datos
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // 2. Usamos tu servicio de Resend para mandar el mail
    await enviarCorreoContacto(nombre, email, mensaje);
    
    // 3. Le avisamos al frontend que todo salió perfecto
    res.status(200).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error("Error en contacto.routes:", error);
    res.status(500).json({ error: 'Error interno al enviar el mensaje' });
  }
});

export default router;