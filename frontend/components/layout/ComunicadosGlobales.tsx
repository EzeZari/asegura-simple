"use client";

import { useEffect, useState } from "react";
import { 
  Megaphone, 
  Rocket, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  DollarSign, 
  PieChart, 
  Mail, 
  AlertTriangle 
} from "lucide-react";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function ComunicadosGlobales() {
  const user = useAuthStore((state: any) => state.user);
  const setPuedeMostrarTour = useAuthStore((state: any) => state.setPuedeMostrarTour);
  
  const [comunicado, setComunicado] = useState<any>(null);
  const [showModalAnnouncement, setShowModalAnnouncement] = useState(false);
  
  const [avisoKey, setAvisoKey] = useState<string>("");

  useEffect(() => {
    const fetchComunicados = async () => {
      try {
        const resCom = await apiFetch(`/api/dashboard/comunicado`);
        if (resCom.ok) {
          const dataCom = await resCom.json();
          if (dataCom) {
            setComunicado(dataCom);
            
            if (dataCom.activoModal && dataCom.mensajeModal && user?.id) {
              const keyUnica = dataCom.mensajeModal.replace(/\s+/g, '');
              setAvisoKey(keyUnica);

              const modalLeido = localStorage.getItem(`modal_leido_${user.id}`);
              
              if (modalLeido !== keyUnica) {
                setShowModalAnnouncement(true);
                setPuedeMostrarTour(false); 
              } else {
                setPuedeMostrarTour(true);
              }
            } else {
              setPuedeMostrarTour(true);
            }
          } else {
            setPuedeMostrarTour(true); 
          }
        } else {
          setPuedeMostrarTour(true); 
        }
      } catch (error) {
        console.error("Error cargando comunicados:", error);
        setPuedeMostrarTour(true); 
      }
    };

    if (user?.id) {
      fetchComunicados();
    }
  }, [user?.id, setPuedeMostrarTour]);

  const handleDismissModal = () => {
    if (user?.id && avisoKey) {
      localStorage.setItem(`modal_leido_${user.id}`, avisoKey);
    }
    setShowModalAnnouncement(false);
    
    setTimeout(() => {
      setPuedeMostrarTour(true);
    }, 500); 
  };

  const getBannerColor = (tipo: string) => {
    switch(tipo) {
      case 'red': return 'bg-red-600';
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };

  // 🔥 Función para reemplazar etiquetas por iconos de Lucide (Solo recibe strings)
  const renderTextWithIcons = (text: string) => {
    if (!text || typeof text !== 'string') return text;

    const regex = /\[icon:([a-zA-Z0-9_-]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const iconName = match[1];
      let IconComponent = null;

      switch (iconName) {
        case "rocket":
          IconComponent = <Rocket className="inline-block w-6 h-6 text-blue-500 mr-1.5 -mt-1" />;
          break;
        case "sparkles":
          IconComponent = <Sparkles className="inline-block w-5 h-5 text-amber-500 mr-1.5 -mt-1" />;
          break;
        case "check":
          IconComponent = <CheckCircle2 className="inline-block w-5 h-5 text-green-500 mr-1.5 -mt-0.5" />;
          break;
        case "tip":
          IconComponent = <Lightbulb className="inline-block w-5 h-5 text-yellow-500 mr-1.5 -mt-1" />;
          break;
        case "money":
          IconComponent = <DollarSign className="inline-block w-5 h-5 text-emerald-500 mr-1.5 -mt-1" />;
          break;
        case "chart":
          IconComponent = <PieChart className="inline-block w-5 h-5 text-indigo-500 mr-1.5 -mt-1" />;
          break;
        case "mail":
          IconComponent = <Mail className="inline-block w-5 h-5 text-purple-500 mr-1.5 -mt-1" />;
          break;
        case "alert":
          IconComponent = <AlertTriangle className="inline-block w-5 h-5 text-red-500 mr-1.5 -mt-1" />;
          break;
        default:
          parts.push(match[0]);
          break;
      }

      if (IconComponent) {
        parts.push(<span key={match.index}>{IconComponent}</span>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // 🔥 FIX: Función puente que procesa primero negritas y después inyecta los iconos de forma segura
  const procesarTextoCompleto = (texto: string) => {
    if (!texto) return null;
    const partes = texto.split(/(\*\*.*?\*\*)/g);
    
    return partes.map((parte, i) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return (
          <strong key={i} className="font-black text-gray-900 dark:text-white transition-colors">
            {renderTextWithIcons(parte.slice(2, -2))}
          </strong>
        );
      }
      return <span key={i}>{renderTextWithIcons(parte)}</span>;
    });
  };

  // Renderizador principal del layout
  const renderMensajeFormateado = (textoRaw: string) => {
    if (!textoRaw) return null;
    return textoRaw.split('\n').map((linea, index) => {
      if (linea.startsWith('# ')) {
        return (
          <h2 key={index} className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mt-6 mb-3 transition-colors first:mt-0 flex items-center">
            {procesarTextoCompleto(linea.replace('# ', ''))}
          </h2>
        );
      }
      if (linea.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-5 mb-2 transition-colors flex items-center">
            {procesarTextoCompleto(linea.replace('## ', ''))}
          </h3>
        );
      }
      if (linea.startsWith('- ') || linea.startsWith('* ')) {
        return (
          <li key={index} className="ml-5 list-disc text-gray-700 dark:text-gray-300 mb-1.5 transition-colors">
            {procesarTextoCompleto(linea.replace(/^[-*]\s*/, ''))}
          </li>
        );
      }
      if (linea.trim() === '') return <div key={index} className="h-3"></div>;
      
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 leading-relaxed transition-colors">
          {procesarTextoCompleto(linea)}
        </p>
      );
    });
  };

  if (!comunicado) return null;

  return (
    <>
      {comunicado.activoBanner && comunicado.mensajeBanner && (
        <div className={`${getBannerColor(comunicado.tipoBanner)} text-white px-4 py-3 text-center text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2`}>
          {procesarTextoCompleto(comunicado.mensajeBanner)}
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
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6 text-center transition-colors">Aviso Importante</h3>
              </div>
              <div className="w-full bg-gray-50/80 dark:bg-gray-900/50 p-5 md:p-7 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-6 overflow-y-auto custom-scrollbar transition-colors">
                <div className="text-left">{renderMensajeFormateado(comunicado.mensajeModal)}</div>
              </div>
              <button onClick={handleDismissModal} className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all shrink-0 ${getBannerColor(comunicado.tipoModal)} hover:opacity-90 active:scale-[0.98]`}>
                ¡Entendido, gracias!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}