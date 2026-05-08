"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  
  // Arranca en true para frenar la carga hasta saber si hay sesión
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    console.log("Datos recibidos del backend:", data); // <-- AGREGÁ ESTO PARA VER EN CONSOLA

    if (response.ok && data.user) {
      setUser(data.user);
    }
  } catch (error) {
    console.error("Error al restaurar la sesión:", error);
  } finally {
    setIsChecking(false);
  }
};

    // Solo chequeamos si el usuario en memoria está vacío (ej: apretaron F5)
    if (!user) {
      checkSession();
    } else {
      setIsChecking(false);
    }
  }, [user, setUser]);

  // Pantalla de carga minimalista mientras el backend responde (evita pestañeos blancos)
  if (isChecking) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-green-700 font-medium">Cargando AseguraSimple...</div>
      </div>
    );
  }

  // Si ya revisó, muestra la aplicación normal
  return <>{children}</>;
}