import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 🔥 Ahora apuntamos directamente a "accessToken" como manda tu store
  const token = useAuthStore.getState().accessToken;

  // 1. Preparamos los headers base
  const headers: any = {
    ...options.headers,
  };

  // 2. Si no estamos mandando FormData, le agregamos el Content-Type JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // 3. Si tenemos token, lo inyectamos
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. Hacemos la petición real usando la URL de tu backend
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 5. Si el token expiró (401), cerramos sesión automáticamente
  if (response.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return response;
};