import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nombre: string;
  email: string;
  plan?: string;
  role: string;
  jefeId?: number; 
  suscripcion?: {
    estado: string;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  
  showUpgradeModal: boolean;
  upgradeMessage: string;
  
  sessionExpired: boolean;
  
  // 🔥 SEMÁFORO PARA LOS TOURS
  puedeMostrarTour: boolean; 
  
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setShowUpgradeModal: (show: boolean, message?: string) => void;
  setSessionExpired: (status: boolean) => void; 
  setPuedeMostrarTour: (puede: boolean) => void; // 🔥 SETTER DEL SEMÁFORO
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      showUpgradeModal: false,
      upgradeMessage: "",
      sessionExpired: false, 
      puedeMostrarTour: false, // 🔥 INICIALIZAMOS EL SEMÁFORO
      
      setUser: (user) => {
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
        
      setSessionExpired: (status) => set({ sessionExpired: status }), 
      
      setPuedeMostrarTour: (puede) => set({ puedeMostrarTour: puede }), // 🔥 IMPLEMENTACIÓN
        
      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = "next_auth_token=; path=/; max-age=0; secure; samesite=strict";
        }
        set({ user: null, accessToken: null, sessionExpired: false, puedeMostrarTour: false });
      },
    }),
    {
      name: 'auth-storage', 
    }
  )
);