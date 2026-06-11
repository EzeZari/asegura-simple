import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 🔥 IMPORTAMOS PERSIST

interface User {
  id: number;
  nombre: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  // 🔥 ENVOLVEMOS TODO EN PERSIST PARA QUE SOBREVIVA AL F5
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth-storage', // Nombre con el que se guarda en el navegador
    }
  )
);