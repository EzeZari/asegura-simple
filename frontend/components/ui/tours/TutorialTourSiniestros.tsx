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

export default function TutorialTourSiniestros() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // 🔥 CLAVE EXCLUSIVA PARA LA PANTALLA DE SINIESTROS
    const tutorialCompletado = localStorage.getItem("asegurasimple_tutorial_siniestros_completado");
    if (tutorialCompletado !== "true") {
      const timer = setTimeout(() => {
        setRun(true);
        // 🔥 LO GUARDAMOS APENAS ARRANCA
        localStorage.setItem("asegurasimple_tutorial_siniestros_completado", "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // 🔥 CAMBIO CLAVE A any[] PARA QUE NO FALLE EL BUILD
  const steps: any[] = [
    {
      target: "body",
      placement: "center",
      title: "Seguimiento de Siniestros ⚠️",
      content: "Acá vas a controlar el estado de los reclamos, choques y eventos reportados por tus asegurados.",
      disableBeacon: true,
    },
    {
      target: ".tour-siniestros-header button", 
      title: "Reportar un Hecho",
      content: "Cuando un cliente sufra un accidente, hacé clic acá para abrir una nueva ficha de siniestro, asociarla a su póliza y detallar lo ocurrido.",
      placement: "bottom",
    },
    {
      target: ".tour-siniestros-filtros",
      title: "Filtros de Control",
      content: "Buscá reclamos por número, patente o cliente. También podés segmentar por el estado del trámite (En Análisis, Aprobado, Pagado, etc.).",
      placement: "bottom",
    },
    {
      target: ".tour-siniestros-tabla",
      title: "Historial de Casos",
      content: "En esta lista verás los siniestros cargados. Para ir al panel técnico detallado del siniestro, ver fotos del choque o la documentación, hacé clic sobre el número de siniestro o en el menú de acciones.",
      placement: "top",
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