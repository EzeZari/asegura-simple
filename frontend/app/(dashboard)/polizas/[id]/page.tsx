"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, User, Building, 
  Calendar, Shield, AlertCircle, Edit 
} from "lucide-react";

export default function PolizaDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const [poliza, setPoliza] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/api/polizas/${id}`)
      .then(res => res.json())
      .then(data => {
        setPoliza(data);
        setIsLoading(false);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (isLoading) return <div className="p-8 text-gray-500">Cargando detalles...</div>;
  if (!poliza) return <div className="p-8 text-red-500">Póliza no encontrada.</div>;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Vigente": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "Anulada": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-amber-600 bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen">
      
      {/* Header con navegación */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Volver atrás
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-700 text-white rounded-xl shadow-sm">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Póliza #{poliza.nroPoliza}</h1>
              <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(poliza.estado)}`}>
                {poliza.estado}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all">
            <Edit size={18} /> Editar Datos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal: Datos de Cobertura */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-green-700" /> Detalle de Cobertura
            </h3>
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Rama / Riesgo</p>
                <p className="text-lg font-medium text-gray-800">{poliza.tipoPoliza}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Plan / Cobertura</p>
                <p className="text-lg font-medium text-gray-800">{poliza.cobertura || "No especificado"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Vigencia Desde</p>
                <p className="text-lg font-medium text-gray-800">{new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Vigencia Hasta</p>
                <p className="text-lg font-medium text-gray-800">{new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Notas Internas</h3>
            <p className="text-gray-500 italic text-sm">No hay observaciones adicionales para esta póliza.</p>
          </div>
        </div>

        {/* Columna Lateral: Partes Involucradas */}
        <div className="flex flex-col gap-6">
          {/* Tarjeta Asegurado */}
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:border-green-200 transition-colors cursor-pointer" 
               onClick={() => router.push(`/asegurados`)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Asegurado</h3>
              <User size={18} className="text-gray-400" />
            </div>
            <p className="text-xl font-bold text-green-800">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</p>
            <p className="text-sm text-gray-500 mt-1">DNI: {poliza.asegurado?.dni}</p>
          </div>

          {/* Tarjeta Compañía */}
          <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:border-green-200 transition-colors cursor-pointer"
               onClick={() => router.push(`/companias`)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Aseguradora</h3>
              <Building size={18} className="text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-800">{poliza.compania?.nombre}</p>
            <p className="text-sm text-gray-500 mt-1">CUIT: {poliza.compania?.cuit || "-"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}