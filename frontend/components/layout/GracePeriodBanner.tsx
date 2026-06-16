"use client";

import { AlertTriangle, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function GracePeriodBanner() {
  const router = useRouter();
  
  // Le pedimos al store el usuario
  const user = useAuthStore((state: any) => state.user);

  if (!user) return null;

  // 🔥 SOLUCIÓN: Le decimos a TypeScript que trate a user como "any" temporalmente 
  // para que no se queje de la nueva propiedad "suscripcion"
  const userData = user as any;

  if (userData.plan === "GRATUITO" || !userData.suscripcion) return null;

  const { estado, fechaVencimiento } = userData.suscripcion;

  if (estado === "autorizado") return null;

  const fechaVence = fechaVencimiento ? new Date(fechaVencimiento) : new Date();
  const fechaLimiteGracia = new Date(fechaVence);
  fechaLimiteGracia.setDate(fechaLimiteGracia.getDate() + 3);

  const hoy = new Date();

  if (hoy > fechaLimiteGracia) return null;

  const formatoFecha = fechaLimiteGracia.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 text-center sm:text-left">
        <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
          <AlertTriangle size={18} className="animate-pulse" />
        </div>
        <p className="text-sm font-semibold tracking-wide">
          Atención: Hubo un inconveniente con la renovación de tu plan. 
          Tenés tiempo hasta el <span className="underline font-black">{formatoFecha}</span> para regularizarlo.
        </p>
      </div>
      
      <button
        onClick={() => router.push("/planes?email=" + userData.email)}
        className="bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
      >
        <CreditCard size={14} />
        Actualizar Tarjeta
      </button>
    </div>
  );
}