"use client";

import { useState, useEffect, useRef } from "react";
import { Save, MessageSquare, Info, Smartphone, CheckCheck } from "lucide-react";
import Toast from "@/components/ui/Toast";

const DEFAULT_VENCIMIENTO = "Hola [Nombre], te escribimos de AseguraSimple. Te avisamos que tu póliza de [Rama] [Patente] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. Por favor, confirmame si avanzamos con la renovación.";
const DEFAULT_BIENVENIDA = "¡Hola [Nombre]! Bienvenido/a. Te confirmamos que ya emitimos tu nueva póliza de [Rama] [Patente] con [Compania]. Tu número de póliza es [NroPoliza]. Cualquier consulta estamos a disposición.";

export default function PlantillasSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<"vencimiento" | "bienvenida">("vencimiento");

  const [agencia, setAgencia] = useState<any>({
    mensajeVencimiento: DEFAULT_VENCIMIENTO,
    mensajeBienvenida: DEFAULT_BIENVENIDA,
  });

  const vtoRef = useRef<HTMLTextAreaElement>(null);
  const bienvenidaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPlantillas = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agencia`);
        const data = await res.json();
        setAgencia({
          ...data,
          mensajeVencimiento: data.mensajeVencimiento || DEFAULT_VENCIMIENTO,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agencia`, {
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

  // 🔥 Inserta la variable en la posición del cursor
  const insertarVariable = (campo: "mensajeVencimiento" | "mensajeBienvenida", tag: string) => {
    const ref = campo === "mensajeVencimiento" ? vtoRef.current : bienvenidaRef.current;
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
    { tag: "[Patente]", desc: "Patente del vehículo (si aplica)" }, // 🔥 NUEVA VARIABLE
  ];

  // Render simulador de mensaje real
  const renderSimulador = (plantillaRaw: string) => {
    const mensaje = (plantillaRaw || "")
      .replace(/\[Nombre\]/g, "Juan Pérez")
      .replace(/\[Compania\]/g, "Sancor Seguros")
      .replace(/\[NroPoliza\]/g, "POL-98421")
      .replace(/\[Vencimiento\]/g, "15/11/2026")
      .replace(/\[Rama\]/g, "Automotor")
      .replace(/\[Patente\]/g, "(Patente: AB 123 CD)");

    return mensaje;
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400 animate-pulse p-4 transition-colors">Cargando plantillas...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Caja de ayuda con chips interactivos */}
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
        
        {/* Formulario de Edición */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col gap-6 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
            <MessageSquare size={18} className="text-green-600 dark:text-green-500" /> Plantillas de WhatsApp
          </h3>

          {/* Plantilla 1: Vencimiento */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Recordatorio de Vencimiento
              </label>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Alerta de Renovación</span>
            </div>
            
            <textarea
              ref={vtoRef}
              name="mensajeVencimiento"
              rows={4}
              value={agencia.mensajeVencimiento}
              onChange={handleChange}
              onFocus={() => setPreviewTab("vencimiento")}
              className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
            />

            {/* Inserción rápida */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
              {variablesDisponibles.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertarVariable("mensajeVencimiento", v.tag)}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-950/40 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  +{v.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Plantilla 2: Bienvenida */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Aviso de Nueva Póliza Emitida
              </label>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Bienvenida / Emisión</span>
            </div>

            <textarea
              ref={bienvenidaRef}
              name="mensajeBienvenida"
              rows={4}
              value={agencia.mensajeBienvenida}
              onChange={handleChange}
              onFocus={() => setPreviewTab("bienvenida")}
              className="w-full p-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 text-sm text-gray-900 dark:text-white resize-none leading-relaxed transition-colors font-sans"
            />

            {/* Inserción rápida */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-gray-400 mr-1 font-medium">Insertar:</span>
              {variablesDisponibles.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertarVariable("mensajeBienvenida", v.tag)}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-950/40 text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-md text-[11px] font-mono font-medium transition-colors"
                >
                  +{v.tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={guardarPlantillas}
              disabled={isSaving}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Plantillas"}
            </button>
          </div>
        </div>

        {/* Simulador visual en vivo de WhatsApp */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Smartphone size={16} /> Vista Previa en Vivo
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPreviewTab("vencimiento")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  previewTab === "vencimiento"
                    ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Vencimiento
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("bienvenida")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  previewTab === "bienvenida"
                    ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Nueva Póliza
              </button>
            </div>
          </div>

          {/* Maqueta de celular */}
          <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-3xl p-4 md:p-5 border border-gray-300 dark:border-gray-800 shadow-inner flex flex-col min-h-[360px] justify-end relative overflow-hidden transition-colors">
            
            {/* Mensaje simulado */}
            <div className="bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-2xl rounded-tr-none p-3.5 max-w-[90%] shadow-md ml-auto relative">
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {renderSimulador(previewTab === "vencimiento" ? agencia.mensajeVencimiento : agencia.mensajeBienvenida)}
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