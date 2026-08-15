"use client";

import { useAuthStore } from "@/store/authStore";
import { AlertCircle, LogIn } from "lucide-react";

export default function SessionExpiredModal() {
  const { sessionExpired, logout } = useAuthStore();

  if (!sessionExpired) return null;

  const handleReLogin = () => {
    logout(); 
    window.location.href = "/login"; 
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      {/* 🔥 Adaptado: bg-white -> dark:bg-gray-800 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center animate-in zoom-in-95 duration-300 transition-colors border border-transparent dark:border-gray-700">
        
        {/* 🔥 Adaptado: Círculo de advertencia */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-6 transition-colors">
          <AlertCircle size={32} />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Tu sesión expiró</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">
          Por motivos de seguridad, cerramos tu sesión tras un período de inactividad. Por favor, volvé a ingresar.
        </p>

        <button 
          onClick={handleReLogin}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors"
        >
          <LogIn size={20} />
          Volver a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}