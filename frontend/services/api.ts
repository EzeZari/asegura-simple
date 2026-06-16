import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 🔥 EL ÚNICO CAMBIO: Le pedimos a TypeScript solo el "accessToken", que es el que existe.
  const token = useAuthStore.getState().accessToken;

  // 1. Preparamos los headers base
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // 2. Inteligencia para archivos vs JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else {
    delete headers['Content-Type'];
  }

  // 3. Ejecutamos el fetch SIN la propiedad credentials para evitar el choque de CORS
  return fetch(`${API_URL || ''}${endpoint}`, {
    ...options,
    headers,
  });
};