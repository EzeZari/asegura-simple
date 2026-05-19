"use client";

import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Traemos la función de tu store que guarda los datos del usuario
  const setUser = useAuthStore((state: any) => state.setUser); 

  useEffect(() => {
    // Cuando la página carga (o se presiona F5), le preguntamos al backend por nuestra sesión
    const rehidratarSesion = async () => {
      try {
        // Usamos la ruta refresh (o la que uses para validar) mandando las cookies
        const res = await fetch("http://localhost:3001/api/auth/refresh", {
          method: "POST",
          credentials: "include", 
        });

        if (res.ok) {
          const data = await res.json();
          // Si el token es válido, guardamos los datos (como el nombre) de nuevo en la memoria
          setUser(data.user || data); 
        }
      } catch (error) {
        console.error("Error al rehidratar sesión:", error);
      }
    };

    rehidratarSesion();
  }, [setUser]);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* La barra lateral ahora pertenece solo al grupo privado (dashboard) */}
      <Sidebar />
      
      {/* ml-64 empuja el contenido hacia la derecha para que no se superponga */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}