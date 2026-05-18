import { Router } from 'express';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from '../services/email.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ----------------------------------------------------------------------
// CONFIGURACIÓN DE MULTER PARA SUBIDA DE ARCHIVOS
// ----------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Los PDFs se guardan en la carpeta uploads
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único: poliza-1678901234-5678.pdf
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `poliza-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos en formato PDF.'));
    }
  }
});
// ----------------------------------------------------------------------

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
});

// RUTA: PUT /api/polizas/:id (Editar o cambiar estado)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

    if (polizaABorrar) {
      // Si tenía un PDF asociado, lo borramos del disco
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
});

// RUTA: POST /api/polizas/:id/subir-pdf
router.post('/:id/subir-pdf', upload.single('pdf'), async (req, res) => {
  try {
    // 🔥 EL ARREGLO ESTÁ ACÁ: Le aclaramos a TypeScript que es un string
    const id = req.params.id as string; 

    if (!req.file) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo o el formato no es PDF.' });
    }

    // Buscamos si la póliza ya tenía un PDF viejo para borrarlo del disco
    const polizaExistente = await prisma.poliza.findUnique({
      where: { id: parseInt(id) }
    });

    if (polizaExistente?.pdfUrl) {
      const rutaPdfViejo = path.join(__dirname, '../../', polizaExistente.pdfUrl);
      if (fs.existsSync(rutaPdfViejo)) {
        fs.unlinkSync(rutaPdfViejo); 
      }
    }

    // Guardamos la ruta relativa en la base de datos (ej: uploads/poliza-123.pdf)
    // Multer en Windows puede guardar con '\', así que normalizamos la ruta para que siempre use '/'
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
});

export default router;