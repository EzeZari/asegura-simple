import { Router } from 'express';
import { prisma } from '../config/db';
import { enviarCorreoBienvenida } from '../services/email.service';
import { verificarLimiteAsegurados } from '../utils/verificarLimites';
import { verificarToken } from '../middlewares/auth.middleware';
import { verificarSuscripcionActiva } from '../middlewares/suscripcion.middleware';
import { verificarRol } from '../middlewares/role.middleware'; 

const router = Router();

// 🔥 MIDDLEWARES GLOBALES PARA ESTE ENRUTADOR
router.use(verificarToken);
router.use(verificarSuscripcionActiva);

// Helper para obtener el Productor asociado al usuario o a su agencia
const obtenerProductorId = async (userId: number): Promise<number> => {
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;

  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  if (!productor) {
    const userDueno = idAgencia === userId ? usuarioActual : await prisma.user.findUnique({ where: { id: idAgencia } });
    const userEmail = userDueno?.email || `user${idAgencia}@asegurasimple.com`;

    productor = await prisma.productor.findUnique({ where: { email: userEmail } });

    if (productor) {
      productor = await prisma.productor.update({
        where: { id: productor.id },
        data: { userId: idAgencia }
      });
    } else {
      productor = await prisma.productor.create({
        data: {
          nombre: userDueno?.nombre || 'Productor',
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

// ==========================================
// 🟢 ZONA DE LECTURA (Acceso para Dueños, Productores y Vendedores)
// ==========================================

router.get('/', async (req, res) => {
  try {
    const productorId = await obtenerProductorId(req.userId!);
    const asegurados = await prisma.asegurado.findMany({
      where: { productorId },
      include: { _count: { select: { polizas: true } } },
      orderBy: { nombre: 'asc' }
    });
    res.json(asegurados);
  } catch (error) {
    console.error("Error al obtener asegurados:", error);
    res.status(500).json({ error: 'Error al obtener asegurados.' });
  }
});

router.get('/:id/polizas', async (req, res): Promise<any> => {
  try {
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);

    const asegurado = await prisma.asegurado.findFirst({
      where: { id: parseInt(id), productorId }
    });

    if (!asegurado) {
      return res.status(403).json({ error: 'El asegurado no existe o no te pertenece.' });
    }

    const polizas = await prisma.poliza.findMany({
      where: { aseguradoId: parseInt(id) },
      include: { compania: true },
      orderBy: { fechaVencimiento: 'asc' }
    });
    res.json(polizas);
  } catch (error) {
    console.error("Error al obtener pólizas:", error);
    res.status(500).json({ error: 'Error al obtener pólizas.' });
  }
});

// ==========================================
// 🔴 ZONA DE ESCRITURA (Bloqueada para Vendedores/VIEWERS)
// ==========================================

router.post('/', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    const productorId = await obtenerProductorId(req.userId!);

    const validacion = await verificarLimiteAsegurados(req.userId!);
    if (validacion.superado) {
      return res.status(403).json({ error: validacion.mensaje, codigo: "LIMITE_EXCEDIDO" });
    }

    const data = req.body;

    const nuevoAsegurado = await prisma.asegurado.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        tipo: data.tipo,
        dni: data.dni,
        condicionIva: data.condicionIva,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        codigoPostal: data.codigoPostal,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        productorId,
      },
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta", 
        entidad: "Asegurado", 
        descripcion: "Nuevo cliente registrado",
        cliente: `${data.nombre} ${data.apellido || ''}`.trim(),
        productorId 
      }
    });

    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    if ((agencia?.enviarMailBienvenida ?? true) && data.email) {
      enviarCorreoBienvenida(data.email, data.nombre, data.apellido, data.dni, data.telefono);
    }

    res.status(201).json(nuevoAsegurado);

  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe un cliente con este DNI o CUIT en tu cartera.' });
    res.status(500).json({ error: 'Hubo un error al guardar el asegurado.' });
  }
});

router.put('/:id', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    const viejo = await prisma.asegurado.findFirst({ 
      where: { id: parseInt(id), productorId } 
    });

    if (!viejo) return res.status(403).json({ error: 'Asegurado no encontrado o no autorizado.' });

    const aseguradoActualizado = await prisma.asegurado.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre, 
        apellido: data.apellido, 
        tipo: data.tipo, 
        dni: data.dni,
        condicionIva: data.condicionIva, 
        email: data.email, 
        telefono: data.telefono,
        direccion: data.direccion, 
        codigoPostal: data.codigoPostal,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        activo: data.activo,
      },
    });

    let cambios = [];
    if (viejo.nombre !== data.nombre) cambios.push(`Nombre: ${viejo.nombre} -> ${data.nombre}`);
    if (viejo.apellido !== data.apellido) cambios.push(`Apellido: ${viejo.apellido} -> ${data.apellido}`);
    if (viejo.telefono !== data.telefono) cambios.push(`Tel: ${viejo.telefono || '-'} -> ${data.telefono || '-'}`);
    if (viejo.email !== data.email) cambios.push(`Email: ${viejo.email || '-'} -> ${data.email || '-'}`);
    if (viejo.dni !== data.dni) cambios.push(`DNI: ${viejo.dni} -> ${data.dni}`);

    const textoDetalle = cambios.length > 0 ? cambios.join(" | ") : "Actualización de datos";
    const accionReal = data.activo === false && viejo.activo === true ? "Desactivación" :
                       data.activo === true && viejo.activo === false ? "Activación" : "Edición";

    await prisma.actividad.create({
      data: {
        accion: accionReal, 
        entidad: "Asegurado",
        descripcion: accionReal !== "Edición" ? (accionReal === "Desactivación" ? "Cliente pasado a Inactivo" : "Cliente vuelto a Activar") : textoDetalle,
        cliente: `${data.nombre} ${data.apellido || ''}`.trim(),
        productorId
      }
    });

    res.json(aseguradoActualizado);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'No podés guardar estos cambios. Ya tenés otro cliente con este DNI en tu cartera.' });
    res.status(500).json({ error: 'Hubo un error al actualizar el asegurado.' });
  }
});

router.delete('/:id', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    const id = req.params.id as string;
    const productorId = await obtenerProductorId(req.userId!);

    const aseguradoABorrar = await prisma.asegurado.findFirst({ 
      where: { id: parseInt(id), productorId } 
    });

    if (!aseguradoABorrar) return res.status(403).json({ error: 'Asegurado no encontrado o no autorizado.' });

    await prisma.asegurado.delete({ where: { id: parseInt(id) } });

    await prisma.actividad.create({
      data: {
        accion: "Baja", 
        entidad: "Asegurado",
        descripcion: `${aseguradoABorrar.nombre} ${aseguradoABorrar.apellido || ''}`.trim(),
        productorId
      }
    });

    res.json({ message: 'Asegurado eliminado' });
  } catch (error: any) {
    if (error.code === 'P2003') return res.status(400).json({ error: 'No se puede eliminar un asegurado con pólizas activas.' });
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

// ==========================================
// 🚀 IMPORTACIÓN MASIVA INTELIGENTE DE ASEGURADOS
// ==========================================

router.post('/importar', verificarRol(['DUENO', 'PRODUCTOR']), async (req, res): Promise<any> => {
  try {
    const productorId = await obtenerProductorId(req.userId!);

    const clientesExcel = req.body;
    if (!Array.isArray(clientesExcel)) {
      return res.status(400).json({ error: 'El formato de datos debe ser un arreglo.' });
    }

    // Buscamos los DNIs que ya existen en la base de datos de esta agencia
    const aseguradosExistentes = await prisma.asegurado.findMany({
      where: { productorId },
      select: { dni: true }
    });
    const setDnisExistentes = new Set(aseguradosExistentes.map(a => String(a.dni).trim().replace(/[^0-9]/g, '')));

    const normalizarLlaves = (obj: any) => {
      const nuevoObj: any = {};
      for (let key in obj) {
        const llaveLimpia = key.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, '');
        nuevoObj[llaveLimpia] = obj[key];
      }
      return nuevoObj;
    };

    const normalizarCondicionIva = (valor: any) => {
      if (!valor) return "Consumidor Final";
      const v = String(valor).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (v.includes('mono')) return 'Monotributo';
      if (v.includes('inscripto') || v === 'ri') return 'Responsable Inscripto';
      if (v.includes('exento')) return 'Exento';
      return 'Consumidor Final';
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
    const setDnisEnEsteExcel = new Set<string>();

    let creados = 0;
    let salteados = 0;

    clientesExcel.forEach((c: any, index: number) => {
      const filaExcel = index + 2;
      const row = normalizarLlaves(c);

      const nombreCrudo = row.nombre || row.nombres || row.razonsocial || row.nombrerazonsocial || row.cliente || '';
      const apellidoCrudo = row.apellido || row.apellidos || null;
      const dniCrudo = row.dni || row.cuit || row.documento || row.doc || row.dnicuit || '';

      const nombreLimpio = String(nombreCrudo).trim();
      const apellidoLimpio = apellidoCrudo ? String(apellidoCrudo).trim() : null;
      const dniLimpio = String(dniCrudo).trim().replace(/[^0-9]/g, '');

      // VALIDACIÓN 1: Nombre obligatorio
      if (!nombreLimpio) {
        reporteDetallado.push({ 
          fila: filaExcel, 
          cliente: "Sin Nombre", 
          dni: dniLimpio || "S/D", 
          estado: "error", 
          motivo: "El nombre o razón social está vacío." 
        });
        salteados++;
        return;
      }

      // VALIDACIÓN 2: DNI/CUIT obligatorio
      if (!dniLimpio) {
        reporteDetallado.push({ 
          fila: filaExcel, 
          cliente: nombreLimpio, 
          dni: "Vacío", 
          estado: "error", 
          motivo: "El número de DNI o CUIT está vacío." 
        });
        salteados++;
        return;
      }

      // VALIDACIÓN 3: Ya existe en la cartera
      if (setDnisExistentes.has(dniLimpio)) {
        reporteDetallado.push({ 
          fila: filaExcel, 
          cliente: `${nombreLimpio} ${apellidoLimpio || ''}`.trim(), 
          dni: dniLimpio, 
          estado: "error", 
          motivo: "Este DNI/CUIT ya existe en tu cartera." 
        });
        salteados++;
        return;
      }

      // VALIDACIÓN 4: Repetido en el mismo Excel
      if (setDnisEnEsteExcel.has(dniLimpio)) {
        reporteDetallado.push({ 
          fila: filaExcel, 
          cliente: `${nombreLimpio} ${apellidoLimpio || ''}`.trim(), 
          dni: dniLimpio, 
          estado: "error", 
          motivo: "DNI/CUIT duplicado dentro de la misma planilla." 
        });
        salteados++;
        return;
      }

      setDnisEnEsteExcel.add(dniLimpio);

      // Normalizaciones y cálculo de datos adicionales
      let tipoCalculado = "Individuo";
      const tipoOriginal = String(row.tipo || row.tipocliente || row.tipodecliente || '').toLowerCase();
      if (tipoOriginal.includes('empresa') || tipoOriginal.includes('juridico') || dniLimpio.length === 11) {
        tipoCalculado = "Empresa";
      }

      const condicionIvaCalculada = normalizarCondicionIva(row.condicioniva || row.iva || row.situacioniva);
      const telefonoLimpio = row.telefono || row.celular || row.tel ? String(row.telefono || row.celular || row.tel).trim() : null;
      const emailLimpio = row.email || row.correo || row.mail ? String(row.email || row.correo || row.mail).trim().toLowerCase() : null;
      const direccionLimpia = row.direccion || row.domicilio || row.calle ? String(row.direccion || row.domicilio || row.calle).trim() : null;
      const codigoPostalLimpio = row.codigopostal || row.cp ? String(row.codigopostal || row.cp).trim() : null;
      const fechaNac = parsearFecha(row.fechanacimiento || row.fechanac || row.nacimiento);

      let activoCalculado = true;
      const estadoOriginal = String(row.estado || row.estadoensistema || '').toLowerCase();
      if (estadoOriginal === 'inactivo') {
        activoCalculado = false;
      }

      datosParaInsertar.push({
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        dni: dniLimpio,
        tipo: tipoCalculado,
        condicionIva: condicionIvaCalculada,
        email: emailLimpio,
        telefono: telefonoLimpio,
        direccion: direccionLimpia,
        codigoPostal: codigoPostalLimpio,
        fechaNacimiento: fechaNac,
        activo: activoCalculado,
        productorId
      });

      creados++;
      reporteDetallado.push({
        fila: filaExcel,
        cliente: `${nombreLimpio} ${apellidoLimpio || ''}`.trim(),
        dni: dniLimpio,
        estado: "exito",
        motivo: "Cliente importado correctamente."
      });
    });

    if (datosParaInsertar.length === 0) {
      return res.status(400).json({ error: 'No se encontraron registros válidos para importar.' });
    }

    // Control de límite de clientes según el plan contratado
    const validacion = await verificarLimiteAsegurados(req.userId!, datosParaInsertar.length);
    if (validacion.superado) {
      return res.status(403).json({ error: validacion.mensaje, codigo: "LIMITE_EXCEDIDO" });
    }

    const resultado = await (prisma as any).asegurado.createMany({
      data: datosParaInsertar,
      skipDuplicates: true
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta", 
        entidad: "Asegurado",
        descripcion: `Importación masiva: se cargaron ${resultado.count} clientes nuevos.`,
        cliente: "Sistema / Excel",
        productorId 
      }
    });

    res.json({
      message: 'Importación procesada con éxito',
      procesados: clientesExcel.length,
      creados: resultado.count,
      salteados: salteados + (datosParaInsertar.length - resultado.count),
      reporte: reporteDetallado
    });

  } catch (error: any) {
    console.error("Error en importación masiva de asegurados:", error);
    res.status(500).json({ error: error.message || 'Error interno al procesar la carga masiva.' });
  }
});

export default router;