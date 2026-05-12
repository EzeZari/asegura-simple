"use client";

import { useState, useEffect } from "react";
import { X, FileText, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  asegurado: any;
}

export default function PolizasDelAseguradoModal({ isOpen, onClose, asegurado }: Props) {
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && asegurado) {
      setIsLoading(true);
      fetch(`http://localhost:3001/api/asegurados/${asegurado.id}/polizas`)
        .then((res) => res.json())
        .then((data) => setPolizas(data))
        .catch((err) => console.error("Error cargando pólizas", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, asegurado]);

  if (!isOpen || !asegurado) return null;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada": return "bg-emerald-100 text-emerald-800";
      case "Pendiente de Pago": return "bg-amber-100 text-amber-800";
      case "Anulada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Buscando pólizas...</div>
          ) : polizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <AlertCircle size={40} className="mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">Este cliente no tiene pólizas registradas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {polizas.map((poliza) => (
                <div key={poliza.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-sm transition-all gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-50 text-green-700 p-2.5 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{poliza.tipoPoliza}</span>
                        <span className="font-mono text-xs text-gray-500">#{poliza.nroPoliza}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {poliza.compania?.nombre || "Compañía no asignada"} • {poliza.cobertura || "Sin detalle"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Vence: {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:justify-end">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(poliza.estado)}`}>
                      {poliza.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}