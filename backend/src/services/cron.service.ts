import cron from 'node-cron';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from './email.service';

export const iniciarTareasProgramadas = () => {
  // Ejecutar al inicio de cada hora (En producción usar '0 * * * *')
  cron.schedule('0 * * * *', async () => {
    try {
      console.log("[ROBOT] Iniciando escaneo de vencimientos preventivos y críticos...");

      // 🔥 1. Traemos la configuración global de la Agencia para saber los Días Críticos
      const agenciaGlobal = await prisma.agencia.findUnique({ where: { id: 1 } });
      const diasAlertaCritica = agenciaGlobal?.diasAlertaCritica || 7; // 7 por defecto si falla algo

      // 2. Buscamos TODOS los productores que tienen el envío automático activo
      const productores = await prisma.productor.findMany({
        where: { envioAutomaticoActivo: true },
        select: {
          id: true,
          nombre: true,
          horaEnvioAutomatico: true,
          diasAvisoAutomatico: true
        }
      });

      const ahoraArg = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
      const horaActualArg = ahoraArg.getHours().toString().padStart(2, '0');

      for (const productor of productores) {
        const horaConfigurada = productor.horaEnvioAutomatico.split(':')[0].padStart(2, '0');

        // Comparamos la hora de su configuración con la hora actual de Argentina
        if (horaConfigurada !== horaActualArg) continue;

        console.log(`[ROBOT] Procesando productor: ${productor.nombre} (ID: ${productor.id})`);

        const year = ahoraArg.getFullYear();
        const month = ahoraArg.getMonth(); 
        const date = ahoraArg.getDate();

        // 🔥 RANGO 1: El Aviso Preventivo (Ej: 15 días antes)
        const fechaObjAviso = new Date(Date.UTC(year, month, date + productor.diasAvisoAutomatico));
        const fechaSigAviso = new Date(Date.UTC(year, month, date + productor.diasAvisoAutomatico + 1));

        // 🔥 RANGO 2: El Aviso Crítico/Urgente (Ej: 3 días antes)
        const fechaObjCritico = new Date(Date.UTC(year, month, date + diasAlertaCritica));
        const fechaSigCritico = new Date(Date.UTC(year, month, date + diasAlertaCritica + 1));

        console.log(`[🔍 DEBUG] 1er Aviso: pólizas que venzan el ${fechaObjAviso.toISOString().split('T')[0]}`);
        console.log(`[🔍 DEBUG] 2do Aviso (Crítico): pólizas que venzan el ${fechaObjCritico.toISOString().split('T')[0]}`);

        // 3. Buscamos pólizas que coincidan con ALGUNA de las dos fechas
        const polizasAVencer = await prisma.poliza.findMany({
          where: {
            estado: 'Vigente',
            productorId: productor.id,
            OR: [
              {
                fechaVencimiento: { 
                  gte: fechaObjAviso, 
                  lt: fechaSigAviso 
                }
              },
              {
                fechaVencimiento: { 
                  gte: fechaObjCritico, 
                  lt: fechaSigCritico 
                }
              }
            ]
          },
          include: { asegurado: true, compania: true }
        });

        let enviados = 0;
        for (const poliza of polizasAVencer) {
          if (poliza.asegurado?.email) {
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
              poliza.cantidadEmpleados
            );

            // Actualizamos la marca de "último aviso"
            await prisma.poliza.update({
              where: { id: poliza.id },
              data: { ultimoAviso: new Date() }
            });
            enviados++;
          }
        }

        // 4. Registro de actividad por productor
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
    } catch (error) {
      console.error("[ROBOT] Error crítico en la ejecución automática:", error);
    }
  }, {
    timezone: "America/Argentina/Buenos_Aires"
  });
  
  console.log("⏱️ Robot automático de correos (Preventivos + Críticos) cargado en memoria.");
};