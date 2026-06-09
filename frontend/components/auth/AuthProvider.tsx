"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken); // ← NUEVO
  const user = useAuthStore((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok && data.user) {
          setUser(data.user);
          setAccessToken(data.accessToken); // ← NUEVO
        }
      } catch (error) {
        console.error("Error al restaurar la sesión:", error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!user) {
      checkSession();
    } else {
      setIsChecking(false);
    }
  }, [user, setUser, setAccessToken]);

  if (isChecking) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-green-700 font-medium">Cargando AseguraSimple...</div>
      </div>
    );
  }

  return <>{children}</>;
}