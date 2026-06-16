import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nombre: string;
  email: string;
  plan?: string; // 🔥 Agregamos el plan por las dudas
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  
  // 🔥 ESTADOS GLOBALES PARA EL MODAL DE UPGRADE
  showUpgradeModal: boolean;
  upgradeMessage: string;
  
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setShowUpgradeModal: (show: boolean, message?: string) => void; // 🔥 FUNCIÓN PARA ABRIR/CERRAR
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      showUpgradeModal: false,
      upgradeMessage: "",
      
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setShowUpgradeModal: (show, message = "") => set({ showUpgradeModal: show, upgradeMessage: message }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'auth-storage', 
    }
  )
);