"use client";

import { useAuthStore } from "@/store/authStore";
import { Zap, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TrialBanner() {
  const user = useAuthStore((state: any) => state.user);
  const [mounted, setMounted] = useState(false);

  // Evitamos problemas de hidratación en Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no cargó, no hay usuario, o NO es plan gratuito, no mostramos nada
  if (!mounted || !user || user.plan !== "GRATUITO") return null;

  // Calculamos los días de prueba restantes (asumiendo 14 días de prueba)
  const fechaCreacion = new Date(user.createdAt);
  const hoy = new Date();
  const diasTranscurridos = Math.floor((hoy.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
  const diasRestantes = Math.max(0, 14 - diasTranscurridos);

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 text-white px-4 py-2.5 sm:py-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm shadow-md relative z-50 transition-all">
      <div className="flex items-center gap-2 text-center">
        <Clock size={16} className="text-blue-200 animate-pulse shrink-0" />
        <span>
          Estás usando la versión de prueba. Te quedan <strong className="text-amber-300">{diasRestantes} días</strong> de acceso completo.
        </span>
      </div>
      
      <Link
        href={`/planes?email=${user.email}`}
        className="flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-blue-50 px-4 py-1.5 sm:py-1 rounded-full font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
      >
        <Zap size={14} className="text-amber-500 fill-amber-500" />
        Elegir un plan
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}