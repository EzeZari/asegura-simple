import cron from 'node-cron';
import { prisma } from '../config/db';
import { enviarAvisoVencimiento } from './email.service';

export const iniciarTareasProgramadas = () => {
  // El "0 * * * *" significa: "Ejecutar en el minuto 0 de cada hora" (ej: 09:00, 10:00, 11:00)
  cron.schedule('0 * * * *', async () => {
    try {
      // 1. Buscamos la configuración de la agencia
      const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
      
      // Si no existe o está apagado el envío automático, cortamos acá
      if (!agencia || !agencia.envioAutomaticoActivo) return;

      // 2. Verificamos si es la hora correcta
      // La BD guarda "09:00", sacamos el "09"
      const horaConfigurada = agencia.horaEnvioAutomatico.split(':')[0]; 
      // Sacamos la hora actual del servidor en formato de 2 dígitos
      const horaActual = new Date().getHours().toString().padStart(2, '0'); 

      if (horaConfigurada !== horaActual) return;

      console.log(`[ROBOT] Despertando... Buscando pólizas a vencer en ${agencia.diasAvisoAutomatico} días.`);

      // 3. Calculamos la fecha objetivo exacta (ej: Hoy + 15 días)
      const fechaObjetivo = new Date();
      fechaObjetivo.setDate(fechaObjetivo.getDate() + agencia.diasAvisoAutomatico);
      fechaObjetivo.setHours(0, 0, 0, 0);

      const fechaSiguiente = new Date(fechaObjetivo);
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);

      // 4. Buscamos pólizas vigentes que venzan ese día puntual
      const polizasAVencer = await prisma.poliza.findMany({
        where: {
          estado: 'Vigente',
          fechaVencimiento: {
            gte: fechaObjetivo,
            lt: fechaSiguiente,
          },
        },
        include: { asegurado: true, compania: true }
      });

      if (polizasAVencer.length === 0) {
        console.log("[ROBOT] Hoy no hay pólizas para avisar.");
        return;
      }

      // 5. Mandamos los correos uno por uno
      let enviados = 0;

      for (const poliza of polizasAVencer) {
        if (poliza.asegurado?.email) {
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

          // Actualizamos la marca de "último aviso" para que no se repita
          await prisma.poliza.update({
            where: { id: poliza.id },
            data: { ultimoAviso: new Date() }
          });

          enviados++;
        }
      }

      // 6. Dejamos registro en el historial de actividad si mandamos algo
      if (enviados > 0) {
        await prisma.actividad.create({
          data: {
            accion: "Automatización",
            entidad: "Sistema",
            descripcion: `El Robot Automático envió ${enviados} correos de aviso de vencimiento.`,
            cliente: "Robot"
          }
        });
        console.log(`[ROBOT] Trabajo terminado: ${enviados} correos enviados.`);
      }

    } catch (error) {
      console.error("[ROBOT] Error en la ejecución automática:", error);
    }
  }, {
    timezone: "America/Argentina/Buenos_Aires" // Nos aseguramos de que respete nuestra hora local
  });
  
  console.log("⏱️  Robot automático (Cron Job) cargado en memoria.");
};