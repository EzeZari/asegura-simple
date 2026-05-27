"use client";

import { useState, useEffect } from "react";
import { X, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/asegurados/${asegurado.id}/polizas`)
        .then((res) => res.json())
        .then((data) => setPolizas(data))
        .catch((err) => console.error("Error cargando pólizas", err))
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

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Próxima a Vencer": return "bg-orange-100 text-orange-800 border border-orange-200";
      case "Pendiente de Pago": return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Vencida": 
      case "Anulada": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Encabezado fijo */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Pólizas de {asegurado.nombre} {asegurado.apellido || ""}
            </h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              DNI/CUIT: <span className="font-mono">{asegurado.dni}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Lista escroleable */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Buscando pólizas...</div>
          ) : polizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <AlertCircle size={40} className="mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">Este cliente no tiene pólizas registradas.</p>
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-400 hover:shadow-lg transition-all gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-green-50 text-green-700 p-3 rounded-xl shrink-0 mt-1 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <FileText size={22} />
                      </div>
                      <div>
                        {/* Fila 1: Rama y Nro */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg leading-none">{poliza.tipoPoliza}</span>
                          <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">#{poliza.nroPoliza}</span>
                        </div>
                        
                        {/* Fila 2: Compañía y Cobertura */}
                        <div className="text-sm text-gray-600 mt-1.5">
                          <span className="font-semibold text-gray-800">{poliza.compania?.nombre || "Sin Compañía"}</span> 
                          {poliza.cobertura && <span className="text-gray-400"> • {poliza.cobertura}</span>}
                        </div>

                        {/* 🔥 FILA 3: DATOS ESPECÍFICOS DEL RIESGO (Nueva) */}
                        {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (poliza.patente || poliza.marca || poliza.modelo) && (
                          <div className="flex items-center gap-2 mt-2">
                            {poliza.patente && (
                              <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-mono font-bold uppercase text-gray-800 text-xs tracking-wider">
                                {poliza.patente}
                              </span>
                            )}
                            <span className="text-sm text-gray-600 font-medium">{poliza.marca} {poliza.modelo}</span>
                          </div>
                        )}

                        {(poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral de Comercio") && poliza.ubicacionRiesgo && (
                          <div className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                            <span className="text-gray-400">📍</span> <span>{poliza.ubicacionRiesgo}</span>
                          </div>
                        )}

                        {poliza.tipoPoliza === "ART" && poliza.cantidadEmpleados && (
                          <div className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                            <span className="text-gray-400">👥</span> <span>{poliza.cantidadEmpleados} Empleados declarados</span>
                          </div>
                        )}

                        {/* Fila 4: Vencimiento */}
                        <div className="text-xs text-gray-400 mt-3 flex items-center gap-1.5 font-medium">
                          Vence el {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center sm:justify-end shrink-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getEstadoBadge(estadoActual)}`}>
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