"use client";

import { useRouter } from "next/navigation";
import { Zap, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  mensaje?: string;
}

export default function UpgradeModal({ isVisible, onClose, mensaje }: Props) {
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Cabecera visual */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Zap size={100} />
          </div>
          <div className="bg-white/20 p-3 rounded-full mb-4 text-white backdrop-blur-md">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black text-white mb-1 relative z-10">¡Llegaste a tu límite!</h2>
          <p className="text-orange-100 text-xs font-medium relative z-10">
            Tu plan actual no permite realizar esta acción.
          </p>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-gray-600 text-center font-medium">
            {mensaje || "Para seguir creciendo y expandiendo tu cartera de clientes, necesitás mejorar tu plan."}
          </p>

          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">El Plan Básico incluye:</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
              <span>Hasta <strong>100 asegurados</strong> activos</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
              <span>Soporte prioritario</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button 
              onClick={() => router.push('/configuracion/planes')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
            >
              Ver Planes Disponibles <ArrowRight size={16} />
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-3 rounded-xl text-xs transition-colors border border-gray-100"
            >
              Cerrar por ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}