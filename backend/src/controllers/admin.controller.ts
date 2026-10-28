import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db'; 

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (email !== adminEmail || password !== adminPassword) {
      res.status(401).json({ error: 'Credenciales de administrador inválidas' });
      return;
    }
    const token = jwt.sign({ id: 'admin', rol: 'SUPERADMIN' }, process.env.JWT_SECRET || 'secret', { expiresIn: '12h' });
    res.json({ token, admin: { email: adminEmail, rol: 'SUPERADMIN' } });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor al intentar loguear al admin' });
  }
};

export const getAgencias = async (req: Request, res: Response): Promise<void> => {
  try {
    const agencias = await prisma.user.findMany({
      include: {
        suscripcion: true,
        jefe: { select: { nombre: true, email: true } },
        productor: { select: { _count: { select: { polizas: true, asegurados: true } } } }
      },
      orderBy: { id: 'desc' }
    });
    res.json(agencias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lista de cuentas' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nuevoPlan } = req.body;
    const planesPermitidos = ['GRATUITO', 'BASICO', 'PROFESIONAL', 'AGENCIA'];
    if (!planesPermitidos.includes(nuevoPlan)) {
      res.status(400).json({ error: 'El plan especificado no es válido.' });
      return;
    }
    const usuarioActualizado = await prisma.user.update({
      where: { id: Number(id) },
      data: { plan: nuevoPlan as any },
    });
    res.json({ message: `Plan actualizado exitosamente a ${nuevoPlan}`, usuario: { id: usuarioActualizado.id, plan: usuarioActualizado.plan } });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al intentar actualizar el plan.' });
  }
};

export const updateSuscripcionManual = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado, fechaVencimiento } = req.body;
    const fechaValida = fechaVencimiento ? new Date(fechaVencimiento) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    const estadosPermitidos = ['pendiente', 'autorizado', 'en_proceso', 'cancelado', 'trial', 'authorized', 'approved', 'in_process', 'cancelled', 'paused', 'rejected'];

    if (!estadosPermitidos.includes(estado)) {
      res.status(400).json({ error: `El estado "${estado}" no es válido.` });
      return;
    }

    const suscripcionExistente = await prisma.suscripcion.findFirst({ where: { userId: Number(id) } });

    if (suscripcionExistente) {
      await prisma.suscripcion.update({
        where: { id: suscripcionExistente.id },
        data: { estado: estado, fechaVencimiento: fechaValida }
      });
    } else {
      await prisma.suscripcion.create({
        data: { userId: Number(id), estado: estado, fechaInicio: new Date(), fechaVencimiento: fechaValida, mpPreapprovalId: `manual_${Date.now()}` }
      });
    }
    res.json({ message: 'Suscripción manual actualizada con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al modificar la suscripción.' });
  }
};

export const deleteAgencia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!usuario) {
      res.status(404).json({ error: 'La cuenta no existe.' });
      return;
    }
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'Cuenta eliminada exitosamente del sistema.' });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al intentar eliminar la cuenta.' });
  }
};

export const getComunicadoGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    let comunicado = await prisma.comunicadoAdmin.findUnique({ where: { id: 1 } });
    if (!comunicado) {
      comunicado = await prisma.comunicadoAdmin.create({
        data: { id: 1, mensajeBanner: "", activoBanner: false, tipoBanner: "blue", mensajeModal: "", activoModal: false, tipoModal: "blue" }
      });
    }
    res.json(comunicado);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los comunicados.' });
  }
};

export const updateComunicadoGlobal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mensajeBanner, activoBanner, tipoBanner, mensajeModal, activoModal, tipoModal } = req.body;
    const comunicado = await prisma.comunicadoAdmin.upsert({
      where: { id: 1 },
      update: { mensajeBanner, activoBanner, tipoBanner, mensajeModal, activoModal, tipoModal },
      create: { id: 1, mensajeBanner, activoBanner, tipoBanner, mensajeModal, activoModal, tipoModal }
    });
    res.json({ message: 'Comunicados actualizados exitosamente', comunicado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los comunicados.' });
  }
};

export const impersonateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!usuario) {
      res.status(404).json({ error: 'La cuenta no existe.' });
      return;
    }
    const token = jwt.sign(
      { id: usuario.id, userId: usuario.id, email: usuario.email, role: usuario.role, rol: usuario.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '2h' } 
    );
    res.json({ message: 'Sesión generada con éxito.', token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, role: usuario.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión como este usuario.' });
  }
};

export const getEstadisticasAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const agenciasActivas = await prisma.user.findMany({
      where: {
        suscripcion: { estado: { in: ['autorizado', 'authorized', 'approved', 'trial'] } },
        jefeId: null,
        email: { notIn: ['fmgestionesyseguros@hotmail.com', 'ezequielzari@gmail.com'] }
      },
      select: { plan: true, suscripcion: { select: { estado: true } } }
    });

    const PRECIOS: Record<string, number> = { 'BASICO': 9990, 'PROFESIONAL': 14990, 'AGENCIA': 24990, 'GRATUITO': 0 };

    let mrr = 0; let usuariosPagos = 0; let usuariosTrial = 0;

    agenciasActivas.forEach(agencia => {
      const estadoSub = agencia.suscripcion?.estado;
      if (estadoSub === 'autorizado' || estadoSub === 'authorized' || estadoSub === 'approved') {
        mrr += PRECIOS[agencia.plan] || 0;
        usuariosPagos++;
      } else if (estadoSub === 'trial') {
        usuariosTrial++;
      }
    });
    res.json({ totalAgenciasActivas: agenciasActivas.length, usuariosPagos, usuariosTrial, mrr });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las estadísticas.' });
  }
};

// 🔥 10. CRUD DESCUENTOS PARA EL ADMIN
export const getDescuentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const descuentos = await prisma.descuento.findMany({ orderBy: { id: 'desc' } });
    res.json(descuentos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los descuentos.' });
  }
};

export const createDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { codigo, porcentaje, activo } = req.body;
    if (!codigo || !porcentaje) {
      res.status(400).json({ error: 'Código y porcentaje son obligatorios.' });
      return;
    }
    const nuevoDescuento = await prisma.descuento.create({
      data: { codigo: codigo.trim().toUpperCase(), porcentaje: Number(porcentaje), activo: Boolean(activo) }
    });
    res.json(nuevoDescuento);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el descuento.' });
  }
};

export const updateDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { codigo, porcentaje, activo } = req.body;
    const descuentoEditado = await prisma.descuento.update({
      where: { id: Number(id) },
      data: { codigo: codigo.trim().toUpperCase(), porcentaje: Number(porcentaje), activo: Boolean(activo) }
    });
    res.json(descuentoEditado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el descuento.' });
  }
};

export const deleteDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.descuento.delete({ where: { id: Number(id) } });
    res.json({ message: 'Descuento eliminado con éxito.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el descuento.' });
  }
};