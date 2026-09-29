"use client";

import { useState, useEffect, useRef } from "react";
import { Save, MessageSquare, Info, Smartphone, CheckCheck } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";

const DEFAULT_PROXIMA = "Hola [Nombre], te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. ¿Avanzamos con la renovación?";
const DEFAULT_CRITICA = "Hola [Nombre], te recuerdo que tu póliza de [Rama] ([NroPoliza]) vence en unos días ([Vencimiento]). Avisame así la renovamos a tiempo.";
const DEFAULT_VENCIDA = "Hola [Nombre], te escribo urgente porque tu póliza de [Rama] ([NroPoliza]) venció el [Vencimiento]. Avisame si la renovamos para no dejarte sin cobertura.";
const DEFAULT_BIENVENIDA = "¡Hola [Nombre]! Bienvenido/a. Te confirmamos que ya emitimos tu nueva póliza de [Rama] con [Compania]. Tu número de póliza es [NroPoliza].";

export default function PlantillasSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<"proxima" | "critica" | "vencida" | "bienvenida">("proxima");

  const [agencia, setAgencia] = useState<any>({
    mensajeVencimiento: DEFAULT_PROXIMA,
    mensajePolizaCritica: DEFAULT_CRITICA,
    mensajePolizaVencida: DEFAULT_VENCIDA,
    mensajeBienvenida: DEFAULT_BIENVENIDA,
  });

  const refs = {
    mensajeVencimiento: useRef<HTMLTextAreaElement>(null),
    mensajePolizaCritica: useRef<HTMLTextAreaElement>(null),
    mensajePolizaVencida: useRef<HTMLTextAreaElement>(null),
    mensajeBienvenida: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    const fetchPlantillas = async () => {
      try {
        const res = await apiFetch('/api/agencia');
        const data = await res.json();
        setAgencia({
          ...data,
          mensajeVencimiento: data.mensajeVencimiento || DEFAULT_PROXIMA,
          mensajePolizaCritica: data.mensajePolizaCritica || DEFAULT_CRITICA,
          mensajePolizaVencida: data.mensajePolizaVencida || DEFAULT_VENCIDA,
          mensajeBienvenida: data.mensajeBienvenida || DEFAULT_BIENVENIDA,
        });
      } catch (error) {
        console.error("Error al cargar las plantillas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlantillas();
  }, []);

  const guardarPlantillas = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/agencia', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agencia),
      });

      if (res.ok) {
        setShowToast(true);
      } else {
        alert("Hubo un error al guardar las plantillas");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgencia({ ...agencia, [e.target.name]: e.target.value });
  };

  const insertarVariable = (campo: keyof typeof refs, tag: string) => {
    const ref = refs[campo].current;
    if (!ref) {
      setAgencia((prev: any) => ({ ...prev, [campo]: (prev[campo] || "") + " " + tag }));
      return;
    }

    const start = ref.selectionStart;
    const end = ref.selectionEnd;
    const textoActual = agencia[campo] || "";
    const nuevoTexto = textoActual.substring(0, start) + tag + textoActual.substring(end);

    setAgencia((prev: any) => ({ ...prev, [campo]: nuevoTexto }));

    setTimeout(() => {
      ref.focus();
      ref.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const variablesDisponibles = [
    { tag: "[Nombre]", desc: "Nombre del cliente" },
    { tag: "[Compania]", desc: "Nombre de la aseguradora" },
    { tag: "[NroPoliza]", desc: "Número de la póliza" },
    { tag: "[Vencimiento]", desc: "Fecha de fin de vigencia" },
    { tag: "[Rama]", desc: "Tipo de cobertura (Auto, Hogar, etc.)" },
    { tag: "[Patente]", desc: "Patente del vehículo (si aplica)" },
  ];

  const renderSimulador = () => {
    let raw = "";
    if (previewTab === "proxima") raw = agencia.mensajeVencimiento;
    else if (previewTab === "critica") raw = agencia.mensajePolizaCritica;
    else if (previewTab === "vencida") raw = agencia.mensajePolizaVencida;
    else raw = agencia.mensajeBienvenida;

    return (raw || "")
      .replace(/\[Nombre\]/g, "Juan Pérez")
      .replace(/\[Compania\]/g, "Sancor Seguros")
      .replace(/\[NroPoliza\]/g, "POL-98421")
      .replace(/\[Vencimiento\]/g, "15/11/2026")
      .replace(/\[Rama\]/g, "Automotor")
      .replace(/\[Patente\]/g, "(Patente: AB 123 CD)");
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400 animate-pulse p-4 transition-colors">Cargando plantillas...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-5 rounded-2xl flex gap-3.5 items-start transition-colors">
        <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Variables dinámicas de personalización</h4>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Hacé clic en cualquiera de las siguientes etiquetas para insertarla automáticamente en el mensaje donde tengas el cursor. El sistema reemplazará los datos al abrir WhatsApp.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {variablesDisponibles.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-blue-200/70 dark:border-gray-700 px-2.5 py-1 rounded-lg text-xs transition-all shadow-sm"
                title={v.desc}
              >
                <code className="font-mono font-bold text-blue-700 dark:text-blue-400">{v.tag}</code>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:inline">• {v.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col gap-6 h-[800px] overflow-y-auto transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <MessageSquare size={18} className="text-green-600 dark:text-green-500" /> Plantillas de Renovación
          </h3>

          {/* 🟡 PRÓXIMAS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-amber-700 dark:text-amber-500">1. Alerta Preventiva (Próximas)</label>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">+ 7 DÍAS</span>
            </div>
            
            <textarea
              ref={refs.mensajeVencimiento}
              name="mensajeVencimiento"
              rows={3}
              value={agencia.mensajeVencimiento}
              onChange={handleChange}
              onFocus={() => setPreviewTab("proxima")}
              className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-amber-200 dark:border-amber-900/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
              {variablesDisponibles.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertarVariable("mensajeVencimiento", v.tag)}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  +{v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* 🟠 CRÍTICAS */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-orange-600 dark:text-orange-500">2. Alerta Crítica (Pocos días)</label>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">0 a 7 DÍAS</span>
            </div>

            <textarea
              ref={refs.mensajePolizaCritica}
              name="mensajePolizaCritica"
              rows={3}
              value={agencia.mensajePolizaCritica}
              onChange={handleChange}
              onFocus={() => setPreviewTab("critica")}
              className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-orange-200 dark:border-orange-900/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
              {variablesDisponibles.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertarVariable("mensajePolizaCritica", v.tag)}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-gray-700 dark:text-gray-300 hover:text-orange-700 dark:hover:text-orange-400 rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  +{v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* 🔴 VENCIDAS */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-rose-600 dark:text-rose-500">3. Pólizas Vencidas (Sin cobertura)</label>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">YA VENCIDAS</span>
            </div>

            <textarea
              ref={refs.mensajePolizaVencida}
              name="mensajePolizaVencida"
              rows={3}
              value={agencia.mensajePolizaVencida}
              onChange={handleChange}
              onFocus={() => setPreviewTab("vencida")}
              className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-rose-200 dark:border-rose-900/50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
              {variablesDisponibles.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertarVariable("mensajePolizaVencida", v.tag)}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-gray-700 dark:text-gray-300 hover:text-rose-700 dark:hover:text-rose-400 rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  +{v.tag}
                </button>
              ))}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2 mt-4 pt-4 border-t-4 border-t-gray-100 dark:border-t-gray-800">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-500" /> Plantillas de Gestión
          </h3>

          {/* 🔵 BIENVENIDA */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-blue-600 dark:text-blue-500">Aviso de Nueva Póliza Emitida</label>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">BIENVENIDA / EMISIÓN</span>
            </div>

            <textarea
              ref={refs.mensajeBienvenida}
              name="mensajeBienvenida"
              rows={3}
              value={agencia.mensajeBienvenida}
              onChange={handleChange}
              onFocus={() => setPreviewTab("bienvenida")}
              className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-blue-200 dark:border-blue-900/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
              {variablesDisponibles.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertarVariable("mensajeBienvenida", v.tag)}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  +{v.tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10 py-2">
            <button
              onClick={guardarPlantillas}
              disabled={isSaving}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            <Smartphone size={16} /> Vista Previa en Vivo
          </div>
          
          <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <button onClick={() => setPreviewTab("proxima")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${previewTab === "proxima" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Próximas</button>
            <button onClick={() => setPreviewTab("critica")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${previewTab === "critica" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Críticas</button>
            <button onClick={() => setPreviewTab("vencida")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${previewTab === "vencida" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Vencidas</button>
            <button onClick={() => setPreviewTab("bienvenida")} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${previewTab === "bienvenida" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Bienvenida</button>
          </div>

          <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-3xl p-4 md:p-5 border border-gray-300 dark:border-gray-800 shadow-inner flex flex-col min-h-[400px] justify-end relative overflow-hidden transition-colors">
            
            <div className="bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-2xl rounded-tr-none p-3.5 max-w-[90%] shadow-md ml-auto relative">
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {renderSimulador()}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-gray-400 dark:text-gray-400 font-sans">
                <span>12:45</span>
                <CheckCheck size={14} className="text-[#53bdeb]" />
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-500 dark:text-gray-500 mt-4 italic">
              Así leerá tu mensaje el asegurado al recibirlo en su celular.
            </p>
          </div>
        </div>

      </div>

      <Toast message="Plantillas guardadas con éxito" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}