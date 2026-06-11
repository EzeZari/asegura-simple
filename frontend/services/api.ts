import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const accessToken = useAuthStore.getState().accessToken;

  // 1. Preparamos los headers base
  const headers: any = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  // 2. 🔥 EL ARREGLO MÁGICO: Solo forzamos que sea JSON si NO estamos enviando un archivo (FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else {
    // Si es un archivo, borramos el Content-Type por si venía forzado
    // El navegador automáticamente le va a poner "multipart/form-data" y calculará los límites
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
};