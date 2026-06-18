import { prisma } from '../config/db';

const LIMITES_ASEGURADOS = {
  GRATUITO: 10,
  BASICO: 100,
  PROFESIONAL: 300,
  AGENCIA: Infinity // Sin límite
};

export const verificarLimiteAsegurados = async (userId: number): Promise<{ superado: boolean; mensaje?: string }> => {
  // 1. Buscamos al usuario y nos fijamos si es DUEÑO o EMPLEADO
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, email: true, jefeId: true } // 🔥 Agregamos jefeId
  });

  if (!usuario) {
    return { superado: true, mensaje: "Usuario no encontrado." };
  }

  // 2. 🔥 EL TRUCO DE LA AGENCIA: Identificamos quién es el dueño real
  const idAgencia = usuario.jefeId ? usuario.jefeId : userId;

  // Buscamos los emails de toda la agencia (el dueño + todos sus vendedores)
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

  // 3. Contamos cuántos asegurados cargó TODA LA AGENCIA en conjunto
  const cantidadActual = await prisma.asegurado.count({
    where: { 
      productor: {
        email: { in: emailsAgencia } // 🔥 Cuenta los clientes de cualquier miembro del equipo
      }
    }
  });

  const planActual = usuario.plan || "GRATUITO";
  const limiteMaximo = LIMITES_ASEGURADOS[planActual as keyof typeof LIMITES_ASEGURADOS] || 10;

  if (cantidadActual >= limiteMaximo) {
    return {
      superado: true,
      mensaje: `Tu agencia alcanzó el límite de ${limiteMaximo} asegurados del plan ${planActual}. Mejorá tu suscripción para seguir creciendo.`
    };
  }

  return { superado: false };
};