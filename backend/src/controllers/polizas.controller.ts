import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento, enviarAvisoCobranza } from '../services/email.service';
import { supabase } from '../config/supabase';

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
  
  if (v.includes('auto') || v.includes('coche')) return 'Automotor';
  if (v.includes('moto')) return 'Motovehículo';
  if (v.includes('vehiculo')) return 'Automotor';
  
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

// 🔥 GENERADOR INTELIGENTE DE CUOTAS (CON EL FIX DEFINITIVO)
const generarCuotas = (
  fechaInicio: Date,
  fechaVencimientoContrato: Date,
  tieneRefacturacion: boolean = false,
  frecuenciaRefacturacion: string = 'Mensual',
  fechaRefacturacion: Date | null = null,
  diaHabitualPago: number | null = null
) => {
  if (!tieneRefacturacion) return [];

  const cuotas = [];
  
  // 1. Usar la fecha de refacturación inicial, o la fecha de inicio por defecto
  let fechaBase = fechaRefacturacion ? new Date(fechaRefacturacion) : new Date(fechaInicio);

  // 2. Si el usuario puso un "Día Habitual", forzamos que el día sea ESE número
  let diaFijo = diaHabitualPago ? diaHabitualPago : fechaBase.getUTCDate();

  // 3. MAGIA CONTRA HUSOS HORARIOS: Clavamos la hora a las 12:00 PM UTC. 
  fechaBase.setUTCHours(12, 0, 0, 0);

  // 4. Calcular los pasos de la frecuencia
  let step = 1;
  if (frecuenciaRefacturacion === 'Bimestral') step = 2;
  else if (frecuenciaRefacturacion === 'Trimestral') step = 3;
  else if (frecuenciaRefacturacion === 'Semestral') step = 6;
  else if (frecuenciaRefacturacion === 'Anual') step = 12;

  // 5. Calcular la cantidad total de cuotas en base a los meses de diferencia
  let mesesTotales = (fechaVencimientoContrato.getUTCFullYear() - fechaBase.getUTCFullYear()) * 12;
  mesesTotales -= fechaBase.getUTCMonth();
  mesesTotales += fechaVencimientoContrato.getUTCMonth();
  
  // Sumamos un margen de 15 días por si el vencimiento final no coincide exacto con el día 30
  if (fechaVencimientoContrato.getUTCDate() > 15) {
      mesesTotales++;
  }

  const cantidadCuotas = mesesTotales > 0 ? Math.ceil(mesesTotales / step) : 12;

  let mesActual = fechaBase.getUTCMonth();
  let anioActual = fechaBase.getUTCFullYear();

  for (let i = 0; i < cantidadCuotas; i++) {
    // Clavamos el DÍA FIJO y solo aumentamos el número del MES usando UTC
    let mesObjetivo = mesActual + (i * step);
    
    // Si el mes objetivo tiene menos días que el diaFijo (Ej: Febrero 30), JavaScript se pasa al mes siguiente automáticamente.
    // Para evitar que "Día Habitual 31" genere 2 cuotas en marzo en lugar de febrero, le decimos:
    // "El día máximo de este mes es X. Elegí el menor entre DíaHabitual y el Máximo".
    let maxDiasMesObjetivo = new Date(Date.UTC(anioActual, mesObjetivo + 1, 0)).getUTCDate();
    let diaRealParaEstaCuota = Math.min(diaFijo, maxDiasMesObjetivo);
    
    let fechaCuota = new Date(Date.UTC(anioActual, mesObjetivo, diaRealParaEstaCuota, 12, 0, 0, 0));

    // Si la cuota ya superó el vencimiento del contrato (con el margen de 15 días), cortamos
    let vtoConMargen = new Date(fechaVencimientoContrato);
    vtoConMargen.setUTCDate(vtoConMargen.getUTCDate() + 15);
    if (fechaCuota > vtoConMargen) break;

    const nombreMes = fechaCuota.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    
    cuotas.push({
      id: Date.now() + i + Math.floor(Math.random() * 1000), 
      mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
      fechaVencimiento: fechaCuota.toISOString(),
      estado: 'Pendiente',
      pagado: false
    });
  }

  // Backup por si es muy corto
  if (cuotas.length === 0) {
    const nombreMes = fechaBase.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    cuotas.push({
      id: 1,
      mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
      fechaVencimiento: fechaBase.toISOString(),
      estado: "Pendiente",
      pagado: false
    });
  }

  return cuotas;
};

const calcularEstadoPagoGeneral = (cuotas: any[]) => {
  if (!cuotas || !Array.isArray(cuotas) || cuotas.length === 0) return "Sin información";
  
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let tieneVencidas = false;
  let tienePendientes = false;

  for (const c of cuotas) {
    const isPagado = c.estado === 'Pagado' || c.estado === 'Al día' || c.pagado === true;
    if (isPagado) continue;

    if (c.estado === 'Vencido') {
      tieneVencidas = true;
      break;
    }

    if (c.fechaVencimiento) {
      const fechaVenc = new Date(c.fechaVencimiento);
      fechaVenc.setHours(0, 0, 0, 0);

      if (fechaVenc < hoy) {
        tieneVencidas = true; 
        break;
      } else {
        const diffTime = fechaVenc.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 15) {
           tienePendientes = true; 
        }
      }
    } else {
      if (c.estado === 'Pendiente' || c.pagado === false) {
        tienePendientes = true;
      }
    }
  }

  if (tieneVencidas) return "Vencido";
  if (tienePendientes) return "Pendiente";
  
  return "Al día";
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
      include: { 
        asegurado: true, 
        compania: true,
        actividades: { orderBy: { fecha: 'desc' } }
      }
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
      patente, marca, modelo, ubicacionRiesgo, cantidadEmpleados, formaPago, enviarCuponera,
      motor, chasis, anio, color, sumaAsegurada, clausulaAjuste,
      tieneRefacturacion, frecuenciaRefacturacion, fechaRefacturacion, diaHabitualPago
    } = req.body;

    const asegurado = await prisma.asegurado.findFirst({
      where: { id: parseInt(aseguradoId), productorId: productorId }
    });

    if (!asegurado) return res.status(403).json({ error: 'El asegurado no te pertenece o no existe.' });

    const fechaInicioParseada = parsearFechaSegura(fechaInicio)!;
    const fechaVencimientoParseada = parsearFechaSegura(fechaVencimiento)!;
    const refacturacionParseada = fechaRefacturacion ? parsearFechaSegura(fechaRefacturacion) : null;
    const esRefacturada = tieneRefacturacion === true || tieneRefacturacion === 'true';
    const diaParseado = diaHabitualPago ? parseInt(diaHabitualPago) : null;

    const cuotasGeneradas = generarCuotas(
      fechaInicioParseada, 
      fechaVencimientoParseada, 
      esRefacturada,
      frecuenciaRefacturacion,
      refacturacionParseada,
      diaParseado
    );

    const estadoPagoCalculado = calcularEstadoPagoGeneral(cuotasGeneradas);

    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza, tipoPoliza, 
        fechaInicio: fechaInicioParseada, 
        fechaVencimiento: fechaVencimientoParseada, 
        estado, cobertura, 
        aseguradoId: parseInt(aseguradoId), 
        companiaId: parseInt(companiaId),
        productorId, 
        patente: patente || null,
        marca: marca || null,
        modelo: modelo || null,
        motor: motor || null,
        chasis: chasis || null,
        anio: anio || null,
        color: color || null,
        sumaAsegurada: sumaAsegurada || null,
        clausulaAjuste: clausulaAjuste || null,
        ubicacionRiesgo: ubicacionRiesgo || null,
        cantidadEmpleados: cantidadEmpleados || null,
        formaPago: formaPago || null,
        enviarCuponera: enviarCuponera === true || enviarCuponera === 'true', 
        
        tieneRefacturacion: esRefacturada,
        frecuenciaRefacturacion: frecuenciaRefacturacion || null,
        fechaRefacturacion: refacturacionParseada,
        diaHabitualPago: diaParseado,
        
        estadoPago: estadoPagoCalculado,
        estadoCuotas: cuotasGeneradas,
      },
      include: { asegurado: true }
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta",
        entidad: "Póliza",
        descripcion: `Póliza #${nroPoliza} (${tipoPoliza})`,
        cliente: `${nuevaPoliza.asegurado.nombre} ${nuevaPoliza.asegurado.apellido || ''}`.trim(),
        productorId,
        polizaId: nuevaPoliza.id
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

    // 🔥 SMART MERGE: Diferenciamos si el cambio viene de tildar una cuota o de editar la póliza entera
    let nuevasCuotas = data.estadoCuotas;
    
    // Si data.estadoCuotas es undefined, significa que venimos del modal de edición general.
    // En ese caso, RECALCULAMOS las cuotas usando las nuevas fechas, pero SALVAMOS los pagos previos.
    if (nuevasCuotas === undefined) {
      const fInicio = data.fechaInicio ? parsearFechaSegura(data.fechaInicio)! : vieja.fechaInicio;
      const fVenc = data.fechaVencimiento ? parsearFechaSegura(data.fechaVencimiento)! : vieja.fechaVencimiento;
      const fRefact = data.fechaRefacturacion ? parsearFechaSegura(data.fechaRefacturacion) : vieja.fechaRefacturacion;
      const tieneRef = data.tieneRefacturacion !== undefined ? (data.tieneRefacturacion === true || data.tieneRefacturacion === 'true') : vieja.tieneRefacturacion;
      const frec = data.frecuenciaRefacturacion || vieja.frecuenciaRefacturacion;
      const diaHab = data.diaHabitualPago !== undefined ? (data.diaHabitualPago ? parseInt(data.diaHabitualPago) : null) : vieja.diaHabitualPago;
      
      const cuotasGeneradas = generarCuotas(fInicio, fVenc, tieneRef, frec, fRefact, diaHab);
      
      const cuotasViejas = (vieja.estadoCuotas as any[]) || [];
      
      nuevasCuotas = cuotasGeneradas.map((cg: any) => {
          const pagoPrevio = cuotasViejas.find(cv => cv.mes === cg.mes);
          // Si el cliente ya había pagado ese mes, se lo respetamos en el nuevo cálculo
          if (pagoPrevio && (pagoPrevio.estado === 'Pagado' || pagoPrevio.estado === 'Al día' || pagoPrevio.pagado)) {
              return { ...cg, estado: 'Pagado', pagado: true };
          }
          return cg;
      });
    }

    const estadoPagoSincronizado = calcularEstadoPagoGeneral(nuevasCuotas);

    const actualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: {
        nroPoliza: data.nroPoliza !== undefined ? data.nroPoliza : undefined,
        tipoPoliza: data.tipoPoliza !== undefined ? data.tipoPoliza : undefined,
        fechaInicio: data.fechaInicio ? parsearFechaSegura(data.fechaInicio)! : undefined, 
        fechaVencimiento: data.fechaVencimiento ? parsearFechaSegura(data.fechaVencimiento)! : undefined, 
        estado: data.estado !== undefined ? data.estado : undefined,
        cobertura: data.cobertura !== undefined ? data.cobertura : undefined,
        aseguradoId: data.aseguradoId ? parseInt(data.aseguradoId) : undefined,
        companiaId: data.companiaId ? parseInt(data.companiaId) : undefined,
        
        patente: data.patente !== undefined ? (data.patente || null) : undefined,
        marca: data.marca !== undefined ? (data.marca || null) : undefined,
        modelo: data.modelo !== undefined ? (data.modelo || null) : undefined,
        motor: data.motor !== undefined ? (data.motor || null) : undefined,
        chasis: data.chasis !== undefined ? (data.chasis || null) : undefined,
        anio: data.anio !== undefined ? (data.anio || null) : undefined,
        color: data.color !== undefined ? (data.color || null) : undefined,
        sumaAsegurada: data.sumaAsegurada !== undefined ? (data.sumaAsegurada || null) : undefined,
        clausulaAjuste: data.clausulaAjuste !== undefined ? (data.clausulaAjuste || null) : undefined,
        ubicacionRiesgo: data.ubicacionRiesgo !== undefined ? (data.ubicacionRiesgo || null) : undefined,
        cantidadEmpleados: data.cantidadEmpleados !== undefined ? (data.cantidadEmpleados || null) : undefined,
        formaPago: data.formaPago !== undefined ? (data.formaPago || null) : undefined, 
        
        enviarCuponera: data.enviarCuponera !== undefined ? (data.enviarCuponera === true || data.enviarCuponera === 'true') : undefined,
        tieneRefacturacion: data.tieneRefacturacion !== undefined ? (data.tieneRefacturacion === true || data.tieneRefacturacion === 'true') : undefined,
        frecuenciaRefacturacion: data.frecuenciaRefacturacion !== undefined ? data.frecuenciaRefacturacion : undefined,
        fechaRefacturacion: data.fechaRefacturacion ? parsearFechaSegura(data.fechaRefacturacion) : undefined,
        diaHabitualPago: data.diaHabitualPago ? parseInt(data.diaHabitualPago) : undefined,
        
        estadoPago: estadoPagoSincronizado, 
        estadoCuotas: nuevasCuotas, 
      },
      include: { asegurado: true, compania: true }
    });

    let cambios = [];
    if (vieja.estado !== data.estado && data.estado) cambios.push(`Estado: ${vieja.estado} -> ${data.estado}`);
    if (vieja.nroPoliza !== data.nroPoliza && data.nroPoliza) cambios.push(`Nro: ${vieja.nroPoliza} -> ${data.nroPoliza}`);
    
    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos";

    if (data.estadoCuotas && Object.keys(data).length === 1) {
       textoDetalle = "Se actualizó el control de pagos / cuotas.";
    }

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: textoDetalle,
        cliente: `${actualizada.asegurado.nombre} ${actualizada.asegurado.apellido || ''}`.trim(),
        productorId,
        polizaId: actualizada.id
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
    
    // 🔥 1. RECIBIMOS LA ORDEN DEL FRONTEND (Opcional)
    // Nos puede llegar { tipo: "COBRANZA" } o { tipo: "RENOVACION" }
    const tipoSolicitado = req.body?.tipo; 
    
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

    // 🔥 2. LÓGICA INTELIGENTE: ¿Qué correo debemos mandar?
    let tipoAEnviar = "Renovación";
    
    if (tipoSolicitado === "COBRANZA") {
        tipoAEnviar = "Cobranza";
    } else if (tipoSolicitado === "RENOVACION") {
        tipoAEnviar = "Renovación";
    } else if (poliza.estadoPago === 'Vencido') {
        // Si el frontend no nos dice nada, deducimos por el estado
        tipoAEnviar = "Cobranza";
    }

    // 🔥 3. NUEVO CONTROL ANTI-SPAM SEPARADO
    // Buscamos en la tabla de Actividades si HOY ya mandaste un correo de ESTE TIPO
    const envioPrevioHoy = await prisma.actividad.findFirst({
        where: {
            polizaId: poliza.id,
            fecha: { gte: hoy },
            descripcion: { contains: `Tipo: ${tipoAEnviar}` }
        }
    });

    if (envioPrevioHoy) {
        return res.status(400).json({ error: `Ya enviaste un aviso de ${tipoAEnviar} hoy para esta póliza. Podés enviar el otro si querés.` });
    }

    const cuponeraParaEnviar = (poliza.enviarCuponera && poliza.cuponeraUrl) ? poliza.cuponeraUrl : null;
    const nombreCliente = `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim();

    // 🔥 4. DESPACHO DEL CORREO
    if (tipoAEnviar === 'Cobranza') {
      const cuotas = poliza.estadoCuotas as any[] || [];
      const cuotaEnMora = cuotas.find(c => c.estado === 'Vencido' || (new Date(c.fechaVencimiento) < hoy && c.estado !== 'Pagado' && c.pagado !== true));

      const mesCuota = cuotaEnMora ? cuotaEnMora.mes : "Período actual";
      const fechaVencCuota = cuotaEnMora ? new Date(cuotaEnMora.fechaVencimiento).toLocaleDateString("es-AR") : "Recientemente";

      await enviarAvisoCobranza(
        poliza.asegurado.email, 
        nombreCliente, 
        poliza.nroPoliza, 
        poliza.compania?.nombre || "Sin Compañía", 
        poliza.tipoPoliza, 
        fechaVencCuota,
        mesCuota,
        poliza.patente,
        cuponeraParaEnviar 
      );
    } else {
      const fechaVencimientoFormateada = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");

      await enviarAvisoVencimiento(
        poliza.asegurado.email, 
        nombreCliente, 
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
    }

    // Registramos en el historial qué tipo de correo mandamos (esto alimenta al anti-spam de mañana)
    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: `Aviso enviado por correo (Póliza #${poliza.nroPoliza}). Tipo: ${tipoAEnviar}`,
        cliente: nombreCliente,
        productorId,
        polizaId: poliza.id
      }
    });

    return res.json({ message: `Aviso de ${tipoAEnviar} enviado correctamente.` });
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
      where: { id: parseInt(id), productorId: productorId }
    });

    if (!polizaExistente) return res.status(404).json({ error: 'Póliza no encontrada o no autorizada.' });

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
        productorId,
        polizaId: polizaActualizada.id
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

    polizasExcel.forEach((p: any, index: number) => {
      const filaExcel = index + 2; 
      const row = normalizarLlaves(p);

      const nroPoliza = String(row.nropoliza || row.poliza || row.numero || row.nro || '').trim();
      const dniCrudo = String(row.dnicuit || row.dni || row.documento || row.cuit || '').replace(/[^0-9]/g, '');
      const companiaCruda = String(row.compania || row.aseguradora || row.cia || '').toLowerCase().trim();

      if (!nroPoliza) {
        reporteDetallado.push({ fila: filaExcel, poliza: "Sin Nro", estado: "error", motivo: "El número de póliza está vacío." });
        salteados++;
        return; 
      }

      if (!dniCrudo) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: "El DNI/CUIT está vacío." });
        salteados++;
        return;
      }

      const aseguradoId = mapaAsegurados.get(dniCrudo);
      if (!aseguradoId) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: `El DNI/CUIT ${dniCrudo} no existe en tus asegurados.` });
        salteados++;
        return;
      }

      if (setPolizasExistentes.has(nroPoliza)) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: "La póliza ya existe en el sistema." });
        salteados++;
        return;
      }

      let companiaId = mapaCompanias.get(companiaCruda);
      if (!companiaId) {
        reporteDetallado.push({ fila: filaExcel, poliza: nroPoliza, estado: "error", motivo: `Compañía desconocida en tu sistema (${row.compania || row.aseguradora || 'Vacía'}).` });
        salteados++;
        return;
      }

      const tipoPoliza = normalizarRama(row.ramariesgo || row.rama || row.tipo || row.riesgo || row.ramo);
      const estado = normalizarEstado(row.estado);
      const formaPago = normalizarFormaPago(row.formapago || row.pago || row.modalidadpago);

      let fechaInicio = parsearFecha(row.vigenciadesde || row.desde || row.fechainicio || row.inicio);
      let fechaVencimiento = parsearFecha(row.vigenciahasta || row.hasta || row.fechavencimiento || row.vencimiento);
      let fechaRefacturacion = parsearFecha(row.fecharefacturacion || row.refacturacion || row.vencimientocuota);

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

      const motor = row.motor ? String(row.motor).trim().toUpperCase() : null;
      const chasis = row.chasis ? String(row.chasis).trim().toUpperCase() : null;
      const anio = row.anio || row.año ? String(row.anio || row.año).trim() : null;
      const color = row.color ? String(row.color).trim() : null;
      const sumaAsegurada = row.sumaasegurada || row.suma ? String(row.sumaasegurada || row.suma).trim() : null;
      const clausulaAjuste = row.clausulaajuste || row.clausula ? String(row.clausulaajuste || row.clausula).trim() : null;
      
      const tieneRefacturacion = row.tienerefacturacion ? String(row.tienerefacturacion).toLowerCase().includes('si') : false;
      const frecuenciaRefacturacion = row.frecuenciarefacturacion ? String(row.frecuenciarefacturacion).trim() : 'Mensual';
      const diaHabitualPago = row.diahabitual ? parseInt(row.diahabitual) : null;

      const cuotasParaGuardar = generarCuotas(
        fechaInicio, 
        fechaVencimiento, 
        tieneRefacturacion, 
        frecuenciaRefacturacion, 
        fechaRefacturacion, 
        diaHabitualPago
      );

      const estadoPagoDefinitivo = calcularEstadoPagoGeneral(cuotasParaGuardar);

      datosParaInsertar.push({
        nroPoliza, aseguradoId, companiaId, tipoPoliza, estado,
        fechaInicio, fechaVencimiento, cobertura, patente, marca,          
        modelo, ubicacionRiesgo, cantidadEmpleados, formaPago,
        motor, chasis, anio, color, sumaAsegurada, clausulaAjuste,
        tieneRefacturacion, frecuenciaRefacturacion, fechaRefacturacion, diaHabitualPago,      
        estadoPago: estadoPagoDefinitivo,
        enviarCuponera: false, productorId,
        estadoCuotas: cuotasParaGuardar,
      });

      creados++;
      reporteDetallado.push({
        fila: filaExcel,
        poliza: nroPoliza,
        estado: "exito",
        motivo: "Importada correctamente."
      });
    });

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

export const actualizarGestionAviso = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);
    const { avisoGestionado, observacionesAviso } = req.body;
    
    const polizaVieja = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
      include: { asegurado: true }
    });

    if (!polizaVieja) return res.status(404).json({ error: 'Póliza no encontrada' });

    const actualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: { 
        avisoGestionado: avisoGestionado, 
        observacionesAviso: observacionesAviso 
      }
    });

    if (observacionesAviso && observacionesAviso !== polizaVieja.observacionesAviso) {
       await prisma.actividad.create({
         data: {
           accion: "Edición",
           entidad: "Gestion de Alerta", 
           descripcion: observacionesAviso, 
           cliente: `${polizaVieja.asegurado.nombre} ${polizaVieja.asegurado.apellido || ''}`.trim(),
           productorId: productorId,
           polizaId: polizaVieja.id 
         }
       });
    }

    return res.json({ message: "Gestión actualizada", poliza: actualizada });
  } catch (error) {
    console.error("Error al guardar gestión:", error);
    return res.status(500).json({ error: 'Error al actualizar la gestión del aviso.' });
  }
};