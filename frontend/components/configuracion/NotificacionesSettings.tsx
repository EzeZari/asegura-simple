"use client";

import { useState, useEffect } from "react";
import { Save, BellRing, AlertTriangle, Clock } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function NotificacionesSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [agencia, setAgencia] = useState<any>({
    diasAlertaCritica: 7,
    diasAlertaVencimiento: 30,
  });

  useEffect(() => {
    const fetchAgencia = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/agencia");
        const data = await res.json();
        setAgencia({
          ...data,
          diasAlertaCritica: data.diasAlertaCritica ?? 7,
          diasAlertaVencimiento: data.diasAlertaVencimiento ?? 30,
        });
      } catch (error) {
        console.error("Error al cargar notificaciones", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencia();
  }, []);

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:3001/api/agencia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agencia),
      });

      if (res.ok) {
        setShowToast(true);
      } else {
        alert("Hubo un error al guardar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAgencia({ ...agencia, [e.target.name]: isNaN(value) ? "" : value });
  };

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse p-4">Cargando preferencias...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
          <BellRing size={18} className="text-gray-400" /> Preferencias de Alertas
        </h3>
        
        <div className="flex flex-col gap-6 max-w-2xl">
          
          {/* Ajuste: Días Críticos */}
          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
            <label className="flex items-center gap-2 text-sm font-bold text-orange-900 mb-1">
              <AlertTriangle size={16} /> Vencimientos Críticos
            </label>
            <p className="text-xs text-orange-700 mb-3">
              ¿Cuántos días antes del vencimiento querés que la alerta se marque como urgente/crítica?
            </p>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                name="diasAlertaCritica" 
                value={agencia.diasAlertaCritica} 
                onChange={handleChange}
                min="1"
                max={agencia.diasAlertaVencimiento - 1} // No puede ser mayor al máximo
                className="w-24 p-2.5 text-center font-bold text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <span className="text-sm font-medium text-gray-600">días antes de la fecha.</span>
            </div>
          </div>

          {/* Ajuste: Días Máximos (Próximos) */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-1">
              <Clock size={16} /> Vencimientos Próximos (Límite Máximo)
            </label>
            <p className="text-xs text-blue-700 mb-3">
              ¿Hasta cuántos días en el futuro querés que el sistema busque pólizas por vencer?
            </p>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                name="diasAlertaVencimiento" 
                value={agencia.diasAlertaVencimiento} 
                onChange={handleChange}
                min={agencia.diasAlertaCritica + 1} // No puede ser menor a los críticos
                max="90"
                className="w-24 p-2.5 text-center font-bold text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <span className="text-sm font-medium text-gray-600">días antes de la fecha.</span>
            </div>
          </div>

        </div>

        <div className="flex justify-end border-t border-gray-50 pt-4 mt-2">
          <button 
            onClick={guardarCambios} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </div>
      </div>

      <Toast message="Preferencias de notificaciones guardadas" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}