// frontend/utils/validaciones.ts

export const validarRequerido = (valor: any, nombreCampo: string): string => {
  if (!valor || String(valor).trim() === "") {
    return `El campo ${nombreCampo} es obligatorio.`;
  }
  return "";
};

export const validarDniCuit = (valor: string): string => {
  if (!valor || String(valor).trim() === "") return "El DNI/CUIT es obligatorio.";
  
  if (/[a-zA-Z]/.test(valor)) {
    return "El DNI/CUIT no puede contener letras.";
  }

  const limpio = valor.replace(/[^0-9]/g, ''); 
  
  if (limpio.length < 7 || limpio.length > 11) {
    return "El DNI/CUIT debe tener entre 7 y 11 números.";
  }
  
  return "";
};

// 🔥 AHORA TODAS ESTAS FUNCIONES ACEPTAN UN SEGUNDO PARÁMETRO (obligatorio)
export const validarEmail = (email: string, obligatorio: boolean = false): string => {
  if (!email || String(email).trim() === "") return obligatorio ? "El email es obligatorio." : "";
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "El formato del email no es válido.";
  }
  return "";
};

export const validarTelefono = (telefono: string, obligatorio: boolean = false): string => {
  if (!telefono || String(telefono).trim() === "") return obligatorio ? "El teléfono es obligatorio." : "";
  
  const regex = /^[0-9+\-\s()]{8,15}$/;
  if (!regex.test(telefono)) {
    return "El teléfono contiene caracteres inválidos.";
  }
  return "";
};

export const validarPatente = (patente: string, obligatorio: boolean = false): string => {
  if (!patente || String(patente).trim() === "") return obligatorio ? "La patente es obligatoria." : "";
  
  const regex = /^[a-zA-Z0-9\s]{6,9}$/;
  if (!regex.test(patente)) {
    return "El formato de la patente no es válido.";
  }
  return "";
};

export const validarFechaNacimiento = (fecha: string, obligatorio: boolean = false): string => {
  if (!fecha || String(fecha).trim() === "") return obligatorio ? "La fecha es obligatoria." : "";
  
  const fechaIngresada = new Date(fecha);
  const hoy = new Date();
  
  if (fechaIngresada > hoy) {
    return "La fecha no puede ser en el futuro.";
  }
  return "";
};

export const validarCodigoPostal = (cp: string, obligatorio: boolean = false): string => {
  if (!cp || String(cp).trim() === "") return obligatorio ? "El código postal es obligatorio." : "";
  
  const regex = /^[a-zA-Z0-9\s]{3,8}$/;
  if (!regex.test(cp)) {
    return "Código postal inválido.";
  }
  return "";
};