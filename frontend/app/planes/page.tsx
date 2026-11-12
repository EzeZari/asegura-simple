"use client";

import { Suspense, useState } from "react";
import { 
  Check, 
  Shield, 
  Users, 
  Zap, 
  Loader2, 
  Sparkles, 
  ChevronDown, 
  Minus,
  CheckCircle2,
  Building2,
  User as UserIconLucide
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

function PlanesContent() {
  const user = useAuthStore((state: any) => state.user);
  const userEmail = user?.email || "";
  const planActual = user?.plan || null;
  const suscripcionEstado = user?.suscripcion?.estado;
  const estaCancelado = suscripcionEstado === "cancelled" || suscripcionEstado === "paused";

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [showMpModal, setShowMpModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [mpEmail, setMpEmail] = useState("");
  const [codigoDescuento, setCodigoDescuento] = useState("");
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const planes = [
    {
      id: "GRATUITO",
      nombre: "Prueba",
      precio: "Gratis",
      descripcion: "14 días libres para conocer la plataforma a fondo.",
      icon: Sparkles,
      iconColor: "text-gray-600",
      iconBg: "bg-gray-100",
      features: [
        "Prueba libre por 14 días",
        "Hasta 10 asegurados",
        "1 Usuario administrador",
        "Módulo de Cobranzas",
      ],
      color: "bg-white border border-gray-200 shadow-sm",
      btnColor: "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      btnText: "Empezar Mis 14 Días",
      highlighted: false,
    },
    {
      id: "BASICO",
      nombre: "Básico",
      precio: "$9.990",
      descripcion: "Ideal para productores independientes.",
      icon: UserIconLucide,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      features: [
        "Hasta 100 asegurados",
        "1 Usuario administrador",
        "Módulo de Cobranzas",
        "25 Lecturas de PDF con IA",
      ],
      color: "bg-white border border-gray-200 shadow-sm",
      btnColor: "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      btnText: "Elegir Básico",
      highlighted: false,
    },
    {
      id: "PROFESIONAL",
      nombre: "Profesional",
      precio: "$14.990",
      descripcion: "Para equipos y carteras en pleno crecimiento.",
      icon: Zap,
      iconColor: "text-green-700",
      iconBg: "bg-green-100",
      features: [
        "Hasta 300 asegurados",
        "Hasta 3 usuarios (Equipo)",
        "Importación masiva Excel",
        "50 Lecturas de PDF con IA",
      ],
      popular: true,
      color: "bg-gradient-to-b from-white to-green-50/50 ring-2 ring-green-600 shadow-2xl xl:-my-4 z-10",
      btnColor: "bg-green-700 text-white hover:bg-green-800 shadow-lg hover:shadow-green-700/30",
      btnText: "Elegir Profesional",
      highlighted: true,
      badge: "EL MÁS ELEGIDO"
    },
    {
      id: "AGENCIA",
      nombre: "Agencia",
      precio: "$24.990",
      descripcion: "Para carteras masivas y grandes estructuras.",
      icon: Building2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      features: [
        "Asegurados ilimitados",
        "Hasta 10 usuarios",
        "Gestión de permisos avanzados",
        "200 Lecturas de PDF con IA",
      ],
      color: "bg-white border border-gray-200 shadow-sm",
      btnColor: "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      btnText: "Elegir Agencia",
      highlighted: false,
    },
  ];

  const comparisonFeatures = [
    { 
      feature: "Usuarios (Equipo)", 
      prueba: "1", 
      basico: "1", 
      profesional: "Hasta 3", 
      agencia: "Hasta 10" 
    },
    { 
      feature: "Asegurados en base de datos", 
      prueba: "Hasta 10", 
      basico: "Hasta 100", 
      profesional: "Hasta 300", 
      agencia: "Ilimitados" 
    },
    { 
      feature: "Lecturas de PDF con IA (Pólizas)", 
      prueba: "-", 
      basico: "25 por mes", 
      profesional: "50 por mes", 
      agencia: "200 por mes" 
    },
    { 
      feature: "Importación masiva desde Excel", 
      prueba: true, 
      basico: true, 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Gestión de Renovaciones y Siniestros", 
      prueba: true, 
      basico: true, 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Módulo de Cobranzas (Refacturación)", 
      prueba: true, 
      basico: true, 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Avisos WhatsApp en un clic", 
      prueba: true, 
      basico: true, 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Avisos por correo automáticos", 
      prueba: "-", 
      basico: true, 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Plantillas de mensajes personalizables", 
      prueba: "-", 
      basico: true, 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Sistema de Roles y Permisos", 
      prueba: "-", 
      basico: "-", 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Reportes y Métricas (Dashboard)", 
      prueba: "-", 
      basico: "-", 
      profesional: true, 
      agencia: true 
    },
    { 
      feature: "Soporte Técnico", 
      prueba: "Comunidad", 
      basico: "Estándar", 
      profesional: "Prioritario", 
      agencia: "Dedicado" 
    }
  ];

  const renderCheckOrText = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? <Check size={20} className="text-green-500 mx-auto" /> : <Minus size={20} className="text-gray-300 mx-auto" />;
    }
    if (value === "-") {
      return <Minus size={20} className="text-gray-300 mx-auto" />;
    }
    return <span className="text-gray-600 font-medium">{value}</span>;
  };

  const handleSeleccionarPlan = (planId: string) => {
    if (!user?.email) {
      window.location.href = "/login?redirect=%2Fplanes";
      return;
    }

    if (planId === "GRATUITO") {
      setMensajeToast("Para activar tu prueba gratuita, necesitás completar el proceso de activación de la cuenta.");
      setShowToast(true);
      return;
    }

    setSelectedPlanId(planId);
    setMpEmail(user.email);
    setCodigoDescuento("");
    setShowMpModal(true);
  };

  const confirmarPagoMP = async () => {
    if (!mpEmail.trim() || !mpEmail.includes("@")) {
      setMensajeToast("Por favor, ingresá un email válido de Mercado Pago.");
      setShowToast(true);
      return;
    }

    if (!userEmail) {
      setMensajeToast("Tu sesión expiró. Volvé a iniciar sesión para continuar.");
      setShowToast(true);
      setShowMpModal(false);
      return;
    }

    setShowMpModal(false);
    setLoadingPlan(selectedPlanId);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pagos/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlanId,
          email: userEmail,
          mpEmail: mpEmail.trim().toLowerCase(),
          codigoDescuento: codigoDescuento.trim().toUpperCase(),
        }),
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 md:py-16 bg-gray-50 w-full overflow-hidden">
      <div className="mb-6 md:mb-8 flex justify-center">
        <img
          src="/logo.png"
          alt="AseguraSimple"
          className="h-10 md:h-14 lg:h-16 object-contain drop-shadow-md transition-transform hover:scale-105"
        />
      </div>

      <div className="flex flex-col gap-4 text-center max-w-3xl mb-14">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
          Elegí tu plan ideal
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 font-medium px-2">
          Arrancá con la versión de prueba de 14 días gratis, o potenciá tu agencia con las herramientas de nuestros planes avanzados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl px-2 lg:px-8 items-center w-full">
        {planes.map((plan, index) => {
          const IconComponent = plan.icon;
          const esPlanActualActivo = plan.id === planActual && !estaCancelado;
          const esPlanCancelado = plan.id === planActual && estaCancelado;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${plan.color}`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-md whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${plan.iconBg}`}>
                  <IconComponent size={26} className={plan.iconColor} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">{plan.nombre}</h3>
              </div>
              
              <p className="text-gray-500 text-sm h-10 mb-6 leading-relaxed">
                {plan.descripcion}
              </p>
              
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-end gap-1">
                  {plan.precio === "Gratis" ? (
                    <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.precio}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.precio}</span>
                      <span className="text-gray-500 font-medium mb-2">/mes</span>
                    </>
                  )}
                </div>
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 size={20} className={`shrink-0 ${plan.highlighted ? 'text-green-600' : 'text-gray-300'}`} />
                    <span className="text-sm font-medium leading-tight">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSeleccionarPlan(plan.id)}
                disabled={loadingPlan !== null || esPlanActualActivo}
                className={`w-full py-3.5 mt-auto rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 ${
                  esPlanActualActivo
                    ? "bg-green-600 text-white cursor-not-allowed shadow-md border-transparent"
                    : plan.btnColor
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Procesando...
                  </>
                ) : esPlanActualActivo ? (
                  "Tu plan actual"
                ) : esPlanCancelado ? (
                  "Reactivar Plan"
                ) : (
                  plan.btnText
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-5xl w-full mx-auto mt-12 px-2 lg:px-8"
      >
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <button
              onClick={() => setIsCompareOpen(!isCompareOpen)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all duration-300"
            >
              {isCompareOpen ? 'Ocultar características' : 'Ver comparativa detallada'}
              <ChevronDown size={18} className={`transition-transform duration-300 ${isCompareOpen ? 'rotate-180 text-green-600' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isCompareOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs w-1/3">Funcionalidad</th>
                      <th className="p-5 font-bold text-gray-900 text-center w-1/6 text-sm">Prueba</th>
                      <th className="p-5 font-bold text-gray-900 text-center w-1/6 text-sm">Básico</th>
                      <th className="p-5 font-bold text-green-700 text-center w-1/6 text-sm bg-green-50/50">Profesional</th>
                      <th className="p-5 font-bold text-gray-900 text-center w-1/6 text-sm">Agencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comparisonFeatures.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 px-5 text-sm font-medium text-gray-800">{item.feature}</td>
                        <td className="p-4 text-center text-sm">{renderCheckOrText(item.prueba)}</td>
                        <td className="p-4 text-center text-sm">{renderCheckOrText(item.basico)}</td>
                        <td className="p-4 text-center text-sm bg-green-50/30">{renderCheckOrText(item.profesional)}</td>
                        <td className="p-4 text-center text-sm">{renderCheckOrText(item.agencia)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-16 bg-white p-5 md:p-6 rounded-2xl border border-gray-200 max-w-3xl w-full flex items-center justify-center gap-4 shadow-sm px-6">
        <Shield size={24} className="text-green-600 shrink-0" />
        <p className="text-sm text-gray-600 font-medium text-center md:text-left leading-relaxed">
          Los pagos recurrentes se procesan de forma segura a través de{" "}
          <strong>Mercado Pago</strong>. Podés cancelar en cualquier momento.
        </p>
      </div>

      {showMpModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
              <div className="bg-[#009EE3]/10 p-2.5 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#009EE3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Checkout Seguro
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Por seguridad, Mercado Pago exige que el pago se haga con la cuenta del correo ingresado. Si vas a pagar usando <strong>otra cuenta</strong>, cambialo acá abajo:
            </p>

            <div className="space-y-2 mt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Email de tu cuenta Mercado Pago
              </label>
              <input
                type="email"
                value={mpEmail}
                onChange={(e) => setMpEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-4 focus:ring-[#009EE3]/20 focus:border-[#009EE3] outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                placeholder="tu-email@mercadopago.com"
              />
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                Código de Descuento (Opcional)
              </label>
              <input
                type="text"
                value={codigoDescuento}
                onChange={(e) => setCodigoDescuento(e.target.value.toUpperCase())}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:font-medium placeholder:text-gray-400 uppercase"
                placeholder="Ej: ASEGURA20"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => { setShowMpModal(false); setLoadingPlan(null); }}
                className="w-full sm:w-auto px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPagoMP}
                disabled={loadingPlan !== null}
                className="w-full sm:w-auto px-8 py-3 bg-[#009EE3] hover:bg-[#0080B7] text-white rounded-xl font-black shadow-lg shadow-[#009EE3]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 className="animate-spin text-green-600" size={40} /></div>}>
      <PlanesContent />
    </Suspense>
  );
}