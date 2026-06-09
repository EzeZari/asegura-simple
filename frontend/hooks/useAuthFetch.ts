import { useAuthStore } from "@/store/authStore";

export const useAuthFetch = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const authFetch = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
      credentials: 'include',
    });
  };

  return { authFetch };
};