import { prisma } from '../config/db';

// 🔥 NUEVOS LÍMITES ESTRATÉGICOS UNIFICADOS (Asegurados y Usuarios)
const LIMITES_PLANES = {
  GRATUITO: { asegurados: 10, usuarios: 1 },
  BASICO: { asegurados: 100, usuarios: 1 },
  PROFESIONAL: { asegurados: 300, usuarios: 3 },
  AGENCIA: { asegurados: Infinity, usuarios: 10 }
};

// 1. VERIFICAR LÍMITE DE ASEGURADOS (Mantiene tu lógica intacta para Excel)
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
  
  // 🔥 Leemos el límite de asegurados desde la nueva estructura
  const limiteMaximo = LIMITES_PLANES[planActual as keyof typeof LIMITES_PLANES]?.asegurados || 10;

  // ACÁ ESTÁ LA MAGIA: Sumamos lo que tenés + lo que querés meter
  if ((cantidadActual + cantidadAInsertar) > limiteMaximo) {
    const lugaresDisponibles = limiteMaximo - cantidadActual;
    
    // Armamos un mensaje inteligente dependiendo si intentan subir 1 a mano, o varios por Excel
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

// 2. NUEVA FUNCIÓN: VERIFICAR LÍMITE DE USUARIOS (EQUIPO)
export const verificarLimiteUsuariosEquipo = async (jefeId: number): Promise<{ superado: boolean; mensaje?: string }> => {
  const usuarioDueno = await prisma.user.findUnique({
    where: { id: jefeId },
    select: { plan: true }
  });

  if (!usuarioDueno) {
    return { superado: true, mensaje: "Cuenta principal no encontrada." };
  }

  // Contamos cuántos empleados (sub-usuarios) tiene registrados
  const cantidadEmpleados = await prisma.user.count({
    where: { jefeId: jefeId }
  });

  const planActual = usuarioDueno.plan || "GRATUITO";
  
  // 🔥 Leemos el límite de usuarios desde la nueva estructura
  const limiteTotalUsuarios = LIMITES_PLANES[planActual as keyof typeof LIMITES_PLANES]?.usuarios || 1;
  
  // El dueño ya ocupa 1 asiento (1 licencia), por lo tanto el límite para invitados es límite - 1
  const limiteInvitados = limiteTotalUsuarios - 1;

  if (cantidadEmpleados >= limiteInvitados) {
    return { 
      superado: true, 
      mensaje: `Tu plan ${planActual} permite un máximo de ${limiteTotalUsuarios} usuario(s) en total (incluyéndote a vos). Mejorá tu suscripción para agregar más miembros al equipo.` 
    };
  }

  return { superado: false };
};