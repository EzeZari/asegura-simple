"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function ComunicadosGlobales() {
  const user = useAuthStore((state: any) => state.user);
  
  const [comunicado, setComunicado] = useState<any>(null);
  const [showModalAnnouncement, setShowModalAnnouncement] = useState(false);

  useEffect(() => {
    const fetchComunicados = async () => {
      try {
        const resCom = await apiFetch(`/api/dashboard/comunicado`);
        if (resCom.ok) {
          const dataCom = await resCom.json();
          if (dataCom) {
            setComunicado(dataCom);
            
            if (dataCom.activoModal && dataCom.mensajeModal && user?.id) {
              const modalLeido = localStorage.getItem(`modal_leido_${user.id}`);
              if (modalLeido !== dataCom.mensajeModal) {
                setShowModalAnnouncement(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error cargando comunicados:", error);
      }
    };

    if (user?.id) {
      fetchComunicados();
    }
  }, [user?.id]);

  const handleDismissModal = () => {
    if (user?.id && comunicado?.mensajeModal) {
      localStorage.setItem(`modal_leido_${user.id}`, comunicado.mensajeModal);
    }
    setShowModalAnnouncement(false);
  };

  const getBannerColor = (tipo: string) => {
    switch(tipo) {
      case 'red': return 'bg-red-600';
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };

  // 🔥 1. FUNCIÓN PARA PARSEAR NEGRITAS (**texto**)
  const parsearNegritas = (texto: string) => {
    const partes = texto.split(/(\*\*.*?\*\*)/g);
    return partes.map((parte, i) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return (
          <strong key={i} className="font-black text-gray-900 dark:text-white transition-colors">
            {parte.slice(2, -2)}
          </strong>
        );
      }
      return parte;
    });
  };

  // 🔥 2. FUNCIÓN MAESTRA QUE LEE TUS REGLAS Y ARMA EL HTML
  const renderMensajeFormateado = (textoRaw: string) => {
    if (!textoRaw) return null;

    return textoRaw.split('\n').map((linea, index) => {
      
      // Regla: Título Principal (# Título)
      if (linea.startsWith('# ')) {
        return (
          <h2 key={index} className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-6 mb-3 transition-colors first:mt-0">
            {parsearNegritas(linea.replace('# ', ''))}
          </h2>
        );
      }
      
      // Regla: Subtítulo (## Subtítulo)
      if (linea.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-5 mb-2 transition-colors">
            {parsearNegritas(linea.replace('## ', ''))}
          </h3>
        );
      }
      
      // Regla: Item de lista (- ítem)
      if (linea.startsWith('- ')) {
        return (
          <li key={index} className="ml-5 list-disc text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
            {parsearNegritas(linea.replace('- ', ''))}
          </li>
        );
      }
      
      // Regla: Salto de línea si dejás el renglón vacío
      if (linea.trim() === '') {
        return <div key={index} className="h-3"></div>;
      }

      // Por defecto: Párrafo normal
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 leading-relaxed transition-colors">
          {parsearNegritas(linea)}
        </p>
      );
    });
  };

  if (!comunicado) return null;

  return (
    <>
      {comunicado.activoBanner && comunicado.mensajeBanner && (
        <div className={`${getBannerColor(comunicado.tipoBanner)} text-white px-4 py-3 text-center text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2`}>
          {comunicado.mensajeBanner}
        </div>
      )}

      {showModalAnnouncement && comunicado.activoModal && comunicado.mensajeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors flex flex-col max-h-[90vh]">
            <div className={`h-2 w-full shrink-0 ${getBannerColor(comunicado.tipoModal)}`}></div>
            
            <div className="p-6 md:p-8 flex flex-col flex-1 overflow-hidden">
              
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-14 h-14 rounded-full mb-4 flex items-center justify-center ${getBannerColor(comunicado.tipoModal)} text-white shadow-lg`}>
                  <Megaphone size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6 text-center transition-colors">
                  Aviso Importante
                </h3>
              </div>
              
              {/* 🔥 ACÁ INYECTAMOS TU TEXTO MÁGICO FORMATEADO */}
              <div className="w-full bg-gray-50/80 dark:bg-gray-900/50 p-5 md:p-7 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-6 overflow-y-auto custom-scrollbar transition-colors">
                <div className="text-left">
                  {renderMensajeFormateado(comunicado.mensajeModal)}
                </div>
              </div>

              <button 
                onClick={handleDismissModal}
                className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all shrink-0 ${getBannerColor(comunicado.tipoModal)} hover:opacity-90 active:scale-[0.98]`}
              >
                ¡Entendido, gracias!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}