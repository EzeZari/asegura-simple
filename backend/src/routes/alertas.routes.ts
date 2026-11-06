import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verificarToken);

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

router.get('/', async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const productorId = await obtenerProductorId(req.userId!); 

    const agencia = await prisma.agencia.findUnique({ where: { id: 1 } });
    const diasCritica = agencia?.diasAlertaCritica || 7;      
    const diasMax = agencia?.diasAlertaVencimiento || 30;     

    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hoy.getDate() - 30);

    const polizasCaducadas = await prisma.poliza.findMany({
      where: {
        estado: { in: ['Vigente', 'Pendiente de Pago'] },
        fechaVencimiento: { lt: hace30Dias },
        asegurado: { productorId: productorId } 
      },
      include: { asegurado: true }
    });

    if (polizasCaducadas.length > 0) {
      for (const poliza of polizasCaducadas) {
        await prisma.poliza.update({
          where: { id: poliza.id },
          data: { estado: 'Anulada' }
        });

        await prisma.actividad.create({
          data: {
            accion: "Edición",
            entidad: "Póliza",
            descripcion: `Anulada automáticamente (> 30 días vencida de vigencia técnica)`,
            cliente: `${poliza.asegurado.nombre} ${poliza.asegurado.apellido || ''}`.trim(),
            productorId 
          }
        });
      }
    }

    const polizasActivas = await prisma.poliza.findMany({
      where: {
        estado: { in: ['Vigente', 'Pendiente de Pago'] },
        asegurado: { productorId: productorId } 
      },
      include: { asegurado: true, compania: true },
    });

    const hoyMs = hoy.getTime();

    const renovaciones_vencidas: any[] = [];
    const renovaciones_criticas: any[] = [];
    const renovaciones_proximas: any[] = [];

    const cobranzas_vencidas: any[] = [];
    const cobranzas_criticas: any[] = [];
    const cobranzas_proximas: any[] = [];

    for (const p of polizasActivas) {
      if (p.fechaVencimiento) {
        const diffDiasReno = Math.ceil((new Date(p.fechaVencimiento).getTime() - hoyMs) / (1000 * 60 * 60 * 24));
        
        if (diffDiasReno < 0 && diffDiasReno >= -30) {
          renovaciones_vencidas.push(p);
        } else if (diffDiasReno >= 0 && diffDiasReno <= diasCritica) {
          renovaciones_criticas.push(p);
        } else if (diffDiasReno > diasCritica && diffDiasReno <= diasMax) {
          renovaciones_proximas.push(p);
        }
      }

      if (p.estadoCuotas && Array.isArray(p.estadoCuotas)) {
        let cuotaMasUrgente: any = null;
        let menorDiff = Infinity;

        // 🔥 CORRECCIÓN TYPESCRIPT APLICADA ACÁ
        const cuotasArray = p.estadoCuotas as any[];

        for (const cuota of cuotasArray) {
          if (!cuota || typeof cuota !== 'object') continue;

          const isPagado = cuota.estado === 'Pagado' || cuota.estado === 'Al día' || cuota.pagado === true;
          
          if (!isPagado && cuota.fechaVencimiento) {
            const fechaVencCuota = new Date(cuota.fechaVencimiento);
            fechaVencCuota.setHours(0, 0, 0, 0);
            
            const diffDiasCuota = Math.ceil((fechaVencCuota.getTime() - hoyMs) / (1000 * 60 * 60 * 24));
            
            if (diffDiasCuota < menorDiff) {
              menorDiff = diffDiasCuota;
              cuotaMasUrgente = { ...cuota, diffDias: diffDiasCuota };
            }
          } else if (cuota.estado === 'Vencido') {
             menorDiff = -1;
             cuotaMasUrgente = { ...cuota, diffDias: -1 };
          }
        }

        if (cuotaMasUrgente) {
          const polizaConAlarma = { ...p, cuotaAlarma: cuotaMasUrgente };

          if (cuotaMasUrgente.diffDias < 0) {
            cobranzas_vencidas.push(polizaConAlarma);
          } else if (cuotaMasUrgente.diffDias >= 0 && cuotaMasUrgente.diffDias <= 7) {
            cobranzas_criticas.push(polizaConAlarma);
          } else if (cuotaMasUrgente.diffDias > 7 && cuotaMasUrgente.diffDias <= 15) {
            cobranzas_proximas.push(polizaConAlarma);
          }
        }
      }
    }

    const sortByReno = (a: any, b: any) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
    const sortByCobra = (a: any, b: any) => new Date(a.cuotaAlarma.fechaVencimiento).getTime() - new Date(b.cuotaAlarma.fechaVencimiento).getTime();

    res.json({ 
      vencidas: renovaciones_vencidas.sort(sortByReno), 
      criticas: renovaciones_criticas.sort(sortByReno), 
      proximas: renovaciones_proximas.sort(sortByReno),
      cobranzas: {
        vencidas: cobranzas_vencidas.sort(sortByCobra),
        criticas: cobranzas_criticas.sort(sortByCobra),
        proximas: cobranzas_proximas.sort(sortByCobra),
      },
      config: { diasCritica, diasMax } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener alertas.' });
  }
});

export default router;