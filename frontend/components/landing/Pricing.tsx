"use client";

import { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronDown, 
  Check, 
  Minus, 
  Rocket, 
  User, 
  Users, 
  Building2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Pricing() {
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const plans = [
    {
      name: "Prueba",
      icon: Rocket,
      iconColor: "text-gray-600",
      iconBg: "bg-gray-100",
      oldPrice: null,
      price: "Gratis",
      period: "",
      desc: "14 días libres para conocer la plataforma a fondo.",
      features: [
        "Prueba libre por 14 días", 
        "Hasta 10 asegurados", 
        "1 Usuario administrador", 
        "Módulo de Cobranzas"
      ],
      cta: "Empezar Mis 14 Días",
      href: "/registro",
      highlighted: false
    },
    {
      name: "Básico",
      icon: User,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      oldPrice: null,
      price: "$9.990",
      period: "/mes",
      desc: "Ideal para productores independientes.",
      features: [
        "Hasta 100 asegurados", 
        "1 Usuario administrador", 
        "Módulo de Cobranzas", 
        "25 Lecturas de PDF con IA"
      ],
      cta: "Elegir Básico",
      href: "/registro",
      highlighted: false
    },
    {
      name: "Profesional",
      icon: Users,
      iconColor: "text-green-700",
      iconBg: "bg-green-100",
      oldPrice: null,
      price: "$14.990",
      period: "/mes",
      desc: "Para equipos y carteras en pleno crecimiento.",
      features: [
        "Hasta 300 asegurados", 
        "Hasta 3 usuarios (Equipo)", 
        "Importación masiva Excel", 
        "50 Lecturas de PDF con IA"
      ],
      cta: "Elegir Profesional",
      href: "/registro",
      highlighted: true,
      badge: "EL MÁS ELEGIDO"
    },
    {
      name: "Agencia",
      icon: Building2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      oldPrice: null,
      price: "$24.990",
      period: "/mes",
      desc: "Para carteras masivas y grandes estructuras.",
      features: [
        "Asegurados ilimitados", 
        "Hasta 10 usuarios", 
        "Gestión de permisos avanzados", 
        "200 Lecturas de PDF con IA"
      ],
      cta: "Elegir Agencia",
      href: "/registro",
      highlighted: false
    }
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

  return (
    // 🔥 FIX 1: Cambié "py-24" por "pt-24 pb-12" para achicar el espacio inferior
    <section id="precios" className="pt-24 pb-12 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Elegí tu plan ideal
          </h2>
          <p className="text-xl text-gray-600">
            Arrancá hoy mismo con tus 14 días gratis y dejá que el sistema automatice tu gestión diaria por vos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-white to-green-50/50 ring-2 ring-green-600 shadow-2xl lg:-my-4 z-10' 
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-md whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${plan.iconBg}`}>
                  <plan.icon size={26} className={plan.iconColor} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">{plan.name}</h3>
              </div>
              
              <p className="text-gray-500 text-sm h-10 mb-6 leading-relaxed">
                {plan.desc}
              </p>
              
              <div className="mb-6 pb-6 border-b border-gray-100">
                {plan.oldPrice && (
                  <div className="text-sm font-semibold text-gray-400 line-through mb-1">
                    {plan.oldPrice}
                  </div>
                )}
                <div className="flex items-end gap-1">
                  {plan.price === "Gratis" ? (
                    <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                      <span className="text-gray-500 font-medium mb-2">{plan.period}</span>
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
              
              <Link 
                href={plan.href}
                className={`w-full py-3.5 rounded-xl font-bold text-center transition-all ${
                  plan.highlighted
                    ? 'bg-green-700 text-white hover:bg-green-800 shadow-lg hover:shadow-green-700/30 active:scale-[0.98]'
                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mt-12"
        >
          {/* 🔥 FIX 2: El margen inferior (mb-8) ahora solo se aplica si la tabla está abierta */}
          <div className={`relative flex items-center justify-center ${isCompareOpen ? 'mb-8' : 'mb-0'}`}>
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

      </div>
    </section>
  );
}