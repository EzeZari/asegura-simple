import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// 🔥 1. IMPORTAMOS EL PRISMA QUE YA TENÉS CONFIGURADO EN TU PROYECTO
import { prisma } from '../config/db'; 

// 1. LOGIN DEL ADMIN
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      res.status(401).json({ error: 'Credenciales de administrador inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: 'admin', rol: 'SUPERADMIN' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '12h' }
    );

    res.json({
      token,
      admin: {
        email: adminEmail,
        rol: 'SUPERADMIN'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al intentar loguear al admin' });
  }
};

// 2. OBTENER TODAS LAS CUENTAS (DUEÑOS Y EMPLEADOS)
export const getAgencias = async (req: Request, res: Response): Promise<void> => {
  try {
    const agencias = await prisma.user.findMany({
      include: {
        suscripcion: true,
        // 🔥 Solo pedimos nombre y email
        jefe: {
          select: { nombre: true, email: true } 
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json(agencias);
  } catch (error) {
    console.error("Error al obtener agencias desde el panel admin:", error);
    res.status(500).json({ error: 'Error al obtener la lista de cuentas' });
  }
};
// 3. ACTUALIZAR EL PLAN DE UN USUARIO
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nuevoPlan } = req.body;

    // 🔥 FIX: Alinear con los valores exactos del ENUM en schema.prisma
    const planesPermitidos = ['GRATUITO', 'BASICO', 'PROFESIONAL', 'AGENCIA'];
    if (!planesPermitidos.includes(nuevoPlan)) {
      res.status(400).json({ error: 'El plan especificado no es válido.' });
      return;
    }

    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { plan: nuevoPlan },
    });

    res.json({ 
      message: `Plan actualizado exitosamente a ${nuevoPlan}`, 
      usuario: { id: usuarioActualizado.id, plan: usuarioActualizado.plan }
    });
  } catch (error) {
    console.error("Error al actualizar el plan:", error);
    res.status(500).json({ error: 'Ocurrió un error al intentar actualizar el plan de la cuenta.' });
  }
};
// 4. ELIMINAR UNA CUENTA
export const deleteAgencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscamos si el usuario existe
    const usuario = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!usuario) {
      res.status(404).json({ error: 'La cuenta no existe.' });
      return;
    }

    // Eliminamos la cuenta (Prisma se encargará de eliminar en cascada lo asociado si está configurado)
    await prisma.user.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Cuenta eliminada exitosamente del sistema.' });
  } catch (error) {
    console.error("Error al eliminar la cuenta:", error);
    res.status(500).json({ error: 'Ocurrió un error al intentar eliminar la cuenta. Verifica que no tenga registros dependientes bloqueando la acción.' });
  }
};