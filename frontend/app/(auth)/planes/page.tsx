"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Shield, Users, Zap, Loader2, Sparkles } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore"; // 🔥 1. Importamos el store

// 🔥 Todo el contenido va acá adentro
function PlanesContent() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") || "";

  // 🔥 2. Traemos al usuario logueado para saber su plan
  const { user } = useAuthStore();
  const planActual = user?.plan || "GRATUITO";

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const planes = [
    {
      id: "GRATUITO",
      nombre: "Plan Prueba",
      precio: "Gratis",
      descripcion: "Para conocer la plataforma.",
      icon: Sparkles,
      features: [
        "Hasta 10 asegurados",
        "1 Usuario administrador",
        "Gestión básica de pólizas",
        "Sin tarjeta de crédito"
      ],
      color: "border-gray-200 bg-gray-50 text-gray-900",
      btnColor: "bg-white hover:bg-gray-100 text-gray-800 border border-gray-200",
      btnText: "Empezar Gratis"
    },
    {
      id: "BASICO",
      nombre: "Plan Básico",
      precio: "$100",
      descripcion: "Para productores independientes.",
      icon: UserIcon,
      features: [
        "Hasta 100 asegurados",
        "1 Usuario administrador",
        "Gestión de pólizas y siniestros",
        "Notificaciones por mail"
      ],
      color: "border-gray-200 bg-white text-gray-900",
      btnColor: "bg-gray-900 hover:bg-gray-800 text-white",
      btnText: "Suscribirme"
    },
    {
      id: "PROFESIONAL",
      nombre: "Plan Profesional",
      precio: "$14.000",
      descripcion: "Para equipos en crecimiento.",
      icon: Zap,
      features: [
        "Hasta 300 asegurados",
        "Hasta 3 usuarios (Equipo)",
        "Gestión avanzada de permisos",
        "Soporte prioritario"
      ],
      popular: true,
      color: "border-orange-500 bg-white text-gray-900 shadow-lg ring-4 ring-orange-500/10 scale-105 z-10",
      btnColor: "bg-orange-600 hover:bg-orange-700 text-white shadow-md",
      btnText: "Elegir Profesional"
    },
    {
      id: "AGENCIA",
      nombre: "Plan Agencia",
      precio: "$22.000",
      descripcion: "Para carteras masivas.",
      icon: Users,
      features: [
        "Asegurados ilimitados",
        "Usuarios ilimitados",
        "Reportes consolidados",
        "Asesor dedicado"
      ],
      color: "border-gray-200 bg-white text-gray-900",
      btnColor: "bg-gray-900 hover:bg-gray-800 text-white",
      btnText: "Suscribirme"
    }
  ];

  const handleSeleccionarPlan = async (planId: string) => {
    if (!userEmail) {
      setMensajeToast("Error: No se detectó el usuario. Volvé a ingresar desde el link de tu correo.");
      setShowToast(true);
      return;
    }

    setLoadingPlan(planId);

    if (planId === "GRATUITO") {
      window.location.href = "/login?verified=true";
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagos/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, email: userEmail })
      });

      const data = await res.json();

      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || "Error desconocido al procesar el pago.");
      }
    } catch (error: any) {
      setMensajeToast(error.message || "No se pudo conectar con Mercado Pago. Inténtalo de nuevo.");
      setShowToast(true);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gray-50 overflow-x-hidden w-full">
      <div className="flex flex-col gap-3 text-center max-w-2xl mb-10 mt-6">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          ¡Cuenta confirmada con éxito!
        </h1>
        <p className="text-sm md:text-base text-gray-500 font-medium">
          Elegí cómo querés arrancar en AseguraSimple. Podés usar la versión de prueba o elegir un plan según tu volumen de asegurados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-center max-w-7xl w-full px-2">
        {planes.map((plan) => {
          const IconComponent = plan.icon;
          // 🔥 3. Comprobamos si este iterador es el plan que tiene el usuario
          const esPlanActual = plan.id === planActual;

          return (
            <div key={plan.id} className={`border p-6 rounded-3xl flex flex-col gap-6 relative bg-white transition-all ${plan.color}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                  El más elegido
                </span>
              )}

              <div className="flex flex-col gap-4">
                <div className={`p-3 rounded-2xl border w-fit ${plan.popular ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{plan.nombre}</h3>
                  <p className="text-xs text-gray-400 font-medium h-8">{plan.descripcion}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 border-b border-gray-100 pb-6">
                <span className="text-4xl font-black tracking-tight text-gray-900">{plan.precio}</span>
                {plan.id !== "GRATUITO" && <span className="text-sm font-bold text-gray-400">/mes</span>}
              </div>

              <ul className="flex flex-col gap-3.5 flex-1 mt-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-medium text-gray-600">
                    <Check size={16} className={`mt-0.5 shrink-0 ${plan.popular ? 'text-orange-500' : 'text-green-600'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSeleccionarPlan(plan.id)}
                // 🔥 4. Deshabilitamos si está cargando O si ya es su plan actual
                disabled={loadingPlan !== null || esPlanActual}
                // 🔥 5. Cambiamos las clases para que se pinte de verde si es su plan
                className={`w-full py-3.5 mt-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 ${
                  esPlanActual ? 'bg-green-600 text-white cursor-not-allowed' : plan.btnColor
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Procesando...
                  </>
                ) : esPlanActual ? (
                  // 🔥 6. Cambiamos el texto visualmente
                  "Tu plan actual"
                ) : (
                  plan.btnText
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-white p-4 rounded-2xl border border-gray-200 max-w-2xl w-full flex items-center justify-center gap-3 shadow-sm">
        <Shield size={18} className="text-green-600 shrink-0" />
        <p className="text-[11px] text-gray-500 font-medium text-center">
          Los pagos recurrentes se procesan de forma segura a través de <strong>Mercado Pago</strong>. Podés cancelar tu suscripción en cualquier momento.
        </p>
      </div>

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}

// 🔥 El export default solo hace el Suspense wrapper
export default function OnboardingPlanesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    }>
      <PlanesContent />
    </Suspense>
  );
}

function UserIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}