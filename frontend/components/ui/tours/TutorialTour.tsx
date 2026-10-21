"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";

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

export default function TutorialTour() {
  const [run, setRun] = useState(false);
  const puedeMostrarTour = useAuthStore((state: any) => state.puedeMostrarTour);

  useEffect(() => {
    if (!puedeMostrarTour) return;

    const tutorialCompletado = localStorage.getItem("asegurasimple_tutorial_completado");
    if (tutorialCompletado !== "true") {
      const timer = setTimeout(() => {
        setRun(true);
        localStorage.setItem("asegurasimple_tutorial_completado", "true");
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [puedeMostrarTour]);

  // 🔥 AGREGADO: disableBeacon: true EN TODOS LOS PASOS
  const steps: any[] = [
    { target: "body", placement: "center", title: "¡Te damos la bienvenida! 🎉", content: "Vamos a dar un paseo rápido de 1 minuto para mostrarte cómo dominar tu nueva plataforma de gestión.", disableBeacon: true },
    { target: ".tour-sidebar", title: "Tu Centro de Comando", content: "Desde este menú vas a poder navegar entre tus asegurados, administrar pólizas, cargar siniestros y ver tus alertas.", placement: "right", disableBeacon: true },
    { target: ".tour-estadisticas", title: "Métricas en Tiempo Real", content: "Acá tenés el resumen de tu cartera: total de asegurados, pólizas vigentes, y vencimientos próximos.", placement: "bottom", disableBeacon: true },
    { target: ".tour-actividad", title: "Actividad Reciente", content: "Este es el historial de tu agencia. Podés ver quién creó pólizas, quién agregó clientes o qué siniestros se reportaron últimamente.", placement: "top", disableBeacon: true },
    { target: ".tour-configuracion", title: "Ajustes y Equipo", content: "Por último, acá podés modificar tu perfil, invitar a tu equipo de trabajo y configurar tus preferencias.", placement: "right", disableBeacon: true }
  ];

  const handleJoyrideCallback = (data: any) => {
    // 🔥 AGREGADO: CAPTURAMOS TAMBIÉN LA ACCIÓN DE "CLOSE"
    const { status, action } = data;
    if (status === "finished" || status === "skipped" || action === "close") {
      setRun(false);
    }
  };

  if (!run) return null;

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