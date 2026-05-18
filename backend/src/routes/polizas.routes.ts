import { Router } from 'express';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from '../services/email.service';

const router = Router();

// RUTA: GET /api/polizas
router.get('/', async (req, res) => {
  try {
    const polizas = await prisma.poliza.findMany({
      include: { asegurado: true, compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });
    res.json(polizas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las pólizas.' });
  }
});

// RUTA: GET /api/polizas/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poliza = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });
    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });
    res.json(poliza);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el detalle.' });
  }
});

// RUTA: POST /api/polizas (Crea una póliza nueva)
router.post('/', async (req, res) => {
  try {
    const { nroPoliza, tipoPoliza, fechaInicio, fechaVencimiento, estado, cobertura, aseguradoId, companiaId } = req.body;

    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza, tipoPoliza, 
        fechaInicio: new Date(fechaInicio), 
        fechaVencimiento: new Date(fechaVencimiento), 
        estado, cobertura, 
        aseguradoId: parseInt(aseguradoId), 
        companiaId: parseInt(companiaId),
      },
      include: { asegurado: true }
    });

    // REGISTRO SEPARADO: Detalle y Cliente
    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Póliza",
        descripcion: `Póliza #${nroPoliza} (${tipoPoliza})`,
        cliente: `${nuevaPoliza.asegurado.nombre} ${nuevaPoliza.asegurado.apellido || ''}`.trim()
      }
    });

    res.status(201).json(nuevaPoliza);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar.' });
  }
});

// RUTA: PUT /api/polizas/:id (Editar o cambiar estado)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // 1. Buscamos la versión anterior
    const vieja = await prisma.poliza.findUnique({ 
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });

    // 2. Actualizamos
    const actualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: {
        nroPoliza: data.nroPoliza,
        tipoPoliza: data.tipoPoliza,
        fechaInicio: new Date(data.fechaInicio),
        fechaVencimiento: new Date(data.fechaVencimiento),
        estado: data.estado,
        cobertura: data.cobertura,
        aseguradoId: parseInt(data.aseguradoId),
        companiaId: parseInt(data.companiaId) 
      },
      include: { asegurado: true, compania: true }
    });

    // 3. Comparamos cambios
    let cambios = [];
    if (vieja && vieja.estado !== data.estado) cambios.push(`Estado: ${vieja.estado} -> ${data.estado}`);
    if (vieja && vieja.nroPoliza !== data.nroPoliza) cambios.push(`Nro: ${vieja.nroPoliza} -> ${data.nroPoliza}`);
    if (vieja && vieja.companiaId !== actualizada.companiaId) cambios.push(`Compañía: ${vieja.compania.nombre} -> ${actualizada.compania.nombre}`);
    
    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos técnicos";

    // 4. Registro en historial
    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: textoDetalle,
        cliente: `${actualizada.asegurado.nombre} ${actualizada.asegurado.apellido || ''}`.trim()
      }
    });

    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
});

// RUTA: DELETE /api/polizas/:id (Eliminar)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const polizaABorrar = await prisma.poliza.findUnique({ 
      where: { id: parseInt(id) },
      include: { asegurado: true } 
    });
    
    await prisma.poliza.delete({ where: { id: parseInt(id) } });

    // REGISTRO SEPARADO: Detalle y Cliente
    if (polizaABorrar) {
      await prisma.actividad.create({
        data: {
          accion: "Baja",
          entidad: "Póliza",
          descripcion: `Se eliminó la póliza #${polizaABorrar.nroPoliza}`,
          cliente: `${polizaABorrar.asegurado.nombre} ${polizaABorrar.asegurado.apellido || ''}`.trim()
        }
      });
    }

    res.json({ message: 'Póliza eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});
// RUTA: POST /api/polizas/:id/avisar-vencimiento
router.post('/:id/avisar-vencimiento', async (req, res) => {
  try {
    const { id } = req.params;
    
    const poliza = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });

    if (!poliza || !poliza.asegurado?.email) {
      return res.status(400).json({ error: 'La póliza no existe o el cliente no tiene email registrado.' });
    }

    // 🔥 CONTROL ANTI-SPAM: Validamos si ya se mandó un mail hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 

    if (poliza.ultimoAviso) {
      const fechaUltimoAviso = new Date(poliza.ultimoAviso);
      fechaUltimoAviso.setHours(0, 0, 0, 0);

      if (fechaUltimoAviso.getTime() === hoy.getTime()) {
        return res.status(400).json({ error: 'Ya se envió un correo de aviso para esta póliza el día de hoy.' });
      }
    }

    const fechaVencimientoFormateada = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");

    // 🔥 ACÁ ESTÁ EL ARREGLO: Pasamos los 7 parámetros exactos
    await enviarAvisoVencimiento(
      poliza.asegurado.email, 
      `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(), 
      poliza.nroPoliza, 
      poliza.compania?.nombre || "Sin Compañía", 
      poliza.tipoPoliza, // Param 5: Ramo
      poliza.cobertura || "", // Param 6: Cobertura
      fechaVencimientoFormateada // Param 7: Fecha
    );

    // Guardamos la fecha exacta del envío para bloquear futuras acciones hoy
    await prisma.poliza.update({
      where: { id: poliza.id },
      data: { ultimoAviso: new Date() }
    });

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: `Aviso de vencimiento enviado por correo (Póliza #${poliza.nroPoliza})`,
        cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim()
      }
    });

    res.json({ message: 'Aviso enviado correctamente.' });
  } catch (error) {
    console.error("Error en el endpoint de aviso:", error);
    res.status(500).json({ error: 'Error interno al enviar el aviso.' });
  }
});
export default router;