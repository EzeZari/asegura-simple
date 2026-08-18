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
    return <div className="text-gray-500 dark:text-gray-400 animate-pulse p-4 transition-colors">Cargando preferencias...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-5 md:gap-6 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 flex items-center gap-2 transition-colors">
          <BellRing size={18} className="text-gray-400 dark:text-gray-500 transition-colors" /> Preferencias de Alertas y Envíos
        </h3>
        
        <div className="flex flex-col gap-5 md:gap-6 max-w-2xl">
          
          <div className={`p-4 md:p-5 rounded-xl border transition-colors duration-300 ${agencia.enviarMailBienvenida ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className={`flex items-center gap-2 text-sm font-bold mb-1 transition-colors ${agencia.enviarMailBienvenida ? 'text-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  <Mail size={18} /> Bienvenida a Nuevos Clientes
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                  Enviar automáticamente un correo de cortesía cuando se da de alta un nuevo asegurado.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setAgencia({ ...agencia, enviarMailBienvenida: !agencia.enviarMailBienvenida })}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${agencia.enviarMailBienvenida ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${agencia.enviarMailBienvenida ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className={`p-4 md:p-5 rounded-xl border transition-colors duration-300 ${agencia.envioAutomaticoActivo ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <label className={`flex items-center gap-2 text-sm font-bold mb-1 transition-colors ${agencia.envioAutomaticoActivo ? 'text-emerald-900 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  <Bot size={18} /> Asistente de Envío Automático
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                  El sistema enviará un primer aviso según los días de anticipación, y un segundo recordatorio urgente según tus Vencimientos Críticos.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setAgencia({ ...agencia, envioAutomaticoActivo: !agencia.envioAutomaticoActivo })}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${agencia.envioAutomaticoActivo ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${agencia.envioAutomaticoActivo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {agencia.envioAutomaticoActivo && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/50 animate-in fade-in slide-in-from-top-2 transition-colors">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-xs font-bold text-emerald-800 dark:text-emerald-500 flex items-center gap-1 transition-colors">
                    <Clock size={14} /> Horario de envío
                  </label>
                  <input 
                    type="time" 
                    name="horaEnvioAutomatico"
                    value={agencia.horaEnvioAutomatico}
                    onChange={handleChange}
                    className="w-full sm:w-auto p-2 bg-transparent border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-sm font-bold text-emerald-900 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <label className="text-xs font-bold text-emerald-800 dark:text-emerald-500 flex items-center gap-1 transition-colors">
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
                      className="w-20 p-2 bg-transparent text-center border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-sm font-bold text-emerald-900 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors">días antes.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 p-4 rounded-xl transition-colors">
            <label className="flex items-center gap-2 text-sm font-bold text-orange-900 dark:text-orange-400 mb-1 transition-colors">
              <AlertTriangle size={16} /> Vencimientos Críticos
            </label>
            <p className="text-xs text-orange-700 dark:text-orange-300 mb-3 transition-colors">
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
                className="w-24 p-2.5 bg-transparent text-center font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors" 
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">días antes.</span>
            </div>
          </div>

          <div className="bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 p-4 rounded-xl transition-colors">
            <label className="flex items-center gap-2 text-sm font-bold text-orange-900 dark:text-orange-400 mb-1 transition-colors">
              <Clock size={16} /> Vencimientos Próximos (Límite Máximo)
            </label>
            <p className="text-xs text-orange-700 dark:text-orange-300 mb-3 transition-colors">
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
                className="w-24 p-2.5 bg-transparent text-center font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 transition-colors" 
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors">días.</span>
            </div>
          </div>

        </div>

        <div className="flex justify-end border-t border-gray-50 dark:border-gray-700 pt-4 mt-2 transition-colors">
          <button 
            onClick={guardarCambios} 
            disabled={isSaving}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-5 py-3 md:py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </div>
      </div>

      <Toast message="Preferencias de notificaciones guardadas" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}