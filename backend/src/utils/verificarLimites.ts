import { prisma } from '../config/db';

// 🔥 NUEVOS LÍMITES ESTRATÉGICOS UNIFICADOS (Asegurados, Usuarios y Escaneos PDF)
const LIMITES_PLANES = {
  GRATUITO: { asegurados: 10, usuarios: 1, pdfsMes: 0 },
  BASICO: { asegurados: 100, usuarios: 1, pdfsMes: 25 },
  PROFESIONAL: { asegurados: 300, usuarios: 3, pdfsMes: 50 },
  AGENCIA: { asegurados: Infinity, usuarios: 10, pdfsMes: 200 }
};

// 1. VERIFICAR LÍMITE DE ASEGURADOS
export const verificarLimiteAsegurados = async (userId: number, cantidadAInsertar: number = 1): Promise<{ superado: boolean; mensaje?: string }> => {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, email: true, jefeId: true } 
  });

  if (!usuario) {
    return { superado: true, mensaje: "Usuario no encontrado." };
  }

  const idAgencia = usuario.jefeId ? usuario.jefeId : userId;

  const miembrosAgencia = await prisma.user.findMany({
    where: {
      OR: [
        { id: idAgencia },
        { jefeId: idAgencia }
      ]
    },
    select: { email: true }
  });

  const emailsAgencia = miembrosAgencia.map(m => m.email);

  const cantidadActual = await prisma.asegurado.count({
    where: { 
      productor: {
        email: { in: emailsAgencia } 
      }
    }
  });

  const planActual = usuario.plan || "GRATUITO";
  
  const limiteMaximo = LIMITES_PLANES[planActual as keyof typeof LIMITES_PLANES]?.asegurados || 10;

  if ((cantidadActual + cantidadAInsertar) > limiteMaximo) {
    const lugaresDisponibles = limiteMaximo - cantidadActual;
    
    const mensaje = cantidadAInsertar > 1 
      ? `Tu plan ${planActual} permite hasta ${limiteMaximo} asegurados. Tenés ${lugaresDisponibles} lugares disponibles y el Excel tiene ${cantidadAInsertar} clientes. Mejorá tu suscripción.`
      : `Tu agencia alcanzó el límite de ${limiteMaximo} asegurados del plan ${planActual}. Mejorá tu suscripción para seguir creciendo.`;

    return {
      superado: true,
      mensaje
    };
  }

  return { superado: false };
};

// 2. VERIFICAR LÍMITE DE USUARIOS (EQUIPO)
export const verificarLimiteUsuariosEquipo = async (jefeId: number): Promise<{ superado: boolean; mensaje?: string }> => {
  const usuarioDueno = await prisma.user.findUnique({
    where: { id: jefeId },
    select: { plan: true }
  });

  if (!usuarioDueno) {
    return { superado: true, mensaje: "Cuenta principal no encontrada." };
  }

  const cantidadEmpleados = await prisma.user.count({
    where: { jefeId: jefeId }
  });

  const planActual = usuarioDueno.plan || "GRATUITO";
  
  const limiteTotalUsuarios = LIMITES_PLANES[planActual as keyof typeof LIMITES_PLANES]?.usuarios || 1;
  const limiteInvitados = limiteTotalUsuarios - 1;

  if (cantidadEmpleados >= limiteInvitados) {
    return { 
      superado: true, 
      mensaje: `Tu plan ${planActual} permite un máximo de ${limiteTotalUsuarios} usuario(s) en total (incluyéndote a vos). Mejorá tu suscripción para agregar más miembros al equipo.` 
    };
  }

  return { superado: false };
};

// 🔥 3. NUEVA FUNCIÓN: VERIFICAR LÍMITE DE LECTURA DE PÓLIZAS PDF POR IA
export const verificarLimiteEscaneosPdf = async (jefeId: number): Promise<{ superado: boolean; mensaje?: string; usosActuales: number; limite: number; plan: string }> => {
  const usuarioDueno: any = await prisma.user.findUnique({
    where: { id: jefeId },
    select: { plan: true, escaneosMesActual: true, mesUltimoEscaneo: true }
  });

  if (!usuarioDueno) {
    return { superado: true, mensaje: "Cuenta principal no encontrada.", usosActuales: 0, limite: 0, plan: "GRATUITO" };
  }

  const planActual = usuarioDueno.plan || "GRATUITO";

  // 🔥 BLOQUEO DIRECTO AL PLAN GRATUITO
  if (planActual === "GRATUITO") {
    return { 
      superado: true, 
      mensaje: "El plan Gratuito no incluye la lectura inteligente de pólizas con IA. Mejorá tu suscripción a Básico o superior para automatizar tus cargas.",
      usosActuales: 0, 
      limite: 0, 
      plan: "GRATUITO" 
    };
  }

  const hoy = new Date();
  const mesActualStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  
  // Reinicio automático si cambió el mes
  let escaneosUsados = usuarioDueno.escaneosMesActual || 0;
  if (usuarioDueno.mesUltimoEscaneo !== mesActualStr) {
    escaneosUsados = 0;
  }

  const limiteMaximo = LIMITES_PLANES[planActual as keyof typeof LIMITES_PLANES]?.pdfsMes || 0;

  // Validación de límites para planes de pago
  if (escaneosUsados >= limiteMaximo) {
    return { 
      superado: true, 
      mensaje: `Alcanzaste el límite de ${limiteMaximo} pólizas procesadas con IA por mes de tu plan ${planActual}. Mejorá tu plan para obtener más escaneos.`,
      usosActuales: escaneosUsados,
      limite: limiteMaximo,
      plan: planActual
    };
  }

  return { superado: false, usosActuales: escaneosUsados, limite: limiteMaximo, plan: planActual };
};