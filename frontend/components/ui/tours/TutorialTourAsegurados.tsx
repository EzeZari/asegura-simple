"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { CallBackProps, Step } from "react-joyride";

const Joyride = dynamic(
  async () => {
    const mod = await import("react-joyride");
    return (mod as any).default || (mod as any).Joyride || mod;
  },
  { ssr: false }
);

// Reutilizamos el Tooltip Premium
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

export default function TutorialTourAsegurados() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const tutorialCompletado = localStorage.getItem("asegurasimple_tutorial_asegurados_completado");
    if (tutorialCompletado !== "true") {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: "Tu Cartera de Clientes 👥",
      content: "Acá vas a gestionar a todos tus asegurados. Vamos a ver rápidamente cómo funcionan las herramientas de esta pantalla.",
      disableBeacon: true,
    },
    {
      // 🔥 TRUCO NINJA: Apunta al botón específico dentro del contenedor del header
      target: ".tour-asegurados-header button", 
      title: "Alta de Clientes",
      content: "Con este botón vas a poder registrar clientes nuevos de forma manual ingresando sus datos personales o de empresa.",
      placement: "bottom",
    },
    {
      target: ".tour-asegurados-filtros",
      title: "Buscador Inteligente",
      content: "No pierdas tiempo. Podés buscar al instante por Nombre, DNI, o filtrar por clientes activos o inactivos.",
      placement: "bottom",
    },
    {
      target: ".tour-asegurados-herramientas",
      title: "Importar y Exportar",
      content: "¿Tenés un Excel de otra plataforma? Importalo directo con este botón. También podés descargar toda tu base de datos cuando quieras.",
      placement: "top",
    },
    {
      target: ".tour-asegurados-tabla",
      // 🔥 TEXTOS CORREGIDOS PARA LA SECCIÓN DE ASEGURADOS
      title: "Listado de Asegurados", 
      content: "Acá vas a ver a todos tus clientes registrados con sus datos de contacto y estado. Para ver o administrar las pólizas específicas de cualquiera de ellos, simplemente hacé clic en su 'Escudo Verde'.",
      placement: "top",
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRun(false);
      localStorage.setItem("asegurasimple_tutorial_asegurados_completado", "true");
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