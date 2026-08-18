"use client";

import { useState, useEffect } from "react";
import { Save, MessageSquare, Info } from "lucide-react";
import Toast from "@/components/ui/Toast";

const DEFAULT_VENCIMIENTO = "Hola [Nombre], te escribimos de AseguraSimple. Te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento]. Por favor, confirmame si avanzamos con la renovación.";
const DEFAULT_BIENVENIDA = "¡Hola [Nombre]! Bienvenido/a. Te confirmamos que ya emitimos tu nueva póliza de [Rama] con [Compania]. Tu número de póliza es [NroPoliza]. Cualquier consulta estamos a disposición.";

export default function PlantillasSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [agencia, setAgencia] = useState<any>({
    mensajeVencimiento: DEFAULT_VENCIMIENTO,
    mensajeBienvenida: DEFAULT_BIENVENIDA,
  });

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

  const variablesDisponibles = [
    { tag: "[Nombre]", desc: "Nombre del cliente" },
    { tag: "[Compania]", desc: "Nombre de la aseguradora" },
    { tag: "[NroPoliza]", desc: "Número de la póliza" },
    { tag: "[Vencimiento]", desc: "Fecha de fin de vigencia" },
    { tag: "[Rama]", desc: "Tipo de cobertura (Auto, Hogar, etc.)" },
  ];

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400 animate-pulse p-4 transition-colors">Cargando plantillas...</div>;
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6 animate-in fade-in duration-300">
      
      {/* 🔥 Caja de ayuda azul adaptada al modo oscuro */}
      <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-4 rounded-2xl flex gap-3 items-start transition-colors">
        <Info size={18} className="text-blue-600 dark:text-blue-500 mt-0.5 shrink-0 transition-colors" />
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-400 transition-colors">¿Cómo funcionan las plantillas?</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed transition-colors">
            Escribí el texto base. Copiá y pegá las variables entre corchetes; el sistema las reemplazará automáticamente con los datos reales de la póliza antes de abrir WhatsApp.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {variablesDisponibles.map((v, i) => (
              <span key={i} className="inline-flex flex-col bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 px-2.5 py-1 rounded-lg text-[11px] transition-colors" title={v.desc}>
                <code className="font-mono font-bold text-blue-700 dark:text-blue-400 transition-colors">{v.tag}</code>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 Formulario oscurecido */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-5 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 flex items-center gap-2 transition-colors">
          <MessageSquare size={18} className="text-gray-400 dark:text-gray-500 transition-colors" /> WhatsApp de Notificaciones
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Recordatorio de Vencimiento Inminente</label>
          <textarea
            name="mensajeVencimiento"
            rows={4}
            value={agencia.mensajeVencimiento}
            onChange={handleChange}
            className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 text-sm text-gray-900 dark:text-white resize-none mt-1 leading-relaxed transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Aviso de Nueva Póliza Emitida</label>
          <textarea
            name="mensajeBienvenida"
            rows={4}
            value={agencia.mensajeBienvenida}
            onChange={handleChange}
            className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 text-sm text-gray-900 dark:text-white resize-none mt-1 leading-relaxed transition-colors"
          />
        </div>

        <div className="flex justify-end border-t border-gray-50 dark:border-gray-700 pt-4 mt-2 transition-colors">
          <button
            onClick={guardarPlantillas}
            disabled={isSaving}
            className="w-full md:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-5 py-3 md:py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Plantillas"}
          </button>
        </div>
      </div>

      <Toast message="Plantillas guardadas con éxito" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}