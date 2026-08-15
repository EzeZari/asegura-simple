"use client";

import { useState, useEffect } from "react";
import { X, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api"; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asegurado: any;
}

export default function PolizasDelAseguradoModal({ isOpen, onClose, asegurado }: Props) {
  const router = useRouter(); 
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && asegurado) {
      setIsLoading(true);
      apiFetch(`/api/asegurados/${asegurado.id}/polizas`)
        .then((res) => {
          if (!res.ok) throw new Error("Error al cargar");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setPolizas(data);
          } else {
            console.error("Formato inválido devuelto por el servidor", data);
            setPolizas([]);
          }
        })
        .catch((err) => {
          console.error("Error cargando pólizas", err);
          setPolizas([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, asegurado]);

  if (!isOpen || !asegurado) return null;

  const getEstadoInteligente = (poliza: any) => {
    if (poliza.estado === "Anulada" || poliza.estado === "Renovada") return poliza.estado;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); 
    const vencimiento = new Date(poliza.fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Vencida";
    if (diffDays <= 15) return "Próxima a Vencer"; 
    return poliza.estado; 
  };

  // 🔥 Badges adaptados al modo oscuro con /30 de opacidad en el fondo
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30";
      case "Próxima a Vencer": return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30";
      case "Pendiente de Pago": return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30";
      case "Vencida": 
      case "Anulada": return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/30";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh] border border-transparent dark:border-gray-700 transition-colors">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl transition-colors">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
              Pólizas de {asegurado.nombre} {asegurado.apellido || ""}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 transition-colors">
              DNI/CUIT: <span className="font-mono">{asegurado.dni}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30 dark:bg-gray-900/30 transition-colors custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 animate-pulse">Buscando pólizas...</div>
          ) : polizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
              <AlertCircle size={40} className="mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-medium text-gray-600 dark:text-gray-400">Este cliente no tiene pólizas registradas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {polizas.map((poliza) => {
                const estadoActual = getEstadoInteligente(poliza);
                return (
                  <div 
                    key={poliza.id} 
                    onClick={() => {
                      onClose(); 
                      router.push(`/polizas/${poliza.id}`); 
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg transition-all gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl shrink-0 mt-1 group-hover:bg-green-600 dark:group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <FileText size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-lg leading-none transition-colors">{poliza.tipoPoliza}</span>
                          <span className="font-mono text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-2 py-0.5 rounded-md border border-gray-100 dark:border-gray-700 transition-colors">#{poliza.nroPoliza}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 transition-colors">
                          <span className="font-semibold text-gray-800 dark:text-gray-300">{poliza.compania?.nombre || "Sin Compañía"}</span> 
                          {poliza.cobertura && <span className="text-gray-400 dark:text-gray-500"> • {poliza.cobertura}</span>}
                        </div>

                        {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (poliza.patente || poliza.marca || poliza.modelo) && (
                          <div className="flex items-center gap-2 mt-2">
                            {poliza.patente && (
                              <span className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded font-mono font-bold uppercase text-gray-800 dark:text-gray-200 text-xs tracking-wider transition-colors">
                                {poliza.patente}
                              </span>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">{poliza.marca} {poliza.modelo}</span>
                          </div>
                        )}

                        {(poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral de Comercio") && poliza.ubicacionRiesgo && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1.5 transition-colors">
                            <span className="text-gray-400 dark:text-gray-500">📍</span> <span>{poliza.ubicacionRiesgo}</span>
                          </div>
                        )}

                        {poliza.tipoPoliza === "ART" && poliza.cantidadEmpleados && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1.5 transition-colors">
                            <span className="text-gray-400 dark:text-gray-500">👥</span> <span>{poliza.cantidadEmpleados} Empleados declarados</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1.5 font-medium transition-colors">
                          Vence el {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:justify-end shrink-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-colors ${getEstadoBadge(estadoActual)}`}>
                        {estadoActual}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}