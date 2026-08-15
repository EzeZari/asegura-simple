"use client";

import { useRouter } from "next/navigation";
import { Crown, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function UpgradeModal() {
  const router = useRouter();
  
  const { showUpgradeModal, upgradeMessage, setShowUpgradeModal, user } = useAuthStore();

  if (!showUpgradeModal) return null;

  const handleUpgrade = () => {
    setShowUpgradeModal(false, "");
    router.push(`/planes?email=${user?.email || ""}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* 🔥 Adaptado: bg-white -> dark:bg-gray-800 */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-transparent dark:border-gray-700">
        
        <button
          onClick={() => setShowUpgradeModal(false, "")}
          // 🔥 Botón cerrar adaptado
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors z-10 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-1.5"
        >
          <X size={18} />
        </button>

        <div className="p-8 flex flex-col items-center text-center gap-3">
          {/* 🔥 Ícono de la corona: ajustamos los tonos del fondo degradado en modo oscuro */}
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 dark:from-amber-900/40 to-orange-100 dark:to-orange-900/40 text-orange-600 dark:text-orange-500 rounded-full flex items-center justify-center mb-3 shadow-inner transition-colors">
            <Crown size={32} />
          </div>

          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
            Mejorá tu plan
          </h3>

          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed px-2 transition-colors">
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
              className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}