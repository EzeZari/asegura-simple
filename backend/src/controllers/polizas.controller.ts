import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from '../services/email.service';
import { supabase } from '../config/supabase';

// 🔥 NORMALIZADORES INTELIGENTES PARA EXCEL
const normalizarFormaPago = (valor: any) => {
  if (!valor) return null;
  const v = String(valor).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (v.includes('credito') || v === 'tc') return 'Tarjeta de Crédito';
  if (v.includes('debito') || v === 'td') return 'Tarjeta de Débito';
  if (v.includes('cbu') || v.includes('automatico')) return 'CBU / Débito Automático';
  if (v.includes('efectivo') || v.includes('facil') || v.includes('rapipago') || v.includes('cupon')) return 'Efectivo / Pago Fácil';
  if (v.includes('transferencia') || v.includes('banco')) return 'Transferencia Bancaria';
  
  return String(valor).trim(); 
};

const normalizarEstado = (valor: any) => {
  if (!valor) return 'Vigente';
  const v = String(valor).toLowerCase().trim();
  
  if (v.includes('pendiente') || v.includes('deuda') || v.includes('impaga')) return 'Pendiente de Pago';
  if (v.includes('anulada') || v.includes('baja') || v.includes('cancelada')) return 'Anulada';
  if (v.includes('renovada')) return 'Renovada';
  
  return 'Vigente';
};

const normalizarRama = (valor: any) => {
  if (!valor) return 'Automotor';
  const v = String(valor).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (v.includes('moto')) return 'Motovehículo';
  if (v.includes('auto') || v.includes('vehiculo') || v.includes('coche')) return 'Automotor';
  if (v.includes('art') || v.includes('riesgo de trabajo')) return 'ART';
  if (v.includes('vida') && v.includes('colectivo')) return 'Vida colectivo';
  if (v.includes('vida') && v.includes('individual')) return 'Vida individual';
  if (v.includes('vida')) return 'Vida simple';
  if (v.includes('hogar') || v.includes('combinado') || v.includes('familiar')) return 'Combinado familiar';
  if (v.includes('comercio') || v.includes('integral')) return 'Integral para comercio';
  if (v.includes('caucion') || v.includes('garantia')) return 'Caución';
  if (v.includes('transporte') || v.includes('carga')) return 'Transporte';
  if (v.includes('tecnico') || v.includes('equipos')) return 'Seguro técnico';
  if (v.includes('robo')) return 'Robo';
  if (v.includes('incendio')) return 'Incendio';
  if (v.includes('responsabilidad') || v.includes('rc')) return 'Responsabilidad civil';
  if (v.includes('casco') || v.includes('embarcacion')) return 'Cascos';
  if (v.includes('eco') || v.includes('monopatin') || v.includes('bici')) return 'Ecomovilidad';
  
  const original = String(valor).trim();
  return original.charAt(0).toUpperCase() + original.slice(1).toLowerCase();
};

const parsearFechaSegura = (fechaStr: string) => {
  if (!fechaStr) return null;
  const partes = fechaStr.split('T')[0].split('-');
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
      patente, marca, modelo, ubicacionRiesgo, cantidadEmpleados, formaPago, enviarCuponera 
    } = req.body;

    const asegurado = await prisma.asegurado.findFirst({
      where: { id: parseInt(aseguradoId), productorId: productorId }
    });

    if (!asegurado) return res.status(403).json({ error: 'El asegurado no te pertenece o no existe.' });

    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza, tipoPoliza, 
        fechaInicio: parsearFechaSegura(fechaInicio)!, 
        fechaVencimiento: parsearFechaSegura(fechaVencimiento)!, 
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
        enviarCuponera: enviarCuponera === true || enviarCuponera === 'true', 
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
        fechaInicio: data.fechaInicio ? parsearFechaSegura(data.fechaInicio)! : undefined, 
        fechaVencimiento: data.fechaVencimiento ? parsearFechaSegura(data.fechaVencimiento)! : undefined, 
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
        enviarCuponera: data.enviarCuponera !== undefined ? (data.enviarCuponera === true || data.enviarCuponera === 'true') : undefined,
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

    if (polizaABorrar.cuponeraUrl && polizaABorrar.cuponeraUrl.includes('supabase.co')) {
      const partesUrl = polizaABorrar.cuponeraUrl.split('/');
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

    const cuponeraParaEnviar = (poliza.enviarCuponera && poliza.cuponeraUrl) 
      ? poliza.cuponeraUrl 
      : null;

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
      poliza.cantidadEmpleados,
      cuponeraParaEnviar 
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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const pdfFile = files?.pdf?.[0];
    const cuponeraFile = files?.cuponera?.[0];

    if (!pdfFile && !cuponeraFile) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo para subir.' });
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

    let dataToUpdate: any = {};
    let descActividad = [];

    if (pdfFile && pdfFile.buffer) {
      if (polizaExistente.pdfUrl && polizaExistente.pdfUrl.includes('supabase.co')) {
        const partesUrl = polizaExistente.pdfUrl.split('/');
        const nombreArchivoViejo = partesUrl[partesUrl.length - 1];
        await supabase.storage.from('polizas').remove([nombreArchivoViejo]);
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileNamePdf = `poliza-${id}-${uniqueSuffix}.pdf`;

      const { error: uploadError } = await supabase.storage.from('polizas').upload(fileNamePdf, pdfFile.buffer, { contentType: 'application/pdf', upsert: true });
      if (uploadError) throw new Error(`Error de Supabase (Póliza): ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from('polizas').getPublicUrl(fileNamePdf);
      dataToUpdate.pdfUrl = publicUrlData.publicUrl;
      descActividad.push("Póliza");
    }

    if (cuponeraFile && cuponeraFile.buffer) {
      if (polizaExistente.cuponeraUrl && polizaExistente.cuponeraUrl.includes('supabase.co')) {
        const partesUrl = polizaExistente.cuponeraUrl.split('/');
        const nombreArchivoViejo = partesUrl[partesUrl.length - 1];
        await supabase.storage.from('polizas').remove([nombreArchivoViejo]);
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = cuponeraFile.originalname.split('.').pop() || 'pdf';
      const fileNameCuponera = `cuponera-${id}-${uniqueSuffix}.${extension}`;

      const { error: uploadError } = await supabase.storage.from('polizas').upload(fileNameCuponera, cuponeraFile.buffer, { contentType: cuponeraFile.mimetype, upsert: true });
      if (uploadError) throw new Error(`Error de Supabase (Cuponera): ${uploadError.message}`);

      const { data: publicUrlData } = supabase.storage.from('polizas').getPublicUrl(fileNameCuponera);
      dataToUpdate.cuponeraUrl = publicUrlData.publicUrl;
      descActividad.push("Cuponera de pago");
    }

    const polizaActualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: dataToUpdate, 
      include: { asegurado: true }
    });

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: `Se adjuntó documento (${descActividad.join(' y ')}) a la Póliza #${polizaActualizada.nroPoliza}`,
        cliente: `${polizaActualizada.asegurado.nombre} ${polizaActualizada.asegurado.apellido || ''}`.trim(),
        productorId 
      }
    });

    return res.json({ 
      message: 'Archivos subidos correctamente', 
      pdfUrl: dataToUpdate.pdfUrl || polizaActualizada.pdfUrl,
      cuponeraUrl: dataToUpdate.cuponeraUrl || polizaActualizada.cuponeraUrl
    });

  } catch (error: any) {
    console.error("Error al subir Archivos a Supabase:", error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar los archivos.' });
  }
};

// 🔥 MEJORA DE REPORTE DETALLADO EN IMPORTACIÓN MASIVA
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

    // 1. Nos traemos los números de pólizas que ya existen para compararlos rápido
    const polizasExistentes = await prisma.poliza.findMany({
      where: { productorId: productorId },
      select: { nroPoliza: true }
    });

    if (companias.length === 0) {
      return res.status(400).json({ 
        error: 'Por favor, asegurate de tener al menos una Compañía cargada antes de importar pólizas.' 
      });
    }

    const mapaAsegurados = new Map(asegurados.map(a => [String(a.dni).replace(/[^0-9]/g, ''), a.id]));
    const mapaCompanias = new Map(companias.map(c => [c.nombre.toLowerCase().trim(), c.id]));
    const setPolizasExistentes = new Set(polizasExistentes.map(p => String(p.nroPoliza).trim()));

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
      if (valorStr instanceof Date) return isNaN(valorStr.getTime()) ? null : valorStr;
      if (typeof valorStr === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const result = new Date(excelEpoch.getTime() + valorStr * 86400000);
        return isNaN(result.getTime()) ? null : result;
      }
      const str = String(valorStr).trim();
      const partes = str.split('/');
      let fechaResultante = null;
      if (partes.length === 3) {
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];
        fechaResultante = new Date(`${anio}-${mes}-${dia}T12:00:00Z`);
      } else {
        fechaResultante = new Date(str);
      }
      return isNaN(fechaResultante.getTime()) ? null : fechaResultante;
    };

    const datosParaInsertar: any[] = [];
    const reporteDetallado: any[] = [];
    let creados = 0;
    let salteados = 0;

    // 2. Iteramos generando el reporte línea por línea
    polizasExcel.forEach((p: any, index: number) => {
      const filaExcel = index + 2; 
      const row = normalizarLlaves(p);

      const nroPoliza = String(row.nropoliza || row.poliza || row.numero || row.nro || '').trim();
      const dniCrudo = String(row.dnicuit || row.dni || row.documento || row.cuit || '').replace(/[^0-9]/g, '');
      const companiaCruda = String(row.compania || row.aseguradora || row.cia || '').toLowerCase().trim();

      // VALIDACIÓN 1: Número de póliza
      if (!nroPoliza) {
        reporteDetallado.push({ fila: filaExcel, poliza: "Sin Nro", estado: "error", motivo: "El número de póliza está vacío." });
        salteados++;
        return; 
      }

      // VALIDACIÓN 2: DNI Vacio
      if (!dniCrudo) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: "El DNI/CUIT está vacío." });
        salteados++;
        return;
      }

      // VALIDACIÓN 3: ¿Existe el cliente?
      const aseguradoId = mapaAsegurados.get(dniCrudo);
      if (!aseguradoId) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: `El DNI/CUIT ${dniCrudo} no existe en tus asegurados.` });
        salteados++;
        return;
      }

      // VALIDACIÓN 4: ¿Ya está cargada la póliza?
      if (setPolizasExistentes.has(nroPoliza)) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: "La póliza ya existe en el sistema." });
        salteados++;
        return;
      }

      // 🔥 VALIDACIÓN 5 (NUEVA): Compañía estricta
      let companiaId = mapaCompanias.get(companiaCruda);
      if (!companiaId) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: `Compañía desconocida en tu sistema (${row.compania || row.aseguradora || 'Vacía'}).` });
        salteados++;
        return;
      }

      // SI PASÓ TODAS LAS VALIDACIONES -> PREPARAMOS LA DATA
      const tipoPoliza = normalizarRama(row.ramariesgo || row.rama || row.tipo || row.riesgo || row.ramo);
      const estado = normalizarEstado(row.estado);
      const formaPago = normalizarFormaPago(row.formapago || row.pago || row.modalidadpago);

      let fechaInicio = parsearFecha(row.vigenciadesde || row.desde || row.fechainicio || row.inicio);
      let fechaVencimiento = parsearFecha(row.vigenciahasta || row.hasta || row.fechavencimiento || row.vencimiento);

      if (!fechaInicio) fechaInicio = new Date();
      if (!fechaVencimiento) {
        fechaVencimiento = new Date(fechaInicio);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
      }

      const marca = row.marca ? String(row.marca).trim() : null;
      const modelo = row.modelo ? String(row.modelo).trim() : null;
      const patente = row.patente ? String(row.patente).trim().toUpperCase() : null;
      const cobertura = row.cobertura ? String(row.cobertura).trim() : null;
      const ubicacionRiesgo = row.ubicacionriesgo || row.ubicacion || row.direccionriesgo 
        ? String(row.ubicacionriesgo || row.ubicacion || row.direccionriesgo).trim() 
        : null;
      const cantidadEmpleados = row.cantidadempleados || row.empleados || row.personal
        ? String(row.cantidadempleados || row.empleados || row.personal).trim()
        : null;

      datosParaInsertar.push({
        nroPoliza, aseguradoId, companiaId, tipoPoliza, estado,
        fechaInicio, fechaVencimiento, cobertura, patente, marca,          
        modelo, ubicacionRiesgo, cantidadEmpleados, formaPago,      
        enviarCuponera: false, productorId
      });

      creados++;
      reporteDetallado.push({
        fila: filaExcel,
        poliza: nroPoliza,
        estado: "exito",
        motivo: "Importada correctamente."
      });
    });

    // 3. Ejecutamos la inserción final
    if (datosParaInsertar.length > 0) {
      await (prisma as any).poliza.createMany({
        data: datosParaInsertar,
        skipDuplicates: true
      });

      await (prisma as any).actividad.create({
        data: {
          accion: "Alta",
          entidad: "Póliza",
          descripcion: `Importación masiva: se cargaron ${creados} pólizas.`,
          cliente: "Sistema / Excel",
          productorId
        }
      });
    }

    return res.json({ 
      message: 'Importación procesada', 
      procesados: polizasExcel.length,
      creados: creados,
      salteados: salteados,
      reporte: reporteDetallado 
    });

  } catch (error: any) {
    console.error("Error en importación de pólizas:", error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar la carga.' });
  }
};