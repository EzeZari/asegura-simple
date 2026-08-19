"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, CheckCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";

export default function PolizaSiniestros({ polizaId }: { polizaId: number }) {
  const router = useRouter();
  const [siniestros, setSiniestros] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiniestrosVinculados = async () => {
      try {
        const res = await apiFetch('/api/siniestros');
        if (res.ok) {
          const data = await res.json();
          // Filtramos solo los siniestros que pertenecen a esta póliza
          const vinculados = data.filter((s: any) => s.polizaId === polizaId);
          setSiniestros(vinculados);
        }
      } catch (error) {
        console.error("Error cargando siniestros vinculados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (polizaId) fetchSiniestrosVinculados();
  }, [polizaId]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit"><Clock size={10}/> Pendiente</span>;
      case "En Análisis": return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit"><AlertTriangle size={10}/> En Análisis</span>;
      case "Aprobado": return <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit"><CheckCircle size={10}/> Aprobado</span>;
      case "Pagado": return <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit"><CheckCircle size={10}/> Pagado</span>;
      case "Rechazado": return <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-md text-[10px] font-bold w-fit">Rechazado</span>;
      default: return <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-md text-[10px] font-bold w-fit">{estado}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors animate-pulse">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-4">Cargando historial de siniestros...</h3>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors flex flex-col gap-4">
      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-gray-700 pb-3 transition-colors">
        <ShieldAlert size={20} className="text-red-500 dark:text-red-400" /> Historial de Siniestros
      </h3>

      {siniestros.length === 0 ? (
        <div className="bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center transition-colors">
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">No se han registrado siniestros en esta póliza.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {siniestros.map((sin) => (
            <div key={sin.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-red-200 dark:hover:border-red-900/50 transition-colors group">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Expediente #{sin.nroSiniestro}</span>
                  {getStatusBadge(sin.estadoSiniestro)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ocurrido el {new Date(sin.fechaHecho).toLocaleDateString("es-AR")}
                </span>
              </div>
              
              <button 
                onClick={() => router.push(`/siniestros/${sin.id}`)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg shadow-sm transition-colors group-hover:scale-105"
                title="Ver detalle del siniestro"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}