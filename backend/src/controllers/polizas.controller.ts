import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from '../services/email.service';
import path from 'path';
import fs from 'fs';

export const obtenerTodas = async (req: Request, res: Response) => {
  try {
    const polizas = await prisma.poliza.findMany({
      include: { asegurado: true, compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });
    res.json(polizas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las pólizas.' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    // 🔥 CORRECCIÓN: Le aclaramos explícitamente que es un string
    const id = req.params.id as string;
    const poliza = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });
    if (!poliza) return res.status(404).json({ error: 'Póliza no encontrada' });
    res.json(poliza);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el detalle.' });
  }
};

export const crearPoliza = async (req: Request, res: Response) => {
  try {
    const { 
      nroPoliza, tipoPoliza, fechaInicio, fechaVencimiento, estado, 
      cobertura, aseguradoId, companiaId,
      patente, marca, modelo, ubicacionRiesgo, cantidadEmpleados 
    } = req.body;

    const nuevaPoliza = await prisma.poliza.create({
      data: {
        nroPoliza, tipoPoliza, 
        fechaInicio: new Date(fechaInicio), 
        fechaVencimiento: new Date(fechaVencimiento), 
        estado, cobertura, 
        aseguradoId: parseInt(aseguradoId), 
        companiaId: parseInt(companiaId),
        patente: patente || null,
        marca: marca || null,
        modelo: modelo || null,
        ubicacionRiesgo: ubicacionRiesgo || null,
        cantidadEmpleados: cantidadEmpleados || null,
      },
      include: { asegurado: true }
    });

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
};

export const actualizarPoliza = async (req: Request, res: Response) => {
  try {
    // 🔥 CORRECCIÓN: Le aclaramos explícitamente que es un string
    const id = req.params.id as string;
    const data = req.body;

    const vieja = await prisma.poliza.findUnique({ 
      where: { id: parseInt(id) },
      include: { asegurado: true, compania: true }
    });

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
        companiaId: parseInt(data.companiaId),
        patente: data.patente || null,
        marca: data.marca || null,
        modelo: data.modelo || null,
        ubicacionRiesgo: data.ubicacionRiesgo || null,
        cantidadEmpleados: data.cantidadEmpleados || null,
      },
      include: { asegurado: true, compania: true }
    });

    let cambios = [];
    if (vieja && vieja.estado !== data.estado) cambios.push(`Estado: ${vieja.estado} -> ${data.estado}`);
    if (vieja && vieja.nroPoliza !== data.nroPoliza) cambios.push(`Nro: ${vieja.nroPoliza} -> ${data.nroPoliza}`);
    if (vieja && vieja.companiaId !== actualizada.companiaId) cambios.push(`Compañía: ${vieja.compania.nombre} -> ${actualizada.compania.nombre}`);
    
    let textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos técnicos";

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
};

export const eliminarPoliza = async (req: Request, res: Response) => {
  try {
    // 🔥 CORRECCIÓN: Le aclaramos explícitamente que es un string
    const id = req.params.id as string;
    
    const polizaABorrar = await prisma.poliza.findUnique({ 
      where: { id: parseInt(id) },
      include: { asegurado: true } 
    });
    
    await prisma.poliza.delete({ where: { id: parseInt(id) } });

    if (polizaABorrar) {
      if (polizaABorrar.pdfUrl) {
        const rutaPdfViejo = path.join(__dirname, '../../', polizaABorrar.pdfUrl);
        if (fs.existsSync(rutaPdfViejo)) {
          fs.unlinkSync(rutaPdfViejo);
        }
      }

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
};

export const avisarVencimiento = async (req: Request, res: Response) => {
  try {
    // 🔥 CORRECCIÓN: Le aclaramos explícitamente que es un string
    const id = req.params.id as string;
    
    const poliza = await prisma.poliza.findUnique({
      where: { id: parseInt(id) },
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
        cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim()
      }
    });

    res.json({ message: 'Aviso enviado correctamente.' });
  } catch (error) {
    console.error("Error en el endpoint de aviso:", error);
    res.status(500).json({ error: 'Error interno al enviar el aviso.' });
  }
};

export const subirPdf = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; 

    if (!req.file) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo o el formato no es PDF.' });
    }

    const polizaExistente = await prisma.poliza.findUnique({
      where: { id: parseInt(id) }
    });

    if (polizaExistente?.pdfUrl) {
      const rutaPdfViejo = path.join(__dirname, '../../', polizaExistente.pdfUrl);
      if (fs.existsSync(rutaPdfViejo)) {
        fs.unlinkSync(rutaPdfViejo); 
      }
    }

    const rutaNormalizada = req.file.path.replace(/\\/g, '/');

    const polizaActualizada = await prisma.poliza.update({
      where: { id: parseInt(id) },
      data: { pdfUrl: rutaNormalizada },
      include: { asegurado: true }
    });

    await prisma.actividad.create({
      data: {
        accion: "Edición",
        entidad: "Póliza",
        descripcion: `Se adjuntó copia digital PDF a la Póliza #${polizaActualizada.nroPoliza}`,
        cliente: `${polizaActualizada.asegurado.nombre} ${polizaActualizada.asegurado.apellido || ''}`.trim()
      }
    });

    res.json({ message: 'PDF subido correctamente', pdfUrl: rutaNormalizada });
  } catch (error: any) {
    console.error("Error al subir PDF:", error);
    res.status(500).json({ error: error.message || 'Error interno al procesar el archivo.' });
  }

};
export const importarPolizas = async (req: Request, res: Response) => {
  try {
    const polizasExcel = req.body;

    if (!Array.isArray(polizasExcel)) {
      return res.status(400).json({ error: 'El formato de datos debe ser un arreglo.' });
    }

    // 1. Traemos todos los clientes y compañías para poder "traducir" el Excel a IDs
    const asegurados = await prisma.asegurado.findMany({ select: { id: true, dni: true } });
    const companias = await prisma.compania.findMany({ select: { id: true, nombre: true } });

    // Armamos "diccionarios" para buscar rapidísimo
    const mapaAsegurados = new Map(asegurados.map(a => [a.dni, a.id]));
    const mapaCompanias = new Map(companias.map(c => [c.nombre.toLowerCase().trim(), c.id]));

    const normalizarLlaves = (obj: any) => {
      const nuevoObj: any = {};
      for (let key in obj) {
        const llaveLimpia = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
        nuevoObj[llaveLimpia] = obj[key];
      }
      return nuevoObj;
    };

    let salteadasPorFaltaDeDatos = 0;

    const datosParaInsertar = polizasExcel
      .map((p: any) => {
        const row = normalizarLlaves(p);

        const nroPoliza = String(row.nropoliza || row.poliza || row.numero || '').trim();
        const dniCrudo = String(row.dni || row.documento || row.cuit || '').replace(/[^0-9]/g, '');
        const companiaCruda = String(row.compania || row.aseguradora || '').toLowerCase().trim();
        const tipoPoliza = String(row.rama || row.tipo || row.riesgo || 'Automotor').trim();
        const estado = String(row.estado || 'Vigente').trim();

        // TRADUCCIÓN: Buscamos los IDs en nuestros diccionarios
        const aseguradoId = mapaAsegurados.get(dniCrudo);
        let companiaId = mapaCompanias.get(companiaCruda);

        // Si no encontró la compañía exacta, le asignamos la primera que exista por defecto (o podés dejarlo en null si tu BD lo permite)
        if (!companiaId && companias.length > 0) {
          companiaId = companias[0].id; 
        }

        // Manejo de Fechas (Excel a veces manda números de serie, o strings)
        let fechaInicio = new Date();
        let fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6); // +6 meses por defecto

        if (row.desde || row.fechainicio) fechaInicio = new Date(row.desde || row.fechainicio);
        if (row.hasta || row.fechavencimiento) fechaVencimiento = new Date(row.hasta || row.fechavencimiento);

        return {
          nroPoliza,
          aseguradoId,
          companiaId,
          tipoPoliza,
          estado,
          fechaInicio,
          fechaVencimiento,
          cobertura: row.cobertura ? String(row.cobertura).trim() : null,
          patente: row.patente ? String(row.patente).trim().toUpperCase() : null,
        };
      })
      .filter((p: any) => {
        // OBLIGATORIO: Tener número de póliza y que el DNI exista en nuestra BD
        if (p.nroPoliza.length > 0 && p.aseguradoId) return true;
        salteadasPorFaltaDeDatos++;
        return false;
      });

    if (datosParaInsertar.length === 0) {
      return res.status(400).json({ error: 'No se encontraron pólizas válidas. Asegurate de que los DNI del Excel ya estén cargados como Clientes en el sistema.' });
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
        cliente: "Sistema / Excel"
      }
    });

    res.json({ 
      message: 'Importación procesada', 
      procesados: polizasExcel.length,
      creados: resultado.count,
      salteados: (polizasExcel.length - resultado.count) + salteadasPorFaltaDeDatos
    });

  } catch (error: any) {
    console.error("Error en importación de pólizas:", error);
    res.status(500).json({ error: error.message || 'Error interno al procesar la carga.' });
  }
};