"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Shield, Users, Zap, Loader2, Sparkles } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore"; 

function PlanesContent() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") || "";

  const user = useAuthStore((state: any) => state.user);
  const planActual = user?.plan || null;
  
  // 🔥 Extraemos si el usuario tiene su suscripción cancelada
  const suscripcionEstado = user?.suscripcion?.estado;
  const estaCancelado = suscripcionEstado === "cancelled" || suscripcionEstado === "paused";

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [showMpModal, setShowMpModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [mpEmail, setMpEmail] = useState("");

  const planes = [
    {
      id: "GRATUITO",
      nombre: "Plan Prueba",
      precio: "Gratis",
      descripcion: "14 días para conocer la plataforma.",
      icon: Sparkles,
      features: [
        "Prueba libre por 14 días",
        "Hasta 10 asegurados",
        "1 Usuario administrador",
        "Sin tarjeta de crédito"
      ],
      color: "border-gray-200 bg-gray-50 text-gray-900",
      btnColor: "bg-white hover:bg-gray-100 text-gray-800 border border-gray-200",
      btnText: "Empezar Mis 14 Días"
    },
    {
      id: "BASICO",
      nombre: "Plan Básico",
      precio: "$9.990",
      descripcion: "Para productores independientes.",
      icon: UserIcon,
      features: [
        "Hasta 100 asegurados",
        "1 Usuario administrador",
        "Gestión de pólizas y siniestros",
        "Soporte estándar"
      ],
      color: "border-gray-200 bg-white text-gray-900",
      btnColor: "bg-gray-900 hover:bg-gray-800 text-white",
      btnText: "Suscribirme"
    },
    {
      id: "PROFESIONAL",
      nombre: "Plan Profesional",
      precio: "$14.990",
      descripcion: "Para equipos en crecimiento.",
      icon: Zap,
      features: [
        "Hasta 300 asegurados",
        "Hasta 3 usuarios (Equipo)",
        "Gestión avanzada de permisos",
        "Soporte prioritario"
      ],
      popular: true,
      color: "border-orange-500 bg-white text-gray-900 shadow-xl ring-4 ring-orange-500/10 lg:scale-105 z-10",
      btnColor: "bg-orange-600 hover:bg-orange-700 text-white shadow-md",
      btnText: "Elegir Profesional"
    },
    {
      id: "AGENCIA",
      nombre: "Plan Agencia",
      precio: "$24.990",
      descripcion: "Para carteras masivas.",
      icon: Users,
      features: [
        "Asegurados ilimitados",
        "Hasta 10 usuarios",
        "Reportes consolidados",
        "Asesor de cuenta dedicado"
      ],
      color: "border-gray-200 bg-white text-gray-900",
      btnColor: "bg-gray-900 hover:bg-gray-800 text-white",
      btnText: "Suscribirme"
    }
  ];

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
    setMpEmail(userEmail);
    setShowMpModal(true);
  };

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
      <div className="flex flex-col gap-4 text-center max-w-3xl mb-12 mt-8">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
          ¡Cuenta confirmada con éxito!
        </h1>
        <p className="text-base md:text-lg text-gray-600 font-medium">
          Elegí cómo querés arrancar en AseguraSimple. Podés usar la versión de prueba o elegir un plan según tu volumen de asegurados.
        </p>
      </div>

      {/* 🔥 GRID ACTUALIZADO: Mejoramos los gaps, anchos máximos y comportamiento en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch max-w-[1400px] w-full px-2 lg:px-8">
        {planes.map((plan) => {
          const IconComponent = plan.icon;
          
          const esPlanActualActivo = plan.id === planActual && !estaCancelado;
          const esPlanCancelado = plan.id === planActual && estaCancelado;

          return (
            <div key={plan.id} className={`border p-6 md:p-8 rounded-3xl flex flex-col relative bg-white transition-all duration-300 ${plan.color}`}>
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-md">
                  El más elegido
                </span>
              )}

              <div className="flex flex-col gap-4 mb-6">
                <div className={`p-3.5 rounded-2xl border w-fit ${plan.popular ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                  <IconComponent size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{plan.nombre}</h3>
                  {/* 🔥 CORRECCIÓN: Quitamos el 'h-8' que rompía el texto y dejamos que fluya */}
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{plan.descripcion}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 border-b border-gray-100 pb-6 mb-6">
                <span className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">{plan.precio}</span>
                {plan.id !== "GRATUITO" && <span className="text-sm md:text-base font-bold text-gray-400">/mes</span>}
              </div>

              <ul className="flex flex-col gap-4 flex-1 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                    <Check size={18} className={`mt-0.5 shrink-0 ${plan.popular ? 'text-orange-500' : 'text-green-600'}`} />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSeleccionarPlan(plan.id)}
                disabled={loadingPlan !== null || esPlanActualActivo}
                className={`w-full py-4 mt-auto rounded-xl font-bold text-sm md:text-base transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 ${
                  esPlanActualActivo ? 'bg-green-600 text-white cursor-not-allowed shadow-md' : plan.btnColor
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Procesando...
                  </>
                ) : esPlanActualActivo ? (
                  "Tu plan actual"
                ) : esPlanCancelado ? (
                  "Reactivar Plan"
                ) : (
                  plan.btnText
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-white p-5 md:p-6 rounded-2xl border border-gray-200 max-w-3xl w-full flex items-center justify-center gap-4 shadow-sm">
        <Shield size={24} className="text-green-600 shrink-0" />
        <p className="text-xs md:text-sm text-gray-600 font-medium text-center md:text-left leading-relaxed">
          Los pagos recurrentes se procesan de forma segura a través de <strong>Mercado Pago</strong>. Podés cancelar o cambiar tu suscripción en cualquier momento desde tu panel de control.
        </p>
      </div>

      {showMpModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="bg-[#009EE3]/10 p-2.5 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#009EE3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Checkout Seguro</h3>
            </div>
            
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
              Por seguridad, Mercado Pago exige que el pago se haga con la cuenta del correo ingresado. 
              Si vas a pagar usando <strong>otra cuenta</strong>, cambialo acá abajo:
            </p>
            
            <div className="space-y-2 mt-2">
               <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email de tu cuenta Mercado Pago</label>
               <input 
                 type="email" 
                 value={mpEmail} 
                 onChange={(e) => setMpEmail(e.target.value)}
                 className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-4 focus:ring-[#009EE3]/20 focus:border-[#009EE3] outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                 placeholder="tu-email@mercadopago.com"
               />
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button 
                onClick={() => { setShowMpModal(false); setLoadingPlan(null); }}
                className="w-full sm:w-auto px-6 py-3.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarPagoMP}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#009EE3] hover:bg-[#0080B7] text-white rounded-xl font-black shadow-lg shadow-[#009EE3]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Ir a pagar <Zap size={18} className="fill-current" />
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
        <Loader2 className="animate-spin text-green-600" size={40} />
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