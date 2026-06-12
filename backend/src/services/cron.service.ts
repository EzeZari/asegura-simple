import cron from 'node-cron';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from './email.service';

export const iniciarTareasProgramadas = () => {
  // Ejecutar al inicio de cada hora
  cron.schedule('0 * * * *', async () => {
    try {
      console.log("[ROBOT] Iniciando escaneo de vencimientos...");

      // 1. Buscamos TODOS los productores que tienen el envío automático activo
      const productores = await prisma.productor.findMany({
        where: { envioAutomaticoActivo: true },
        select: {
          id: true,
          nombre: true,
          horaEnvioAutomatico: true,
          diasAvisoAutomatico: true
        }
      });

      for (const productor of productores) {
        // 2. Verificamos si la hora actual coincide con la configuración de este productor
        // Nos aseguramos de manejar la comparación de horas en formato '09'
        const horaConfigurada = productor.horaEnvioAutomatico.split(':')[0].padStart(2, '0');
        const horaActual = new Date().getHours().toString().padStart(2, '0');

        if (horaConfigurada !== horaActual) continue;

        console.log(`[ROBOT] Procesando productor: ${productor.nombre} (ID: ${productor.id})`);

        // 3. Calculamos la fecha objetivo (Hoy + días configurados)
        const fechaObjetivo = new Date();
        fechaObjetivo.setDate(fechaObjetivo.getDate() + productor.diasAvisoAutomatico);
        fechaObjetivo.setHours(0, 0, 0, 0);

        const fechaSiguiente = new Date(fechaObjetivo);
        fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

        // 4. Buscamos pólizas de ESTE productor que venzan ese día
        const polizasAVencer = await prisma.poliza.findMany({
          where: {
            estado: 'Vigente',
            asegurado: { productorId: productor.id },
            fechaVencimiento: { 
              gte: fechaObjetivo, 
              lt: fechaSiguiente 
            },
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

            // Actualizamos la marca de "último aviso" para evitar duplicados
            await prisma.poliza.update({
              where: { id: poliza.id },
              data: { ultimoAviso: new Date() }
            });
            enviados++;
          }
        }

        // 5. Registro de actividad por productor
        if (enviados > 0) {
          await prisma.actividad.create({
            data: {
              accion: "Automatización",
              entidad: "Sistema",
              descripcion: `Robot automático: ${enviados} avisos enviados.`,
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
  
  console.log("⏱️ Robot automático (Multi-tenant) cargado en memoria.");
};