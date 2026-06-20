// backend/src/utils/verificarLimites.ts
import { prisma } from '../config/db';

const LIMITES_ASEGURADOS = {
  GRATUITO: 10,
  BASICO: 100,
  PROFESIONAL: 300,
  AGENCIA: Infinity // Sin límite
};

// 🔥 AHORA RECIBE UN SEGUNDO PARÁMETRO: cantidadAInsertar (por defecto es 1 para los modales simples)
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
  const limiteMaximo = LIMITES_ASEGURADOS[planActual as keyof typeof LIMITES_ASEGURADOS] || 10;

  // 🔥 ACÁ ESTÁ LA MAGIA: Sumamos lo que tenés + lo que querés meter
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