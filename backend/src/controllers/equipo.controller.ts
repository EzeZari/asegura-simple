import { Request, Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';
import { enviarCorreoInvitacion } from '../services/email.service';

export const obtenerEquipo = async (req: Request, res: Response): Promise<any> => {
  try {
    const jefeId = req.userId;
    if (!jefeId) return res.status(401).json({ error: "No autorizado" });

    // Si el que consulta es un empleado, buscamos a los compañeros de SU jefe
    const usuarioActual = await prisma.user.findUnique({ where: { id: jefeId } });
    const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : jefeId;

    const equipo = await prisma.user.findMany({
      where: { jefeId: idAgencia },
      select: { id: true, nombre: true, email: true, role: true, telefono: true, createdAt: true }
    });

    return res.json(equipo);
  } catch (error) {
    console.error("Error al obtener equipo:", error);
    return res.status(500).json({ error: "Error al obtener equipo" });
  }
};

export const agregarMiembro = async (req: Request, res: Response): Promise<any> => {
  try {
    const jefeId = req.userId;
    const { nombre, email, password, role } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const emailLimpio = email.toLowerCase().trim();
    const passwordLimpia = password.trim();

    const jefe = await prisma.user.findUnique({
      where: { id: jefeId! },
      include: { empleados: true }
    });

    if (!jefe) return res.status(404).json({ error: "Usuario no encontrado" });

    const cantidadActual = jefe.empleados.length + 1;

    if (jefe.plan === "GRATUITO" || jefe.plan === "BASICO") {
      return res.status(403).json({ error: "Tu plan actual no permite agregar miembros." });
    }

    if (jefe.plan === "PROFESIONAL" && cantidadActual >= 3) {
      return res.status(403).json({ error: "El plan Profesional admite máximo 3 usuarios." });
    }

    const existe = await prisma.user.findUnique({ where: { email: emailLimpio } });
    if (existe) return res.status(400).json({ error: "Ese email ya está registrado." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordLimpia, salt);

    const nuevoMiembro = await prisma.user.create({
      data: {
        nombre,
        email: emailLimpio,
        telefono: "", 
        password: hashedPassword,
        role: role || "VIEWER",
        jefeId: jefe.id, 
        plan: jefe.plan, 
        isVerified: true 
      }
    });

    await enviarCorreoInvitacion(emailLimpio, nombre, passwordLimpia, jefe.nombre);

    return res.json({ message: "Miembro agregado con éxito" });
  } catch (error) {
    console.error("Error al invitar miembro:", error);
    return res.status(500).json({ error: "Error interno al invitar miembro." });
  }
};

export const eliminarMiembro = async (req: Request, res: Response): Promise<any> => {
  try {
    const jefeId = req.userId;
    const miembroId = Number(req.params.id);

    const empleado = await prisma.user.findFirst({
      where: { id: miembroId, jefeId: jefeId }
    });

    if (!empleado) {
      return res.status(403).json({ error: "No tenés permiso para eliminar este usuario." });
    }

    await prisma.user.delete({ where: { id: miembroId } });

    return res.json({ message: "Miembro eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar miembro:", error);
    return res.status(500).json({ error: "Error interno al eliminar miembro." });
  }
};