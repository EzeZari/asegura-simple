import { prisma } from '../config/db';

const LIMITES_ASEGURADOS = {
  GRATUITO: 10,
  BASICO: 100,
  PROFESIONAL: 300,
  AGENCIA: Infinity // Sin límite
};

export const verificarLimiteAsegurados = async (userId: number): Promise<{ superado: boolean; mensaje?: string }> => {
  // 1. Buscamos el plan actual del usuario
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, email: true } 
  });

  if (!usuario) {
    return { superado: true, mensaje: "Usuario no encontrado." };
  }

  // 2. Contamos cuántos asegurados tiene cargados actualmente
  const cantidadActual = await prisma.asegurado.count({
    where: { 
      productor: {
        email: usuario.email 
      }
    }
  });

  // Le avisamos a TypeScript que usuario.plan es una llave válida de nuestro objeto
  const limiteMaximo = LIMITES_ASEGURADOS[usuario.plan as keyof typeof LIMITES_ASEGURADOS];

  if (cantidadActual >= limiteMaximo) {
    return {
      superado: true,
      mensaje: `Alcanzaste el límite de ${limiteMaximo} asegurados para el ${usuario.plan}. Mejorá tu plan para seguir cargando clientes.`
    };
  }

  return { superado: false };
};