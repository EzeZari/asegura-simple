"use client";

import { useRouter } from "next/navigation";
import { Crown, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function UpgradeModal() {
  const router = useRouter();
  
  // Vamos a leer estas variables de tu estado global (las agregaremos en el paso 2)
  const { showUpgradeModal, upgradeMessage, setShowUpgradeModal, user } = useAuthStore();

  if (!showUpgradeModal) return null;

  const handleUpgrade = () => {
    setShowUpgradeModal(false, "");
    // Lo mandamos a la pantalla de planes pasándole su email
    router.push(`/planes?email=${user?.email || ""}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Botón de cerrar (X) */}
        <button
          onClick={() => setShowUpgradeModal(false, "")}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <Crown size={32} />
          </div>

          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            Mejorá tu plan
          </h3>

          <p className="text-gray-500 font-medium text-sm leading-relaxed px-2">
            {upgradeMessage || "Llegaste al límite de tu plan actual o tu suscripción está inactiva. Pasate a un plan superior para seguir creciendo."}
          </p>

          <div className="w-full flex flex-col gap-2 mt-5">
            <button
              onClick={handleUpgrade}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md flex justify-center items-center gap-2"
            >
              Ver Planes y Mejorar
            </button>
            
            <button
              onClick={() => setShowUpgradeModal(false, "")}
              className="w-full text-gray-400 hover:text-gray-600 font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}