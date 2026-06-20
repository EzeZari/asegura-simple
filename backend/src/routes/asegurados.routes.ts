import { Router } from 'express';
import { prisma } from '../config/db';
import { enviarCorreoBienvenida } from '../services/email.service';
import { verificarLimiteAsegurados } from '../utils/verificarLimites';
import { verificarToken } from '../middlewares/auth.middleware'; // 🔥 Tu middleware de Auth
import { verificarSuscripcionActiva } from '../middlewares/suscripcion.middleware'; // 🔥 El nuevo middleware

const router = Router();

// 🔥 MIDDLEWARES GLOBALES PARA ESTE ARCHIVO
router.use(verificarToken);
router.use(verificarSuscripcionActiva); // 🛡️ El "Patovica" protege automáticamente los POST, PUT y DELETE

// Función helper para obtener la Agencia (Productor) del usuario o su jefe
const obtenerProductorId = async (userId: number): Promise<number> => {
  // 1. Buscamos al usuario que acaba de iniciar sesión
  const usuarioActual = await prisma.user.findUnique({ where: { id: userId } });
  
  // 2. 🔥 EL NÚCLEO DE LA AGENCIA: 
  // Si el usuario tiene un "jefeId", el dueño de los datos es el Jefe. 
  // Si no tiene jefe (es el dueño), el dueño de los datos es él mismo.
  const idAgencia = usuarioActual?.jefeId ? usuarioActual.jefeId : userId;

  // 3. Ahora buscamos el perfil de "Productor" que le pertenece a la AGENCIA (al Dueño)
  let productor = await prisma.productor.findUnique({ where: { userId: idAgencia } });
  
  // (El resto es tu código original para crearlo si por alguna razón no existe)
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

// RUTA: GET /api/asegurados
// (Pasa directo porque el patovica ignora los GET)
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

// RUTA: GET /api/asegurados/:id/polizas
// (Pasa directo porque el patovica ignora los GET)
router.get('/:id/polizas', async (req, res) => {
  try {
    const { id } = req.params;
    const productorId = await obtenerProductorId(req.userId!);

    // 🔥 SEGURIDAD: Verificamos que el asegurado te pertenezca antes de mostrar sus pólizas
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

// RUTA: POST /api/asegurados
// ⛔ (Bloqueado si no pagó la suscripción)
router.post('/', async (req, res): Promise<any> => {
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

    // TODO: La agencia con ID 1 sigue acá. A futuro podríamos cambiarlo para que lea la config del productor.
    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    if ((agencia?.enviarMailBienvenida ?? true) && data.email) {
      enviarCorreoBienvenida(data.email, data.nombre, data.apellido, data.dni, data.telefono);
    }

    res.status(201).json(nuevoAsegurado);

  } catch (error: any) {
    // 🔥 AJUSTE: Mensaje más específico para un entorno Multi-tenant
    if (error.code === 'P2002') return res.status(400).json({ error: 'Ya existe un cliente con este DNI o CUIT en tu cartera.' });
    res.status(500).json({ error: 'Hubo un error al guardar el asegurado.' });
  }
});

// RUTA: PUT /api/asegurados/:id
// ⛔ (Bloqueado si no pagó la suscripción)
router.put('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const productorId = await obtenerProductorId(req.userId!);

    const viejo = await prisma.asegurado.findFirst({ 
      where: { id: parseInt(id), productorId } 
    });

    if (!viejo) return res.status(403).json({ error: 'Asegurado no encontrado o no autorizado.' });

    const aseguradoActualizado = await prisma.asegurado.update({
      where: { id: parseInt(id) },
      data: {
        nombre: data.nombre, apellido: data.apellido, tipo: data.tipo, dni: data.dni,
        condicionIva: data.condicionIva, email: data.email, telefono: data.telefono,
        direccion: data.direccion, codigoPostal: data.codigoPostal,
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
    // 🔥 AJUSTE: Si editan el cliente y ponen un DNI que ya tienen, Prisma salta.
    if (error.code === 'P2002') return res.status(400).json({ error: 'No podés guardar estos cambios. Ya tenés otro cliente con este DNI en tu cartera.' });
    res.status(500).json({ error: 'Hubo un error al actualizar el asegurado.' });
  }
});

// RUTA: DELETE /api/asegurados/:id
// ⛔ (Bloqueado si no pagó la suscripción)
router.delete('/:id', async (req, res): Promise<any> => {
  try {
    const { id } = req.params;
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

// RUTA: POST /api/asegurados/importar
// ⛔ (Bloqueado si no pagó la suscripción)
router.post('/importar', async (req, res): Promise<any> => {
  try {
    const productorId = await obtenerProductorId(req.userId!);

    const clientes = req.body;
    if (!Array.isArray(clientes)) {
      return res.status(400).json({ error: 'El formato de datos debe ser un arreglo.' });
    }

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

    const datosParaInsertar = clientes
      .map((c: any) => {
        const row = normalizarLlaves(c);
        
        const nombreCrudo = row.nombre || row.nombres || row.razonsocial || row.nombrerazonsocial || row.cliente || '';
        const apellidoCrudo = row.apellido || row.apellidos || null;
        const dniCrudo = row.dni || row.cuit || row.documento || row.doc || row.dnicuit || '';
        
        const nombreLimpio = String(nombreCrudo).trim();
        const apellidoLimpio = apellidoCrudo ? String(apellidoCrudo).trim() : null;
        const dniLimpio = String(dniCrudo).trim().replace(/[^0-9]/g, '');
        const telefonoLimpio = row.telefono || row.celular || row.tel || null;
        const emailLimpio = row.email || row.correo || row.mail || null;
        
        let tipoCalculado = "Individual";
        const tipoOriginal = String(row.tipo || row.tipocliente || row.tipodecliente || '').toLowerCase();
        if (tipoOriginal.includes('empresa') || tipoOriginal.includes('juridico') || dniLimpio.length === 11) {
          tipoCalculado = "Empresa";
        }

        let activoCalculado = true;
        const estadoOriginal = String(row.estado || row.estadoensistema || '').toLowerCase();
        if (estadoOriginal === 'inactivo') {
          activoCalculado = false;
        }

        return {
          nombre: nombreLimpio, 
          apellido: apellidoLimpio, 
          dni: dniLimpio,
          telefono: telefonoLimpio ? String(telefonoLimpio).trim() : null,
          email: emailLimpio ? String(emailLimpio).trim() : null,
          tipo: tipoCalculado, 
          activo: activoCalculado, 
          productorId
        };
      })
      .filter((c: any) => c.nombre.length > 0 && c.dni.length > 0);

    if (datosParaInsertar.length === 0) {
      return res.status(400).json({ error: 'No se encontraron registros válidos.' });
    }

    // 🔥 ACÁ MOVIMOS LA VALIDACIÓN: Ahora sabe exactamente cuántos querés subir
    const validacion = await verificarLimiteAsegurados(req.userId!, datosParaInsertar.length);
    if (validacion.superado) {
      return res.status(403).json({ error: validacion.mensaje, codigo: "LIMITE_EXCEDIDO" });
    }

    const resultado = await (prisma as any).asegurado.createMany({
      data: datosParaInsertar,
      // 🔥 MAGIA DE PRISMA: Como la regla ahora es @@unique([productorId, dni]), 
      // skipDuplicates omitirá SOLO los DNI que ya estén en la cuenta de ESTE productorId.
      skipDuplicates: true
    });

    await prisma.actividad.create({
      data: {
        accion: "Alta", 
        entidad: "Asegurado",
        descripcion: `Importación masiva: ${resultado.count} nuevos clientes cargados.`,
        cliente: "Sistema / Excel",
        productorId 
      }
    });

    res.json({
      message: 'Importación procesada con éxito',
      procesados: datosParaInsertar.length,
      creados: resultado.count,
      salteados: datosParaInsertar.length - resultado.count
    });

  } catch (error: any) {
    console.error("Error en importación masiva:", error);
    res.status(500).json({ error: error.message || 'Error interno al procesar la carga masiva.' });
  }
});

export default router;