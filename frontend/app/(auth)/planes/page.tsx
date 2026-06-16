"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Shield, Users, Zap, Loader2, Sparkles } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore"; 

function PlanesContent() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") || "";

  const { user } = useAuthStore();
  const planActual = user?.plan || null;

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  // 🔥 NUEVOS ESTADOS PARA EL MODAL DE MERCADO PAGO
  const [showMpModal, setShowMpModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [mpEmail, setMpEmail] = useState("");

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

  // 🔥 1. En vez de pagar directo, abrimos el modal
  const handleSeleccionarPlan = (planId: string) => {
    if (!userEmail) {
      setMensajeToast("Error: No se detectó el usuario. Volvé a ingresar desde el link de tu correo.");
      setShowToast(true);
      return;
    }

    if (planId === "GRATUITO") {
      setLoadingPlan("GRATUITO");
      window.location.href = "/login?verified=true";
      return;
    }

    setSelectedPlanId(planId);
    setMpEmail(userEmail); // Se lo dejamos pre-llenado por comodidad
    setShowMpModal(true);
  };

  // 🔥 2. Esta es la función que realmente va a Mercado Pago
  const confirmarPagoMP = async () => {
    if (!mpEmail.trim() || !mpEmail.includes('@')) {
      setMensajeToast("Por favor, ingresá un email válido de Mercado Pago.");
      setShowToast(true);
      return;
    }

    setShowMpModal(false);
    setLoadingPlan(selectedPlanId);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagos/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Mandamos los DOS emails (el de tu sistema, y el que va a usar para pagar)
        body: JSON.stringify({ plan: selectedPlanId, email: userEmail, mpEmail: mpEmail.trim().toLowerCase() })
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
                disabled={loadingPlan !== null || esPlanActual}
                className={`w-full py-3.5 mt-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 ${
                  esPlanActual ? 'bg-green-600 text-white cursor-not-allowed' : plan.btnColor
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Procesando...
                  </>
                ) : esPlanActual ? (
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

      {/* 🔥 MODAL DE MERCADO PAGO */}
      {showMpModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="bg-[#009EE3]/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#009EE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Email de Mercado Pago</h3>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Por seguridad, Mercado Pago exige que el pago se haga con la cuenta del correo ingresado. 
              Si vas a pagar usando <strong>otra cuenta</strong>, cambialo acá abajo:
            </p>
            
            <input 
              type="email" 
              value={mpEmail} 
              onChange={(e) => setMpEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-[#009EE3]/50 focus:border-[#009EE3] outline-none transition-all"
              placeholder="tu-email@mercadopago.com"
            />
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-50">
              <button 
                onClick={() => { setShowMpModal(false); setLoadingPlan(null); }}
                className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarPagoMP}
                className="px-5 py-2.5 bg-[#009EE3] hover:bg-[#0080B7] text-white rounded-xl font-bold shadow-md shadow-[#009EE3]/20 transition-all active:scale-95"
              >
                Ir a pagar
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}

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