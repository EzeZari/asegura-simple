import { Response } from 'express';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';
import { enviarCorreoInvitacion } from '../services/email.service'; // 🔥 IMPORTAMOS TU NUEVO MAIL

// 🔥 FUNCIÓN DE BLINDAJE: Extrae el ID del usuario en todos los formatos posibles
const obtenerIdSeguro = (req: any) => {
  const idBruto = req.user?.userId || req.user?.id || req.usuario?.id || req.userId;
  return Number(idBruto);
};

// 1. Obtener los miembros del equipo del usuario actual
export const obtenerEquipo = async (req: any, res: Response): Promise<any> => {
  try {
    const jefeId = obtenerIdSeguro(req);
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
    const jefeId = obtenerIdSeguro(req);
    if (!jefeId) return res.status(401).json({ error: "No autorizado. Token inválido." });

    const { nombre, email, password, role } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios (nombre, email, contraseña)." });
    }

    // 🔥 LIMPIEZA DE DATOS (Acá matamos el bug de credenciales incorrectas)
    const emailLimpio = email.toLowerCase().trim();
    const passwordLimpia = password.trim();

    // Buscamos al jefe para ver qué plan tiene y obtener su nombre para el mail
    const jefe = await prisma.user.findUnique({
      where: { id: jefeId },
      include: { empleados: true }
    });

    if (!jefe) return res.status(404).json({ error: "Usuario no encontrado" });

    // Validamos los límites del plan
    const cantidadActual = jefe.empleados.length + 1;

    if (jefe.plan === "GRATUITO" || jefe.plan === "BASICO") {
      return res.status(403).json({ error: "Tu plan actual no permite agregar miembros. Actualizá a Profesional o Agencia." });
    }

    if (jefe.plan === "PROFESIONAL" && cantidadActual >= 3) {
      return res.status(403).json({ error: "El plan Profesional admite máximo 3 usuarios. Actualizá a Agencia para tener usuarios ilimitados." });
    }

    // Verificamos que el email no esté en uso en todo el sistema
    const existe = await prisma.user.findUnique({ where: { email: emailLimpio } });
    if (existe) return res.status(400).json({ error: "Ese email ya está registrado en AseguraSimple." });

    // Creamos al nuevo empleado encriptando la contraseña LIMPIA
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

    // 🔥 MAGIA: Enviamos el correo de invitación al vendedor recién creado
    await enviarCorreoInvitacion(emailLimpio, nombre, passwordLimpia, jefe.nombre);

    res.json({ message: "Miembro agregado con éxito", miembro: { id: nuevoMiembro.id, nombre, email: emailLimpio, role } });
  } catch (error) {
    console.error("Error al invitar miembro:", error);
    res.status(500).json({ error: "Error interno al invitar miembro." });
  }
};

// 3. Eliminar a un empleado
export const eliminarMiembro = async (req: any, res: Response): Promise<any> => {
  try {
    const jefeId = obtenerIdSeguro(req);
    if (!jefeId) return res.status(401).json({ error: "No autorizado" });

    const miembroId = Number(req.params.id);

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