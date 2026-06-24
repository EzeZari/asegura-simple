"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Joyride: any = dynamic(
  async () => {
    const mod = await import("react-joyride");
    return (mod as any).default || (mod as any).Joyride || mod;
  },
  { ssr: false }
);

const CustomTooltip = ({ index, step, backProps, closeProps, primaryProps, tooltipProps, isLastStep }: any) => {
  return (
    <div {...tooltipProps} className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
      {step.title && <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">{step.title}</h3>}
      <div className="text-gray-600 text-sm mb-6 leading-relaxed">{step.content}</div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <button {...closeProps} className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors">Omitir tour</button>
        <div className="flex gap-2">
          {index > 0 && <button {...backProps} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Atrás</button>}
          <button {...primaryProps} className="px-4 py-2 text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-colors shadow-sm">
            {isLastStep ? "¡Entendido!" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TutorialTourDetalleSiniestro() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // 🔥 CLAVE EXCLUSIVA PARA EL EXPEDIENTE
    const tutorialCompletado = localStorage.getItem("asegurasimple_tutorial_detalle_siniestro_completado");
    if (tutorialCompletado !== "true") {
      const timer = setTimeout(() => {
        setRun(true);
        // 🔥 LO GUARDAMOS APENAS ARRANCA PARA QUE NO MOLESTE AL RECARGAR (F5)
        localStorage.setItem("asegurasimple_tutorial_detalle_siniestro_completado", "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // 🔥 CAMBIO CLAVE A any[] PARA QUE NO FALLE EL BUILD
  const steps: any[] = [
    {
      target: "body",
      placement: "center",
      title: "Expediente Digital 📂",
      content: "Bienvenido al panel técnico del siniestro. Acá está consolidada toda la información del caso y las herramientas para gestionarlo.",
      disableBeacon: true,
    },
    {
      target: ".tour-detalle-estado", 
      title: "Control de Trámite",
      content: "Desde este selector podés actualizar el estado del siniestro (En Análisis, Pagado, etc.) rápidamente sin entrar a configuraciones complejas.",
      placement: "bottom",
    },
    {
      target: ".tour-detalle-notas",
      title: "Bitácora Privada",
      content: "Añadí notas y novedades internas para que vos o tu equipo sepan en qué estado quedó la gestión con la aseguradora.",
      placement: "top",
    },
    {
      target: ".tour-detalle-informacion",
      title: "Ficha Técnica",
      content: "Acá tenés a mano los datos del vehículo, del titular y de la compañía emisora, ideal para cuando tenés que llamar a denunciar el siniestro.",
      placement: "left",
    },
    {
      target: ".tour-detalle-link",
      title: "Portal para el Cliente",
      content: "¡Funcionalidad Estrella! Generá un enlace único y mandaselo al cliente por WhatsApp para que él mismo pueda ver cómo avanza su trámite en tiempo real, sin molestarte.",
      placement: "left",
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{ options: { overlayColor: "rgba(0, 0, 0, 0.65)", zIndex: 10000 } }}
    />
  );
}