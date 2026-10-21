"use client";

import { Download, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import AlertModal from "@/components/ui/AlertModal";

interface ExportButtonProps {
  onExport: () => void;
  datosVacios: boolean;
  className?: string; // Por si querés cambiarle el tamaño o el margen desde la pantalla
}

export default function ExportButton({ onExport, datosVacios, className = "" }: ExportButtonProps) {
  const { user } = useAuthStore();
  const esPlanGratuito = user?.plan === "GRATUITO";

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleClick = () => {
    if (esPlanGratuito) {
      setIsAlertOpen(true);
      return;
    }

    if (datosVacios) {
      alert("No hay datos para exportar.");
      return;
    }

    onExport();
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        className={`flex justify-center items-center gap-2 w-full sm:w-auto px-4 py-2.5 lg:py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${className} ${
          esPlanGratuito 
            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-80" 
            : "bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 active:scale-95"
        }`}
        title={esPlanGratuito ? "Disponible a partir del Plan Básico" : "Exportar a Excel"}
      >
        {esPlanGratuito ? <Lock size={16} /> : <Download size={16} />} 
        Exportar a Excel
      </button>

      {/* El modal de alerta vive ACÁ ADENTRO, así no tenés que agregarlo en todas tus pantallas */}
      <AlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
        title="Función Premium" 
        message="La exportación de datos a Excel está disponible a partir del Plan Básico. Mejorá tu suscripción para acceder a reportes ilimitados." 
      />
    </>
  );
}