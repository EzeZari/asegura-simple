import cron from 'node-cron';
import { prisma } from '../config/db';
import { 
  enviarAvisoVencimiento, 
  enviarAlertaErrorSistema, 
  enviarRecordatorioSuscripcion, 
  enviarAvisoCuentaSuspendida 
} from './email.service';

export const iniciarTareasProgramadas = () => {
  
  // =========================================================================
  // 🤖 ROBOT DE PÓLIZAS: Se ejecuta al inicio de cada hora
  // Verifica vencimientos de pólizas si la agencia tiene suscripción activa
  // =========================================================================
  cron.schedule('0 * * * *', async () => {
    try {
      console.log("[ROBOT] Iniciando escaneo de vencimientos preventivos y críticos...");

      const agenciaGlobal = await prisma.agencia.findUnique({ where: { id: 1 } });
      const diasAlertaCritica = agenciaGlobal?.diasAlertaCritica || 7;

      const productores = await prisma.productor.findMany({
        where: { envioAutomaticoActivo: true },
        include: {
          user: {
            include: {
              suscripcion: true
            }
          }
        }
      });

      const ahoraArg = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
      const horaActualArg = ahoraArg.getHours().toString().padStart(2, '0');

      for (const productor of productores) {
        const horaConfigurada = productor.horaEnvioAutomatico.split(':')[0].padStart(2, '0');
        if (horaConfigurada !== horaActualArg) continue;

        // 🔥 EL CANDADO DEL ROBOT: Verificación de Suscripción
        const userOwner = productor.user;
        if (!userOwner) continue;

        const suscripcion = userOwner.suscripcion;
        const hoy = new Date();
        let suscripcionActiva = false;

        if (userOwner.plan === 'GRATUITO') {
          if (suscripcion?.fechaVencimiento) {
            const fechaVto = new Date(suscripcion.fechaVencimiento);
            if (hoy <= fechaVto) suscripcionActiva = true;
          } else {
            suscripcionActiva = true; 
          }
        } else {
          const pagoAutorizado = suscripcion?.estado === 'autorizado';
          const fechaVto = suscripcion?.fechaVencimiento ? new Date(suscripcion.fechaVencimiento) : new Date(0);
          const tieneDiasAFavor = fechaVto > hoy;
          
          const fechaLimiteGracia = new Date(fechaVto);
          fechaLimiteGracia.setDate(fechaLimiteGracia.getDate() + 3);
          const enPeriodoDeGracia = hoy <= fechaLimiteGracia;

          if (pagoAutorizado || tieneDiasAFavor || enPeriodoDeGracia) {
            suscripcionActiva = true;
          }
        }

        if (!suscripcionActiva) {
          console.log(`[ROBOT ⛔] Bloqueado para: ${productor.nombre}. Motivo: Suscripción inactiva o vencida.`);
          continue; 
        }

        console.log(`[ROBOT] Procesando productor: ${productor.nombre} (ID: ${productor.id})`);

        const year = ahoraArg.getFullYear();
        const month = ahoraArg.getMonth(); 
        const date = ahoraArg.getDate();

        const fechaObjAviso = new Date(Date.UTC(year, month, date + productor.diasAvisoAutomatico));
        const fechaSigAviso = new Date(Date.UTC(year, month, date + productor.diasAvisoAutomatico + 1));

        const fechaObjCritico = new Date(Date.UTC(year, month, date + diasAlertaCritica));
        const fechaSigCritico = new Date(Date.UTC(year, month, date + diasAlertaCritica + 1));

        const polizasAVencer = await prisma.poliza.findMany({
          where: {
            estado: 'Vigente',
            productorId: productor.id,
            OR: [
              { fechaVencimiento: { gte: fechaObjAviso, lt: fechaSigAviso } },
              { fechaVencimiento: { gte: fechaObjCritico, lt: fechaSigCritico } }
            ]
          },
          include: { asegurado: true, compania: true }
        });

        let enviados = 0;
        for (const poliza of polizasAVencer) {
          if (poliza.asegurado?.email) {
            const cuponeraParaEnviar = (poliza.enviarCuponera && poliza.cuponeraUrl) ? poliza.cuponeraUrl : null;

            await enviarAvisoVencimiento(
              poliza.asegurado.email,
              `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(),
              poliza.nroPoliza,
              poliza.compania?.nombre || "Sin Compañía",
              poliza.tipoPoliza,
              poliza.cobertura || "",
              new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR"),
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
            enviados++;
          }
        }

        if (enviados > 0) {
          await prisma.actividad.create({
            data: {
              accion: "Automatización",
              entidad: "Sistema",
              descripcion: `Robot automático: ${enviados} avisos enviados (Preventivos + Críticos).`,
              cliente: "Robot",
              productorId: productor.id 
            }
          });
          console.log(`[ROBOT] Trabajo terminado para ${productor.nombre}: ${enviados} correos enviados.`);
        }
      }
    } catch (error: any) {
      console.error("[ROBOT] Error crítico en la ejecución automática:", error);
      await enviarAlertaErrorSistema(
        'CRON JOB - iniciarTareasProgramadas',
        error.message || error,
        'El escaneo general de pólizas falló. Revisar conexión a la base de datos o lógica del cron.'
      );
    }
  }, {
    timezone: "America/Argentina/Buenos_Aires"
  });

  // =========================================================================
  // 🤖 ROBOT COBRADOR: Se ejecuta todos los días a las 10:00 AM
  // Busca usuarios que vencen en 3 días Y los que vencen HOY
  // =========================================================================
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log("[ROBOT COBRADOR] Iniciando escaneo de suscripciones...");

      const hoy = new Date();
      
      // 1. Rango para los que vencen en 3 DÍAS (Aviso Preventivo)
      const target3Dias = new Date();
      target3Dias.setDate(hoy.getDate() + 3); 
      const inicio3Dias = new Date(target3Dias.setHours(0, 0, 0, 0));
      const fin3Dias = new Date(target3Dias.setHours(23, 59, 59, 999));

      // 2. Rango para los que vencen HOY (Aviso de Vencimiento)
      const inicioHoy = new Date(hoy).setHours(0, 0, 0, 0);
      const finHoy = new Date(hoy).setHours(23, 59, 59, 999);

      // Traemos las suscripciones que entran en la ventana de 3 días
      const aVencerEn3Dias = await prisma.suscripcion.findMany({
        where: {
          fechaVencimiento: { gte: new Date(inicio3Dias), lte: new Date(fin3Dias) }
        },
        include: { user: true }
      });

      // Traemos las suscripciones que están venciendo en el día de hoy
      const vencenHoy = await prisma.suscripcion.findMany({
        where: {
          fechaVencimiento: { gte: new Date(inicioHoy), lte: new Date(finHoy) }
        },
        include: { user: true }
      });

      let avisos3Dias = 0;
      let avisosHoy = 0;

      // Despachar recordatorios de 3 Días
      for (const sub of aVencerEn3Dias) {
        if (sub.user && sub.user.plan !== 'GRATUITO' && sub.user.email) {
          await enviarRecordatorioSuscripcion(sub.user.email, sub.user.nombre, sub.fechaVencimiento!);
          avisos3Dias++;
        }
      }

      // Despachar avisos de Vencimiento (Hoy)
      for (const sub of vencenHoy) {
        if (sub.user && sub.user.plan !== 'GRATUITO' && sub.user.email) {
          await enviarAvisoCuentaSuspendida(sub.user.email, sub.user.nombre);
          avisosHoy++;
        }
      }

      console.log(`[ROBOT COBRADOR] Escaneo finalizado. Se enviaron ${avisos3Dias} avisos preventivos y ${avisosHoy} avisos de vencimiento.`);
    } catch (error: any) {
      console.error("[ROBOT COBRADOR] Error crítico:", error);
      await enviarAlertaErrorSistema(
        'CRON JOB - Robot Cobrador',
        error.message || error,
        'Fallo al escanear suscripciones por vencer.'
      );
    }
  }, {
    timezone: "America/Argentina/Buenos_Aires"
  });
  
  console.log("⏱️ Robots de automatización (Pólizas y Cobranzas) cargados en memoria.");
};