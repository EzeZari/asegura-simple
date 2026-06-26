"use client";

import { useState, useEffect } from "react";
import { Save, BellRing, AlertTriangle, Clock, Bot, Send, Mail } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";

export default function NotificacionesSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [agencia, setAgencia] = useState<any>({
    diasAlertaCritica: 7,
    diasAlertaVencimiento: 30,
    envioAutomaticoActivo: false,
    horaEnvioAutomatico: "09:00",
    diasAvisoAutomatico: 15,
    enviarMailBienvenida: true 
  });

  useEffect(() => {
    const fetchAgencia = async () => {
      try {
        const res = await apiFetch(`/api/agencia`);
        const data = await res.json();
        setAgencia({
          ...data,
          diasAlertaCritica: data.diasAlertaCritica ?? 7,
          diasAlertaVencimiento: data.diasAlertaVencimiento ?? 30,
          envioAutomaticoActivo: data.envioAutomaticoActivo ?? false,
          horaEnvioAutomatico: data.horaEnvioAutomatico ?? "09:00",
          diasAvisoAutomatico: data.diasAvisoAutomatico ?? 15,
          enviarMailBienvenida: data.enviarMailBienvenida ?? true 
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
      const res = await apiFetch(`/api/agencia`, { 
        method: "PUT",
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
    const { name, value, type } = e.target;
    if (type === "time") {
      setAgencia({ ...agencia, [name]: value });
    } else {
      const num = parseInt(value);
      setAgencia({ ...agencia, [name]: isNaN(num) ? "" : num });
    }
  };

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse p-4">Cargando preferencias...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5 md:gap-6">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
          <BellRing size={18} className="text-gray-400" /> Preferencias de Alertas y Envíos
        </h3>
        
        <div className="flex flex-col gap-5 md:gap-6 max-w-2xl">
          
          <div className={`p-4 md:p-5 rounded-xl border transition-colors duration-300 ${agencia.enviarMailBienvenida ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className={`flex items-center gap-2 text-sm font-bold mb-1 ${agencia.enviarMailBienvenida ? 'text-blue-900' : 'text-gray-700'}`}>
                  <Mail size={18} /> Bienvenida a Nuevos Clientes
                </label>
                <p className="text-xs text-gray-500">
                  Enviar automáticamente un correo de cortesía cuando se da de alta un nuevo asegurado.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setAgencia({ ...agencia, enviarMailBienvenida: !agencia.enviarMailBienvenida })}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${agencia.enviarMailBienvenida ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${agencia.enviarMailBienvenida ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className={`p-4 md:p-5 rounded-xl border transition-colors duration-300 ${agencia.envioAutomaticoActivo ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <label className={`flex items-center gap-2 text-sm font-bold mb-1 ${agencia.envioAutomaticoActivo ? 'text-emerald-900' : 'text-gray-700'}`}>
                  <Bot size={18} /> Asistente de Envío Automático
                </label>
                {/* 🔥 TEXTO ACTUALIZADO PARA EXPLICAR EL DOBLE AVISO */}
                <p className="text-xs text-gray-500">
                  El sistema enviará un primer aviso según los días de anticipación, y un segundo recordatorio urgente según tus Vencimientos Críticos.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setAgencia({ ...agencia, envioAutomaticoActivo: !agencia.envioAutomaticoActivo })}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${agencia.envioAutomaticoActivo ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${agencia.envioAutomaticoActivo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {agencia.envioAutomaticoActivo && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 border-t border-emerald-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Clock size={14} /> Horario de envío
                  </label>
                  <input 
                    type="time" 
                    name="horaEnvioAutomatico"
                    value={agencia.horaEnvioAutomatico}
                    onChange={handleChange}
                    className="w-full sm:w-auto p-2 border border-emerald-200 rounded-lg text-sm font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Send size={14} /> Días de anticipación (1er Aviso)
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      name="diasAvisoAutomatico"
                      value={agencia.diasAvisoAutomatico}
                      onChange={handleChange}
                      min="1"
                      max="60"
                      className="w-20 p-2 text-center border border-emerald-200 rounded-lg text-sm font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <span className="text-xs font-medium text-emerald-700">días antes.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
            <label className="flex items-center gap-2 text-sm font-bold text-orange-900 mb-1">
              <AlertTriangle size={16} /> Vencimientos Críticos
            </label>
            {/* 🔥 TEXTO ACTUALIZADO PARA CONECTARLO CON EL SEGUNDO AVISO */}
            <p className="text-xs text-orange-700 mb-3">
              ¿Cuántos días antes querés que la póliza se marque como urgente y se envíe el segundo correo automático?
            </p>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                name="diasAlertaCritica" 
                value={agencia.diasAlertaCritica} 
                onChange={handleChange}
                min="1"
                max={agencia.diasAlertaVencimiento - 1} 
                className="w-24 p-2.5 text-center font-bold text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <span className="text-sm font-medium text-gray-600">días antes.</span>
            </div>
          </div>

          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
            <label className="flex items-center gap-2 text-sm font-bold text-orange-900 mb-1">
              <Clock size={16} /> Vencimientos Próximos (Límite Máximo)
            </label>
            <p className="text-xs text-orange-700 mb-3">
              ¿Hasta cuántos días en el futuro querés que el sistema busque pólizas por vencer?
            </p>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                name="diasAlertaVencimiento" 
                value={agencia.diasAlertaVencimiento} 
                onChange={handleChange}
                min={agencia.diasAlertaCritica + 1} 
                max="90"
                className="w-24 p-2.5 text-center font-bold text-gray-900 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" 
              />
              <span className="text-sm font-medium text-gray-600">días.</span>
            </div>
          </div>

        </div>

        <div className="flex justify-end border-t border-gray-50 pt-4 mt-2">
          <button 
            onClick={guardarCambios} 
            disabled={isSaving}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white px-5 py-3 md:py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </div>
      </div>

      <Toast message="Preferencias de notificaciones guardadas" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}