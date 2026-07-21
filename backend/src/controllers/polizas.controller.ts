import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from '../services/email.service';
import { supabase } from '../config/supabase';

// 🔥 NUEVA FUNCIÓN: Evita el problema del desfasaje horario al guardar
const parsearFechaSegura = (fechaStr: string) => {
  if (!fechaStr) return null;
  const partes = fechaStr.split('T')[0].split('-');
  // Guardamos a las 12:00 del mediodía UTC. Esto evita que al restar 3hs en Argentina salte al día anterior.
  return new Date(Date.UTC(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]), 12, 0, 0));
};

const obtenerProductorId = async (userId: number): Promise<number> => {
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;

  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  if (!productor) {
    const userDueño = idAgencia === userId ? usuarioActual : await prisma.user.findUnique({ where: { id: idAgencia } });
    const userEmail = userDueño?.email || `user${idAgencia}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: idAgencia }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: userDueño?.nombre || 'Productor',
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

export const obtenerTodas = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'No autorizado' });
    const productorId = await obtenerProductorId(req.userId);

    const polizas = await prisma.poliza.findMany({
      where: { productorId: productorId }, 
      include: { asegurado: true, compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });
    return res.json(polizas);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las pólizas.' });
  }
};

export const obtenerPorId = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);

    const poliza = await prisma.poliza.findFirst({
      where: { 
        id: parseInt(id),
        productorId: productorId 
      },
      include: { asegurado: true, compania: true }
    });

    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });
    return res.json(poliza);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener el detalle.' });
  }
};

export const crearPoliza = async (req: Request, res: Response): Promise<any> => {
  try {
    const productorId = await obtenerProductorId(req.userId!);
    const { 
      nroPoliza, tipoPoliza, fechaInicio, fechaVencimiento, estado, 
      cobertura, aseguradoId, companiaId,
      patente, marca, modelo, ubicacionRiesgo, cantidadEmpleados, formaPago 
    } = req.body;

    const asegurado = await prisma.asegurado.findFirst({
      where: { id: parseInt(aseguradoId), productorId: productorId }
    });

    if (!asegurado) return res.status(403).json({ error: 'El asegurado no te pertenece o no existe.' });

    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza, tipoPoliza, 
        fechaInicio: parsearFechaSegura(fechaInicio)!, // 🔥 CORRECCIÓN APLICADA AQUÍ
        fechaVencimiento: parsearFechaSegura(fechaVencimiento)!, // 🔥 CORRECCIÓN APLICADA AQUÍ
        estado, cobertura, 
        aseguradoId: parseInt(aseguradoId), 
        companiaId: parseInt(companiaId),
        productorId, 
        patente: patente || null,
        marca: marca || null,
        modelo: modelo || null,
        ubicacionRiesgo: ubicacionRiesgo || null,
        cantidadEmpleados: cantidadEmpleados || null,
        formaPago: formaPago || null, 
      },
      include: { asegurado: true }
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Póliza",
        descripcion: `Póliza #${nroPoliza} (${tipoPoliza})`,
        cliente: `${nuevaPoliza.asegurado.nombre} ${nuevaPoliza.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.status(201).json(nuevaPoliza);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al guardar.' });
  }
};

export const actualizarPoliza = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    const vieja = await prisma.poliza.findFirst({ 
      where: { 
        id: parseInt(id),
        productorId: productorId 
      },
      include: { asegurado: true, compania: true }
    });

    if (!vieja) return res.status(404).json({ error: 'Póliza no encontrada o no autorizada.' });

    const actualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: {
        nroPoliza: data.nroPoliza,
        tipoPoliza: data.tipoPoliza,
        fechaInicio: data.fechaInicio ? parsearFechaSegura(data.fechaInicio)! : undefined, // 🔥 CORRECCIÓN AQUÍ
        fechaVencimiento: data.fechaVencimiento ? parsearFechaSegura(data.fechaVencimiento)! : undefined, // 🔥 CORRECCIÓN AQUÍ
        estado: data.estado,
        cobertura: data.cobertura,
        aseguradoId: data.aseguradoId ? parseInt(data.aseguradoId) : undefined,
        companiaId: data.companiaId ? parseInt(data.companiaId) : undefined,
        patente: data.patente || null,
        marca: data.marca || null,
        modelo: data.modelo || null,
        ubicacionRiesgo: data.ubicacionRiesgo || null,
        cantidadEmpleados: data.cantidadEmpleados || null,
        formaPago: data.formaPago || null, 
      },
      include: { asegurado: true, compania: true }
    });

    let cambios = [];
    if (vieja.estado !== data.estado && data.estado) cambios.push(`Estado: ${vieja.estado} -> ${data.estado}`);
    if (vieja.nroPoliza !== data.nroPoliza && data.nroPoliza) cambios.push(`Nro: ${vieja.nroPoliza} -> ${data.nroPoliza}`);
    if (data.companiaId && vieja.companiaId !== parseInt(data.companiaId)) cambios.push(`Compañía actualizada`);
    
    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos técnicos";

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: textoDetalle,
        cliente: `${actualizada.asegurado.nombre} ${actualizada.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.json(actualizada);
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar.' });
  }
};

export const eliminarPoliza = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);
    
    const polizaABorrar = await prisma.poliza.findFirst({ 
      where: { 
        id: parseInt(id),
        productorId: productorId 
      },
      include: { asegurado: true } 
    });

    if (!polizaABorrar) return res.status(404).json({ error: 'Póliza no encontrada.' });
    
    await prisma.poliza.delete({ where: { id: parseInt(id) } });

    if (polizaABorrar.pdfUrl && polizaABorrar.pdfUrl.includes('supabase.co')) {
      const partesUrl = polizaABorrar.pdfUrl.split('/');
      const nombreArchivoViejo = partesUrl[partesUrl.length - 1];
      await supabase.storage.from('polizas').remove([nombreArchivoViejo]);
    }

    await prisma.actividad.create({
      data: {
        accion: "Baja",
        entidad: "Póliza",
        descripcion: `Se eliminó la póliza #${polizaABorrar.nroPoliza}`,
        cliente: `${polizaABorrar.asegurado.nombre} ${polizaABorrar.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.json({ message: 'Póliza eliminada' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar.' });
  }
};

export const avisarVencimiento = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);
    
    const poliza = await prisma.poliza.findFirst({
      where: { 
        id: parseInt(id),
        productorId: productorId 
      },
      include: { asegurado: true, compania: true }
    });

    if (!poliza || !poliza.asegurado?.email) {
      return res.status(400).json({ error: 'La póliza no existe o el cliente no tiene email registrado.' });
    }

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

    await enviarAvisoVencimiento(
      poliza.asegurado.email, 
      `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(), 
      poliza.nroPoliza, 
      poliza.compania?.nombre || "Sin Compañía", 
      poliza.tipoPoliza, 
      poliza.cobertura || "", 
      fechaVencimientoFormateada,
      poliza.patente,
      poliza.marca,
      poliza.modelo,
      poliza.ubicacionRiesgo,
      poliza.cantidadEmpleados
    );

    await prisma.poliza.update({
      where: { id: poliza.id },
      data: { ultimoAviso: new Date() }
    });

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: `Aviso de vencimiento enviado por correo (Póliza #${poliza.nroPoliza})`,
        cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.json({ message: 'Aviso enviado correctamente.' });
  } catch (error) {
    console.error("Error en el endpoint de aviso:", error);
    return res.status(500).json({ error: 'Error interno al enviar el aviso.' });
  }
};

export const subirPdf = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string; 
    const productorId = await obtenerProductorId(req.userId!);

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo o el formato no es PDF.' });
    }

    const polizaExistente = await prisma.poliza.findFirst({
      where: { 
        id: parseInt(id),
        productorId: productorId 
      }
    });

    if (!polizaExistente) {
      return res.status(404).json({ error: 'Póliza no encontrada o no autorizada.' });
    }

    if (polizaExistente.pdfUrl && polizaExistente.pdfUrl.includes('supabase.co')) {
      const partesUrl = polizaExistente.pdfUrl.split('/');
      const nombreArchivoViejo = partesUrl[partesUrl.length - 1];
      await supabase.storage.from('polizas').remove([nombreArchivoViejo]);
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `poliza-${id}-${uniqueSuffix}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('polizas') 
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error de Supabase: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('polizas').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    const polizaActualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: { pdfUrl: publicUrl }, 
      include: { asegurado: true }
    });

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: `Se adjuntó copia digital PDF a la Póliza #${polizaActualizada.nroPoliza}`,
        cliente: `${polizaActualizada.asegurado.nombre} ${polizaActualizada.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.json({ message: 'PDF subido correctamente a la nube', pdfUrl: publicUrl });
  } catch (error: any) {
    console.error("Error al subir PDF a Supabase:", error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar el archivo.' });
  }
};

export const importarPolizas = async (req: Request, res: Response): Promise<any> => {
  try {
    const productorId = await obtenerProductorId(req.userId!);
    const polizasExcel = req.body;

    if (!Array.isArray(polizasExcel)) {
      return res.status(400).json({ error: 'El formato de datos debe ser un arreglo.' });
    }

    const asegurados = await prisma.asegurado.findMany({ 
      where: { productorId: productorId },
      select: { id: true, dni: true } 
    });
    
    const companias = await prisma.compania.findMany({ 
      where: { productorId: productorId },
      select: { id: true, nombre: true } 
    });

    if (companias.length === 0) {
      return res.status(400).json({ 
        error: ' Por favor, asegúrate de tener al menos una Compañía cargada en el sistema antes de importar las pólizas.' 
      });
    }

    const mapaAsegurados = new Map(asegurados.map(a => [String(a.dni).replace(/[^0-9]/g, ''), a.id]));
    const mapaCompanias = new Map(companias.map(c => [c.nombre.toLowerCase().trim(), c.id]));

    const normalizarLlaves = (obj: any) => {
      const nuevoObj: any = {};
      for (let key in obj) {
        const llaveLimpia = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        nuevoObj[llaveLimpia] = obj[key];
      }
      return nuevoObj;
    };

    const parsearFecha = (valorStr: any) => {
      if (!valorStr) return null;

      if (valorStr instanceof Date) {
        return isNaN(valorStr.getTime()) ? null : valorStr;
      }

      if (typeof valorStr === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const diasMilisecons = valorStr * 86400000;
        const result = new Date(excelEpoch.getTime() + diasMilisecons);
        return isNaN(result.getTime()) ? null : result;
      }
      
      const str = String(valorStr).trim();
      const partes = str.split('/');
      
      let fechaResultante = null;

      if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];
        fechaResultante = new Date(`${anio}-${mes}-${dia}T12:00:00Z`); // Acá ya tenías el mediodía, un crack
      } else {
        fechaResultante = new Date(str);
      }

      if (isNaN(fechaResultante.getTime())) {
        return null;
      }

      return fechaResultante;
    };

    let salteadasPorFaltaDeDatos = 0;

    const datosParaInsertar = polizasExcel
      .map((p: any) => {
        const row = normalizarLlaves(p);

        const nroPoliza = String(row.nropoliza || row.poliza || row.numero || '').trim();
        const dniCrudo = String(row.dnicuit || row.dni || row.documento || row.cuit || '').replace(/[^0-9]/g, '');
        const companiaCruda = String(row.compania || row.aseguradora || '').toLowerCase().trim();
        const tipoPoliza = String(row.ramariesgo || row.rama || row.tipo || row.riesgo || 'Automotor').trim();
        const estado = String(row.estado || 'Vigente').trim();

        const aseguradoId = mapaAsegurados.get(dniCrudo);
        let companiaId = mapaCompanias.get(companiaCruda);

        if (!companiaId && companias.length > 0) {
          companiaId = companias[0].id; 
        }

        let fechaInicio = parsearFecha(row.vigenciadesde || row.desde || row.fechainicio);
        let fechaVencimiento = parsearFecha(row.vigenciahasta || row.hasta || row.fechavencimiento);

        if (!fechaInicio) {
          fechaInicio = new Date();
        }
        if (!fechaVencimiento) {
          fechaVencimiento = new Date(fechaInicio);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6); 
        }

        return {
          nroPoliza, aseguradoId, companiaId, tipoPoliza, estado, fechaInicio, fechaVencimiento,
          cobertura: row.cobertura ? String(row.cobertura).trim() : null,
          patente: row.patente ? String(row.patente).trim().toUpperCase() : null,
          productorId // 🔥 SE INYECTA EL DUEÑO A TODAS LAS PÓLIZAS DEL EXCEL
        };
      })
      .filter((p: any) => {
        if (p.nroPoliza.length > 0 && p.aseguradoId) return true;
        salteadasPorFaltaDeDatos++;
        return false;
      });

    if (datosParaInsertar.length === 0) {
      return res.status(400).json({ error: 'No se encontraron pólizas válidas. Asegurate de que los DNI del Excel ya estén cargados en tus Asegurados.' });
    }

    const resultado = await (prisma as any).poliza.createMany({
      data: datosParaInsertar,
      skipDuplicates: true
    });

    await (prisma as any).actividad.create({
      data: {
        accion: "Alta",
        entidad: "Póliza",
        descripcion: `Importación masiva: se cargaron ${resultado.count} pólizas.`,
        cliente: "Sistema / Excel",
        productorId 
      }
    });

    return res.json({ 
      message: 'Importación procesada', 
      procesados: polizasExcel.length,
      creados: resultado.count,
      salteados: (polizasExcel.length - resultado.count) + salteadasPorFaltaDeDatos
    });

  } catch (error: any) {
    console.error("Error en importación de pólizas:", error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar la carga.' });
  }
};