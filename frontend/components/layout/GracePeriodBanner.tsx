"use client";

import { AlertTriangle, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function GracePeriodBanner() {
  const router = useRouter();
  
  const user = useAuthStore((state: any) => state.user);

  if (!user) return null;

  const userData = user as any;

  if (userData.plan === "GRATUITO" || !userData.suscripcion) return null;

  const { estado, fechaVencimiento } = userData.suscripcion;

  // 🔥 MAGIA ACÁ: Verificamos si tiene tiempo a favor matemáticamente
  const hoyTime = new Date().getTime();
  const vencimientoTime = fechaVencimiento ? new Date(fechaVencimiento).getTime() : 0;
  const tieneTiempoAFavor = vencimientoTime > hoyTime;

  // Si está autorizado en MP O tiene tiempo a favor por pago manual, ocultamos el cartel
  if (estado === "autorizado" || tieneTiempoAFavor) return null;

  const fechaVence = fechaVencimiento ? new Date(fechaVencimiento) : new Date();
  const fechaLimiteGracia = new Date(fechaVence);
  fechaLimiteGracia.setDate(fechaLimiteGracia.getDate() + 3);

  const hoy = new Date();

  // Si ya pasó el período de gracia, se oculta el banner (porque seguramente actúa el bloqueo de pantalla completa)
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
        onClick={() => router.push("/configuracion")}
        className="bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
      >
        <CreditCard size={14} />
        Gestionar Pago
      </button>
    </div>
  );
}