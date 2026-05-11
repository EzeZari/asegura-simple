"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, FileText, ShieldAlert, CheckCircle2 } from "lucide-react";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import Toast from "@/components/ui/Toast";

export default function PolizasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Función para traer las pólizas desde el backend
  const fetchPolizas = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/polizas");
      const data = await res.json();
      setPolizas(data);
    } catch (error) {
      console.error("Error al cargar pólizas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolizas();
  }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchPolizas(); // Recargamos la tabla para ver la nueva póliza
    setShowToast(true);
  };

  // Filtramos por número de póliza o nombre del asegurado
  const polizasFiltradas = polizas.filter((poliza) => {
    const busqueda = searchTerm.toLowerCase();
    const nroPoliza = poliza.nroPoliza.toLowerCase();
    const nombreCliente = `${poliza.asegurado?.nombre} ${poliza.asegurado?.apellido || ""}`.toLowerCase();
    
    return nroPoliza.includes(busqueda) || nombreCliente.includes(busqueda);
  });

  // Función para darle color a la etiqueta del estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Vigente":
      case "Renovada":
        return "bg-emerald-100 text-emerald-800";
      case "Pendiente de Pago":
        return "bg-amber-100 text-amber-800";
      case "Anulada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pólizas</h1>
          <p className="text-gray-500 mt-1">Gestioná las coberturas activas de tus clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} />
          Nueva Póliza
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nro de póliza o nombre del titular..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-visible pb-10 w-full">
        <div className="overflow-visible w-full min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse relative">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Nro Póliza</th>
                <th className="px-6 py-4 font-semibold">Titular</th>
                <th className="px-6 py-4 font-semibold">Compañía</th>
                <th className="px-6 py-4 font-semibold">Rama / Cobertura</th>
                <th className="px-6 py-4 font-semibold">Vigencia</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Cargando pólizas...</td>
                </tr>
              ) : polizasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText size={32} className="text-gray-300 mb-3" />
                      <p className="font-medium text-gray-900">No se encontraron pólizas</p>
                      <p className="text-sm mt-1">Hacé clic en "Nueva Póliza" para registrar la primera.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                polizasFiltradas.map((poliza) => (
                  <tr key={poliza.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-green-700">
                      #{poliza.nroPoliza}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {poliza.asegurado?.nombre} {poliza.asegurado?.apellido}
                      </div>
                      <div className="text-xs text-gray-500">DNI: {poliza.asegurado?.dni}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {poliza.compania?.nombre || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{poliza.tipoPoliza}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {poliza.cobertura || "Sin detalle"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}
                      </div>
                      <div className="text-xs text-gray-500">
                        al {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getEstadoBadge(poliza.estado)}`}>
                        {poliza.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NuevaPolizaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <Toast 
        message="Póliza guardada con éxito" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
      
    </div>
  );
}