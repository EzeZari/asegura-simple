// frontend/utils/roles.ts

// Diccionario de Roles
export const ROLES = {
  DUENO: 'DUENO',         
  PRODUCTOR: 'PRODUCTOR', // Admin Secundario
  VIEWER: 'VIEWER'        // Empleado (Solo Lectura)
};

// Diccionario de Permisos Centralizado
export const PERMISOS = {
  // 🔥 Este es el permiso maestro que habilita a crear, editar y borrar (Para Dueño y Admin Secundario)
  PUEDE_MODIFICAR_DATOS: [ROLES.DUENO, ROLES.PRODUCTOR],
  
  // Acciones muy sensibles que quedan exclusivas para el Dueño
  PUEDE_GESTIONAR_EQUIPO: [ROLES.DUENO], 
  PUEDE_EDITAR_PLAN: [ROLES.DUENO]
};

export const tienePermiso = (user: any, rolesPermitidos: string[]): boolean => {
  if (!user) return false;
  // Determinamos el rol real. Si no tiene jefeId, es el DUEÑO.
  const userRole = user.jefeId === null || user.jefeId === undefined ? ROLES.DUENO : user.role;
  return rolesPermitidos.includes(userRole);
};