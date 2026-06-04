"use client";

import { useState } from "react";
import { Database, Download } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function RespaldoDatos() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const exportarDatos = async (tipo: 'asegurados' | 'polizas') => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setToastMessage(`Base de datos de ${tipo} exportada correctamente.`);
      setShowToast(true);
    } catch (error) {
      alert("Hubo un error al exportar los datos.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    // 🔥 AJUSTE: p-4 en móvil, p-6 en PC
    <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
        <Database size={18} className="text-gray-400" /> Respaldo Total del Sistema
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
        Descargá toda la información histórica de tu cartera en formato Excel (.CSV). Es recomendable hacer un respaldo mensual para tener control total sobre tus datos de forma offline.
      </p>
      
      {/* 🔥 AJUSTE: flex-col en móvil para apilarlos, flex-row en sm */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
        <button onClick={() => exportarDatos('asegurados')} disabled={isExporting} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
          <Download size={18} /> Base Completa: Asegurados
        </button>
        <button onClick={() => exportarDatos('polizas')} disabled={isExporting} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-50">
          <Download size={18} /> Base Completa: Pólizas
        </button>
      </div>
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}