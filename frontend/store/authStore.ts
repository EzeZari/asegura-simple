import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nombre: string;
  email: string;
  plan?: string;
  role: string;
  jefeId?: number; // 🔥 ACÁ ESTÁ LA PIEZA FALTANTE
  suscripcion?: {
    estado: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  
  // Estados globales para el modal de upgrade
  showUpgradeModal: boolean;
  upgradeMessage: string;
  
  // 🔥 NUEVO ESTADO PARA LA SESIÓN EXPIRADA
  sessionExpired: boolean;
  
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setShowUpgradeModal: (show: boolean, message?: string) => void;
  setSessionExpired: (status: boolean) => void; // 🔥 NUEVO SETTER
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      showUpgradeModal: false,
      upgradeMessage: "",
      sessionExpired: false, // 🔥 ESTADO INICIAL
      
      setUser: (user) => {
        // 🔥 LOGICA DE FORZADO: Si sos vos, siempre sos AGENCIA y AUTORIZADO
        const esAdmin = user.email === 'churrospop.funes@hotmail.com';
        
        const userProcesado = esAdmin ? {
          ...user,
          plan: 'AGENCIA',
          suscripcion: { ...user.suscripcion, estado: 'autorizado' }
        } : user;

        set({ user: userProcesado });
      },

      setAccessToken: (token) => set({ accessToken: token }),
      
      setShowUpgradeModal: (show, message = "") => 
        set({ showUpgradeModal: show, upgradeMessage: message }),
        
      setSessionExpired: (status) => set({ sessionExpired: status }), // 🔥 IMPLEMENTACIÓN
        
      // 🔥 ACÁ ESTÁ EL LOGOUT ARREGLADO CON LA DESTRUCCIÓN DE LA COOKIE
      logout: () => {
        if (typeof document !== 'undefined') {
          // Destruimos la cookie poniendo su tiempo de vida (max-age) en 0
          document.cookie = "next_auth_token=; path=/; max-age=0; secure; samesite=strict";
        }
        set({ user: null, accessToken: null, sessionExpired: false });
      },
    }),
    {
      name: 'auth-storage', 
    }
  )
);