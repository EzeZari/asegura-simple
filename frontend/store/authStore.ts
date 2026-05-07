import { create } from 'zustand';

// Definimos qué datos tiene nuestro usuario
interface User {
  id: number;
  nombre: string;
  email: string;
  role: string;
}

// Definimos qué acciones puede hacer nuestra memoria
interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

// Creamos el estado global
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Arranca vacío porque al entrar a la web no sabemos quién es
  setUser: (user) => set({ user }), // Guarda los datos del usuario
  logout: () => set({ user: null }), // Borra los datos al salir
}));