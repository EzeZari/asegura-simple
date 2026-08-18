"use client";

import { useState } from "react";
import { Database, Download } from "lucide-react";
import Toast from "@/components/ui/Toast";
import ExportarExcelModal from "@/components/ui/ExportarExcelModal";
import { apiFetch } from "@/services/api";

export default function RespaldoDatos() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [datosExportar, setDatosExportar] = useState<any[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState("");

  const formatearFecha = (fechaStr: any) => {
    if (!fechaStr) return "-";
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return "-";
    return fecha.toLocaleDateString("es-AR");
  };

  const exportarDatos = async (tipo: 'asegurados' | 'polizas') => {
    setIsExporting(true);
    try {
      const res = await apiFetch(`/api/${tipo}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Error al obtener los datos");

      if (!Array.isArray(data) || data.length === 0) {
        alert(`No hay registros de ${tipo} para exportar.`);
        setIsExporting(false);
        return;
      }

      let datosFormateados = [];
      let nombreBase = "";

      if (tipo === 'asegurados') {
        datosFormateados = data.map((a: any) => ({
          "Nombre Completo": `${a.nombre || ""} ${a.apellido || ""}`.trim() || "-",
          "DNI": a.dni || "-",
          "Email": a.email || "-",
          "Teléfono": a.telefono || "-",
          "Fecha de Nacimiento": formatearFecha(a.fechaNacimiento),
          "Cantidad de Pólizas": (a._count?.polizas || a.polizas?.length || 0).toString(),
          "Fecha de Alta": formatearFecha(a.fechaRegistro) 
        }));
        nombreBase = `Backup_Total_Asegurados_${new Date().toISOString().split("T")[0]}`;
      } else {
        datosFormateados = data.map((p: any) => ({
          "Nro Póliza": p.nroPoliza || "-",
          "Asegurado": p.asegurado ? `${p.asegurado.nombre || ""} ${p.asegurado.apellido || ""}`.trim() : "-",
          "DNI Asegurado": p.asegurado?.dni || "-",
          "Compañía": p.compania?.nombre || "-",
          "Rama": p.tipoPoliza || "-",
          "Cobertura": p.cobertura || "-",
          "Estado": p.estado || "-",
          "Patente / Ubicación": p.patente || p.ubicacionRiesgo || "-",
          "Vigencia Desde": formatearFecha(p.fechaInicio),
          "Vigencia Hasta": formatearFecha(p.fechaVencimiento)
        }));
        nombreBase = `Backup_Total_Polizas_${new Date().toISOString().split("T")[0]}`;
      }

      setDatosExportar(datosFormateados);
      setNombreArchivo(nombreBase);
      setIsModalOpen(true);
      
      setToastMessage(`Base de datos de ${tipo} procesada. Seleccioná las columnas.`);
      setShowToast(true);

    } catch (error) {
      console.error(error);
      alert(`Hubo un error al procesar el respaldo de ${tipo}. Verificá tu sesión.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 flex items-center gap-2 transition-colors">
        <Database size={18} className="text-gray-400 dark:text-gray-500" /> Respaldo Total del Sistema
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl transition-colors">
        Descargá toda la información histórica de tu cartera en formato Excel (.CSV). Es recomendable hacer un respaldo mensual para tener control total sobre tus datos de forma offline.
      </p>
      
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
        <button 
          onClick={() => exportarDatos('asegurados')} 
          disabled={isExporting} 
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/50 px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
        >
          <Download size={18} /> Base Completa: Asegurados
        </button>
        <button 
          onClick={() => exportarDatos('polizas')} 
          disabled={isExporting} 
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/50 px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
        >
          <Download size={18} /> Base Completa: Pólizas
        </button>
      </div>

      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />

      <ExportarExcelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        datos={datosExportar} 
        nombreArchivo={nombreArchivo} 
      />
    </div>
  );
}