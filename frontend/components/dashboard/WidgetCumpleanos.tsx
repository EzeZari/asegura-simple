"use client";

import { useState, useEffect } from "react";
import { Cake, MessageCircle, ChevronUp, ChevronDown, X } from "lucide-react";
import { generarLinkWhatsApp } from "@/utils/whatsapp";

interface Cumpleanero {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
}

interface Props {
  cumpleanerosDelDia: Cumpleanero[];
  plantillaMensaje: string;
}

export default function WidgetCumpleanos({ cumpleanerosDelDia, plantillaMensaje }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Verificamos si el usuario ya cerró el cartel el día de hoy
  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0]; // Ej: "2026-11-06"
    const fechaCerrado = localStorage.getItem("asegurasimple_cumple_cerrado");
    
    if (fechaCerrado === hoy) {
      setIsVisible(false);
    }
  }, []);

  const handleCerrar = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const hoy = new Date().toISOString().split("T")[0];
    localStorage.setItem("asegurasimple_cumple_cerrado", hoy);
    setIsVisible(false);
  };

  if (!isVisible || !cumpleanerosDelDia || cumpleanerosDelDia.length === 0) {
    return null; 
  }

  const enviarSaludo = (cliente: Cumpleanero) => {
    const mockPoliza = {
      asegurado: cliente,
      compania: { nombre: "" },
      nroPoliza: "",
      tipoPoliza: ""
    };
    
    const url = generarLinkWhatsApp(mockPoliza, plantillaMensaje);
    window.open(url, '_blank');
  };

  return (
    // 🔥 EL CAMBIO ESTÁ ACÁ:
    // Volvemos a "fixed" para que no ocupe espacio abajo.
    // Usamos "right-20" o "right-[5rem]" para que se posicione a la derecha,
    // pero esquivando tu botón flotante de chat que suele estar en "right-4" o "right-6".
    <div className="fixed bottom-6 right-20 md:right-24 z-50 animate-in slide-in-from-bottom-5 duration-500 w-fit">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-pink-100 dark:border-pink-900/30 overflow-hidden transition-all w-80">
        
        {/* Cabecera del Widget */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-3 flex items-center justify-between cursor-pointer border-b border-pink-100 dark:border-pink-900/30"
        >
          <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-sm">
            <Cake size={18} className="animate-bounce" /> 
            ¡Cumpleaños Hoy! ({cumpleanerosDelDia.length})
          </div>
          
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
            <button 
              onClick={handleCerrar}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Cerrar por hoy"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Lista de Cumpleañeros */}
        {isExpanded && (
          <div className="max-h-60 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 p-2">
            <div className="flex flex-col gap-1">
              {cumpleanerosDelDia.map(cliente => (
                <div key={cliente.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">
                    {cliente.nombre} {cliente.apellido}
                  </span>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); enviarSaludo(cliente); }}
                    disabled={!cliente.telefono}
                    className={`shrink-0 p-2 rounded-lg transition-colors ${!cliente.telefono ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100 group-hover:scale-105'}`}
                    title={!cliente.telefono ? "El cliente no tiene teléfono cargado" : "Enviar saludo"}
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}