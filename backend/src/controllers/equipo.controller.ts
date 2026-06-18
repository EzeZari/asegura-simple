import { Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';

// 1. Obtener los miembros del equipo del usuario actual
export const obtenerEquipo = async (req: any, res: Response): Promise<any> => {
  try {
    const jefeId = Number(req.user?.userId || req.user?.id);
    if (!jefeId) return res.status(401).json({ error: "No autorizado" });

    const equipo = await prisma.user.findMany({
      where: { jefeId },
      select: { id: true, nombre: true, email: true, role: true, telefono: true, createdAt: true }
    });

    res.json(equipo);
  } catch (error) {
    console.error("Error al obtener equipo:", error);
    res.status(500).json({ error: "Error al obtener equipo" });
  }
};

// 2. Invitar a un nuevo empleado
export const agregarMiembro = async (req: any, res: Response): Promise<any> => {
  try {
    const jefeId = Number(req.user?.userId || req.user?.id);
    const { nombre, email, password, role } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios (nombre, email, contraseña)." });
    }

    // Buscamos al jefe para ver qué plan tiene
    const jefe = await prisma.user.findUnique({
      where: { id: jefeId },
      include: { empleados: true }
    });

    if (!jefe) return res.status(404).json({ error: "Usuario no encontrado" });

    // 🔥 LA MAGIA DEL SAAS: Validamos los límites del plan
    const cantidadActual = jefe.empleados.length + 1; // El jefe cuenta como 1

    if (jefe.plan === "GRATUITO" || jefe.plan === "BASICO") {
      return res.status(403).json({ error: "Tu plan actual no permite agregar miembros. Actualizá a Profesional o Agencia." });
    }

    if (jefe.plan === "PROFESIONAL" && cantidadActual >= 3) {
      return res.status(403).json({ error: "El plan Profesional admite máximo 3 usuarios. Actualizá a Agencia para tener usuarios ilimitados." });
    }

    // Verificamos que el email no esté en uso en todo el sistema
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) return res.status(400).json({ error: "Ese email ya está registrado en AseguraSimple." });

    // Creamos al nuevo empleado
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoMiembro = await prisma.user.create({
      data: {
        nombre,
        email,
        telefono: "", 
        password: hashedPassword,
        role: role || "VIEWER",
        jefeId: jefe.id, // Lo atamos al dueño de la agencia
        plan: jefe.plan, // Hereda el plan
        isVerified: true // Entra directo sin verificar el mail
      }
    });

    res.json({ message: "Miembro agregado con éxito", miembro: { id: nuevoMiembro.id, nombre, email, role } });
  } catch (error) {
    console.error("Error al invitar miembro:", error);
    res.status(500).json({ error: "Error interno al invitar miembro." });
  }
};

// 3. Eliminar a un empleado
export const eliminarMiembro = async (req: any, res: Response): Promise<any> => {
  try {
    const jefeId = Number(req.user?.userId || req.user?.id);
    const miembroId = Number(req.params.id);

    // Asegurarnos de que el usuario a borrar realmente sea empleado de este jefe
    const empleado = await prisma.user.findFirst({
      where: { id: miembroId, jefeId: jefeId }
    });

    if (!empleado) {
      return res.status(403).json({ error: "No tenés permiso para eliminar este usuario o no existe." });
    }

    await prisma.user.delete({ where: { id: miembroId } });

    res.json({ message: "Miembro eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar miembro:", error);
    res.status(500).json({ error: "Error interno al eliminar miembro." });
  }
};