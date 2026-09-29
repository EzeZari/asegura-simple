"use client";

import { useState } from "react";
import { Lightbulb, Lock, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/services/api";
import Toast from "@/components/ui/Toast";
import Link from "next/link";

export default function MejorasSettings() {
  const user = useAuthStore((state: any) => state.user);
  
  // 🔥 Leemos el plan directamente del estado global (ultra rápido)
  const planActual = user?.plan || "GRATUITO";
  const esGratis = planActual === "GRATUITO";

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await apiFetch("/api/sugerencias", {
        method: "POST",
        body: JSON.stringify({ titulo, descripcion })
      });

      const data = await res.json();

      if (res.ok) {
        setShowToast(true);
        setTitulo("");
        setDescripcion("");
      } else {
        setErrorMsg(data.error || "Ocurrió un error al enviar tu sugerencia.");
      }
    } catch (error) {
      setErrorMsg("Error de conexión al intentar comunicarse con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 🔥 MODO CANDADO PARA PLAN GRATUITO */}
      {esGratis ? (
        <div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm transition-colors min-h-[350px]">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full text-blue-600 dark:text-blue-400 mb-4 transition-colors">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 transition-colors">Función Exclusiva</h2>
          <p className="text-sm text-blue-800/80 dark:text-blue-300/80 mt-2 max-w-md mx-auto leading-relaxed transition-colors">
            El buzón de sugerencias directo con nuestro equipo de desarrollo está disponible únicamente para clientes con planes activos. ¡Mejorá tu plan para ayudarnos a construir el futuro de AseguraSimple!
          </p>
          <Link 
            href={`/planes?email=${user?.email}`}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm"
          >
            Mejorar mi Plan
          </Link>
        </div>
      ) : (
        
        /* 🔥 FORMULARIO PARA PLANES PAGOS */
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-colors">
          <div className="border-b border-gray-50 dark:border-gray-700 pb-3 mb-2 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
              <Lightbulb size={18} className="text-amber-500" />
              Sugerir una Mejora
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
              ¿Hay alguna función que te gustaría ver en la plataforma? Te leemos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                ¿De qué trata tu idea? (Título)
              </label>
              <input 
                type="text" 
                required
                maxLength={100}
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
                placeholder="Ej: Módulo para enviar cotizaciones en PDF"
                className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
                Desarrollá tu idea (Detalles)
              </label>
              <textarea 
                required
                rows={5} 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                placeholder="Me gustaría que cuando cargue los datos de un prospecto, el sistema me deje armar un PDF con los precios..." 
                className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 resize-none transition-colors text-sm"
              ></textarea>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm font-medium transition-colors">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting || !titulo.trim() || !descripcion.trim()}
                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Sugerencia"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Toast message="¡Gracias! Tu sugerencia fue enviada al equipo de desarrollo." isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}