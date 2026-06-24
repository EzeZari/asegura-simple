"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Carga dinámica para evitar errores de servidor
const Joyride: any = dynamic(
  async () => {
    const mod = await import("react-joyride");
    return (mod as any).default || (mod as any).Joyride || mod;
  },
  { ssr: false }
);

// 🔥 COMPONENTE VISUAL 100% CUSTOMIZADO CON TAILWIND
const CustomTooltip = ({ index, step, backProps, closeProps, primaryProps, tooltipProps, isLastStep }: any) => {
  return (
    <div 
      {...tooltipProps} 
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200"
    >
      {step.title && (
        <h3 className="text-lg font-black text-gray-900 mb-2 tracking-tight">
          {step.title}
        </h3>
      )}
      <div className="text-gray-600 text-sm mb-6 leading-relaxed">
        {step.content}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <button 
          {...closeProps} 
          className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Omitir tour
        </button>
        
        <div className="flex gap-2">
          {index > 0 && (
            <button 
              {...backProps} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Atrás
            </button>
          )}
          <button 
            {...primaryProps} 
            className="px-4 py-2 text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-colors shadow-sm"
          >
            {isLastStep ? "¡Entendido!" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TutorialTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const tutorialCompletado = localStorage.getItem("asegurasimple_tutorial_completado");
    if (tutorialCompletado !== "true") {
      const timer = setTimeout(() => {
        setRun(true);
        // 🔥 LO GUARDAMOS APENAS ARRANCA PARA QUE NO MOLESTE AL RECARGAR (F5)
        localStorage.setItem("asegurasimple_tutorial_completado", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: any[] = [
    {
      target: "body",
      placement: "center",
      title: "¡Te damos la bienvenida! 🎉",
      content: "Vamos a dar un paseo rápido de 1 minuto para mostrarte cómo dominar tu nueva plataforma de gestión.",
      disableBeacon: true,
    },
    {
      target: ".tour-sidebar",
      title: "Tu Centro de Comando",
      content: "Desde este menú vas a poder navegar entre tus asegurados, administrar pólizas, cargar siniestros y ver tus alertas.",
      placement: "right",
    },
    {
      target: ".tour-estadisticas",
      title: "Métricas en Tiempo Real",
      content: "Acá tenés el resumen de tu cartera: total de asegurados, pólizas vigentes, y vencimientos próximos.",
      placement: "bottom",
    },
    {
      target: ".tour-actividad",
      title: "Actividad Reciente",
      content: "Este es el historial de tu agencia. Podés ver quién creó pólizas, quién agregó clientes o qué siniestros se reportaron últimamente.",
      placement: "top",
    },
    {
      target: ".tour-configuracion",
      title: "Ajustes y Equipo",
      content: "Por último, acá podés modificar tu perfil, invitar a tu equipo de trabajo y configurar tus preferencias.",
      placement: "right",
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
      styles={{
        options: {
          overlayColor: "rgba(0, 0, 0, 0.65)",
          zIndex: 10000,
        }
      }}
    />
  );
}