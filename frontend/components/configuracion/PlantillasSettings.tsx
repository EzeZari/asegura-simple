"use client";

import { useState, useEffect, useRef } from "react";
import { Save, MessageSquare, Info, Smartphone, CheckCheck, HelpCircle, X, BellRing, Braces, Send, Eye, CalendarDays, Wallet, Sparkles } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";

const DEFAULT_PROXIMA = "Hola [Nombre], te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. ¿Avanzamos con la renovación?";
const DEFAULT_CRITICA = "Hola [Nombre], te recuerdo que tu póliza de [Rama] ([NroPoliza]) vence en unos días ([Vencimiento]). Avisame así la renovamos a tiempo.";
const DEFAULT_VENCIDA = "Hola [Nombre], te escribo urgente porque tu póliza de [Rama] ([NroPoliza]) venció el [Vencimiento]. Avisame si la renovamos para no dejarte sin cobertura.";
const DEFAULT_BIENVENIDA = "¡Hola [Nombre]! Bienvenido/a. Te confirmamos que ya emitimos tu nueva póliza de [Rama] con [Compania]. Tu número de póliza es [NroPoliza].";
const DEFAULT_COBRANZA = "Hola [Nombre], te escribimos porque registramos un atraso en el pago de tu cuota de [Rama] ([NroPoliza]). Por favor regularizá el saldo para evitar perder la cobertura.";
const DEFAULT_CUMPLEANOS = "¡Feliz cumpleaños [Nombre]! 🎂 De parte de toda la agencia te deseamos un excelente día. Gracias por confiar en nosotros.";

export default function PlantillasSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para configuración dinámica de días
  const [diasConfig, setDiasConfig] = useState({ diasCritica: 7, diasMax: 30 });
  
  const [mainTab, setMainTab] = useState<"renovaciones" | "cobranzas" | "generales">("renovaciones");
  const [previewTab, setPreviewTab] = useState<"proxima" | "critica" | "vencida" | "bienvenida" | "cobranza" | "cumpleanos">("proxima");
  const [showTutorial, setShowTutorial] = useState(false);

  const [agencia, setAgencia] = useState<any>({
    mensajeVencimiento: DEFAULT_PROXIMA,
    mensajePolizaCritica: DEFAULT_CRITICA,
    mensajePolizaVencida: DEFAULT_VENCIDA,
    mensajeCobranza: DEFAULT_COBRANZA,
    mensajeBienvenida: DEFAULT_BIENVENIDA,
    mensajeCumpleanos: DEFAULT_CUMPLEANOS,
  });

  const refs = {
    mensajeVencimiento: useRef<HTMLTextAreaElement>(null),
    mensajePolizaCritica: useRef<HTMLTextAreaElement>(null),
    mensajePolizaVencida: useRef<HTMLTextAreaElement>(null),
    mensajeCobranza: useRef<HTMLTextAreaElement>(null),
    mensajeBienvenida: useRef<HTMLTextAreaElement>(null),
    mensajeCumpleanos: useRef<HTMLTextAreaElement>(null),
  };

  useEffect(() => {
    const fetchPlantillas = async () => {
      try {
        const res = await apiFetch('/api/agencia');
        const data = await res.json();
        
        // Guardar configuración de días para el tutorial
        if (data.diasAlertaCritica || data.diasAlertaProxima) {
          setDiasConfig({
            diasCritica: data.diasAlertaCritica || 7,
            diasMax: data.diasAlertaProxima || 30
          });
        }

        setAgencia({
          ...data,
          mensajeVencimiento: data.mensajeVencimiento || DEFAULT_PROXIMA,
          mensajePolizaCritica: data.mensajePolizaCritica || DEFAULT_CRITICA,
          mensajePolizaVencida: data.mensajePolizaVencida || DEFAULT_VENCIDA,
          mensajeCobranza: data.mensajeCobranza || DEFAULT_COBRANZA,
          mensajeBienvenida: data.mensajeBienvenida || DEFAULT_BIENVENIDA,
          mensajeCumpleanos: data.mensajeCumpleanos || DEFAULT_CUMPLEANOS,
        });
      } catch (error) {
        console.error("Error al cargar las plantillas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlantillas();
  }, []);

  useEffect(() => {
    if (mainTab === "renovaciones") setPreviewTab("proxima");
    if (mainTab === "cobranzas") setPreviewTab("cobranza");
    if (mainTab === "generales") setPreviewTab("bienvenida");
  }, [mainTab]);

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
    { tag: "[Vencimiento]", desc: "Fecha de fin de vigencia / cuota" },
    { tag: "[Rama]", desc: "Tipo de cobertura (Auto, Hogar, etc.)" },
    { tag: "[Patente]", desc: "Patente del vehículo (si aplica)" },
  ];

  const renderSimulador = () => {
    let raw = "";
    if (previewTab === "proxima") raw = agencia.mensajeVencimiento;
    else if (previewTab === "critica") raw = agencia.mensajePolizaCritica;
    else if (previewTab === "vencida") raw = agencia.mensajePolizaVencida;
    else if (previewTab === "cobranza") raw = agencia.mensajeCobranza;
    else if (previewTab === "cumpleanos") raw = agencia.mensajeCumpleanos;
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
      
      <div className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors">
        <div className="flex gap-3.5 items-start">
          <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Personalización de Comunicaciones</h4>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              Configurá los textos predeterminados para contactar a tus clientes por WhatsApp. Podés usar las <strong>Variables Mágicas</strong> para que el sistema complete los datos de cada póliza automáticamente.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {variablesDisponibles.map((v, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-blue-200/70 dark:border-gray-700 px-2.5 py-1 rounded-lg text-xs transition-all shadow-sm" title={v.desc}>
                  <code className="font-mono font-bold text-blue-700 dark:text-blue-400">{v.tag}</code>
                </span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => setShowTutorial(true)} className="shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm">
          <HelpCircle size={16} /> Guía de Uso
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700/50 w-full overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setMainTab("renovaciones")} 
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mainTab === "renovaciones" ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <CalendarDays size={16} /> Renovaciones
            </button>
            <button
              onClick={() => setMainTab("cobranzas")} 
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mainTab === "cobranzas" ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <Wallet size={16} /> Cobranzas
            </button>
            <button
              onClick={() => setMainTab("generales")} 
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${mainTab === "generales" ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              <Sparkles size={16} /> Generales
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col h-[550px] overflow-y-auto transition-colors custom-scrollbar relative">
            
            {mainTab === "renovaciones" && (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 pb-16">
                
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-amber-700 dark:text-amber-500">1. Alerta Preventiva (Próximas)</label>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">+ {diasConfig.diasCritica} DÍAS</span>
                  </div>
                  <textarea
                    ref={refs.mensajeVencimiento} name="mensajeVencimiento" rows={3} value={agencia.mensajeVencimiento} onChange={handleChange} onFocus={() => setPreviewTab("proxima")}
                    className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-amber-200 dark:border-amber-900/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
                    {variablesDisponibles.map((v) => (
                      <button key={v.tag} type="button" onClick={() => insertarVariable("mensajeVencimiento", v.tag)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 rounded-md text-[11px] font-mono font-medium transition-colors">
                        +{v.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-orange-600 dark:text-orange-500">2. Alerta Crítica (Pocos días)</label>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">0 a {diasConfig.diasCritica} DÍAS</span>
                  </div>
                  <textarea
                    ref={refs.mensajePolizaCritica} name="mensajePolizaCritica" rows={3} value={agencia.mensajePolizaCritica} onChange={handleChange} onFocus={() => setPreviewTab("critica")}
                    className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-orange-200 dark:border-orange-900/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
                    {variablesDisponibles.map((v) => (
                      <button key={v.tag} type="button" onClick={() => insertarVariable("mensajePolizaCritica", v.tag)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-gray-700 dark:text-gray-300 hover:text-orange-700 dark:hover:text-orange-400 rounded-md text-[11px] font-mono font-medium transition-colors">
                        +{v.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-rose-600 dark:text-rose-500">3. Pólizas Vencidas (Sin cobertura)</label>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">YA VENCIDAS</span>
                  </div>
                  <textarea
                    ref={refs.mensajePolizaVencida} name="mensajePolizaVencida" rows={3} value={agencia.mensajePolizaVencida} onChange={handleChange} onFocus={() => setPreviewTab("vencida")}
                    className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-rose-200 dark:border-rose-900/50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
                    {variablesDisponibles.map((v) => (
                      <button key={v.tag} type="button" onClick={() => insertarVariable("mensajePolizaVencida", v.tag)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-gray-700 dark:text-gray-300 hover:text-rose-700 dark:hover:text-rose-400 rounded-md text-[11px] font-mono font-medium transition-colors">
                        +{v.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mainTab === "cobranzas" && (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 pb-16">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-emerald-700 dark:text-emerald-500">Aviso de Cuota Impaga / Moroso</label>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">COBRANZAS</span>
                  </div>
                  <textarea
                    ref={refs.mensajeCobranza} name="mensajeCobranza" rows={4} value={agencia.mensajeCobranza} onChange={handleChange} onFocus={() => setPreviewTab("cobranza")}
                    className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-emerald-200 dark:border-emerald-900/50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
                    {variablesDisponibles.map((v) => (
                      <button key={v.tag} type="button" onClick={() => insertarVariable("mensajeCobranza", v.tag)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-md text-[11px] font-mono font-medium transition-colors">
                        +{v.tag}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 flex items-start gap-2">
                      <Info size={14} className="shrink-0 mt-0.5"/>
                      El Centro de Alertas utilizará este mensaje para contactar a cualquier cliente que tenga al menos una cuota vencida o próxima a vencer. Si a futuro requerís distintos niveles de mora, podrás sumarlos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mainTab === "generales" && (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 pb-16">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-purple-700 dark:text-purple-500">Aviso de Nueva Póliza Emitida</label>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">BIENVENIDA</span>
                  </div>
                  <textarea
                    ref={refs.mensajeBienvenida} name="mensajeBienvenida" rows={4} value={agencia.mensajeBienvenida} onChange={handleChange} onFocus={() => setPreviewTab("bienvenida")}
                    className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-purple-200 dark:border-purple-900/50 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
                    {variablesDisponibles.map((v) => (
                      <button key={v.tag} type="button" onClick={() => insertarVariable("mensajeBienvenida", v.tag)} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 rounded-md text-[11px] font-mono font-medium transition-colors">
                        +{v.tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-pink-600 dark:text-pink-500">Saludo de Cumpleaños</label>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">FIDELIZACIÓN</span>
                  </div>
                  <textarea
                    ref={refs.mensajeCumpleanos} name="mensajeCumpleanos" rows={3} value={agencia.mensajeCumpleanos} onChange={handleChange} onFocus={() => setPreviewTab("cumpleanos")}
                    className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-pink-200 dark:border-pink-900/50 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
                    <button type="button" onClick={() => insertarVariable("mensajeCumpleanos", "[Nombre]")} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-gray-700 dark:text-gray-300 hover:text-pink-700 dark:hover:text-pink-400 rounded-md text-[11px] font-mono font-medium transition-colors">
                      +[Nombre]
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex justify-end z-20 pb-1">
              <button onClick={guardarPlantillas} disabled={isSaving} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm">
                <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            <Smartphone size={16} /> Vista Previa en Vivo
          </div>
          
          <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300">
            {mainTab === "renovaciones" && (
              <>
                <button onClick={() => setPreviewTab("proxima")} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${previewTab === "proxima" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Próxima</button>
                <button onClick={() => setPreviewTab("critica")} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${previewTab === "critica" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Crítica</button>
                <button onClick={() => setPreviewTab("vencida")} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${previewTab === "vencida" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Vencida</button>
              </>
            )}
            {mainTab === "cobranzas" && (
              <button onClick={() => setPreviewTab("cobranza")} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${previewTab === "cobranza" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Aviso de Cobranza</button>
            )}
            {mainTab === "generales" && (
              <>
                <button onClick={() => setPreviewTab("bienvenida")} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${previewTab === "bienvenida" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Bienvenida</button>
                <button onClick={() => setPreviewTab("cumpleanos")} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${previewTab === "cumpleanos" ? "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Cumpleaños</button>
              </>
            )}
          </div>

          <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-3xl p-4 md:p-5 border border-gray-300 dark:border-gray-800 shadow-inner flex flex-col min-h-[500px] justify-end relative overflow-hidden transition-colors">
            
            <div className="bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-2xl rounded-tr-none p-3.5 max-w-[90%] shadow-md ml-auto relative animate-in slide-in-from-bottom-2 duration-300">
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

      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-5 md:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600 dark:text-blue-500"/> Guía del Sistema de Plantillas
              </h3>
              <button onClick={() => setShowTutorial(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 md:p-6 space-y-8 overflow-y-auto custom-scrollbar text-sm text-gray-600 dark:text-gray-300">
              
              <section>
                <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3 text-base">
                  <BellRing size={18} className="text-amber-500" /> 1. ¿Cómo funcionan las Alertas de Renovación?
                </h4>
                <p className="mb-3">AseguraSimple lee las fechas de vigencia de tu cartera y clasifica las pólizas en 3 estados. Cada estado usa una plantilla distinta:</p>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 mt-2">
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2 ml-7">
                    <li><strong className="text-rose-600 dark:text-rose-400">Rojo (Vencidas):</strong> La fecha ya pasó. El cliente no tiene cobertura (Renovación) o está en mora (Cobranza).</li>
                    <li><strong className="text-orange-600 dark:text-orange-400">Naranja (Críticas):</strong> Vencen en los próximos {diasConfig.diasCritica} días.</li>
                    <li><strong className="text-amber-600 dark:text-amber-500">Amarillo (Próximas):</strong> Vencen a partir de los {diasConfig.diasCritica + 1} días y hasta los próximos {diasConfig.diasMax} días.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3 text-base">
                  <Braces size={18} className="text-blue-500" /> 2. ¿Qué son las Variables Dinámicas?
                </h4>
                <p className="mb-4">Son etiquetas (como <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded font-mono text-xs text-blue-600 dark:text-blue-400">[Nombre]</code>) que funcionan como "comodines". Te ahorran el trabajo de escribir los datos de cada cliente a mano.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-950/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-black rounded-full w-6 h-6 mb-2 text-xs">1</span>
                    <p className="text-xs">Hacé clic en la caja de texto justo donde querés insertar el dato.</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-950/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-black rounded-full w-6 h-6 mb-2 text-xs">2</span>
                    <p className="text-xs">Tocá el botón de la variable (Ej: <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded font-mono font-bold">+[Rama]</code>).</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-950/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-black rounded-full w-6 h-6 mb-2 text-xs">3</span>
                    <p className="text-xs">Al abrir WhatsApp, el sistema pondrá "Auto" o "Hogar" automáticamente.</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-3 text-base">
                  <Send size={18} className="text-green-500" /> 3. ¿Los mensajes se envían solos?
                </h4>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 p-4 rounded-xl text-green-800 dark:text-green-300">
                  <p><strong>No. Tú tienes el control total.</strong> AseguraSimple no hace envíos automáticos ni "spam" por WhatsApp.</p>
                  <p className="mt-2">Cuando presiones el botón en la tabla de pólizas, el sistema abrirá la aplicación en tu celular o computadora con el mensaje ya redactado. <strong>El mensaje solo se enviará cuando vos presiones "Enviar" en WhatsApp.</strong></p>
                </div>
              </section>
            </div>

            <div className="px-5 md:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 flex justify-end shrink-0">
              <button onClick={() => setShowTutorial(false)} className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all">
                ¡Entendido, a configurar!
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message="Plantillas guardadas con éxito" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}