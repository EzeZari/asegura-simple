import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Nos aseguramos de sacar el token correcto (algunos stores usan "token", otros "accessToken")
  const token = useAuthStore.getState().token || (useAuthStore.getState() as any).accessToken;

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
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
};