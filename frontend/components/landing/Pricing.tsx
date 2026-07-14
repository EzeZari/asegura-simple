"use client";

import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Pricing() {
  const plans = [
    {
      name: "Plan Prueba",
      price: "Gratis",
      period: "",
      desc: "14 días para conocer la plataforma.",
      features: [
        "Prueba libre por 14 días", 
        "Hasta 10 asegurados", 
        "1 Usuario administrador", 
        "Sin tarjeta de crédito"
      ],
      cta: "Empezar Mis 14 Días",
      href: "/registro",
      highlighted: false
    },
    {
      name: "Plan Básico",
      price: "$9.990",
      period: "/mes",
      desc: "Para productores independientes.",
      features: [
        "Hasta 100 asegurados", 
        "1 Usuario administrador", 
        "Gestión de pólizas y siniestros", 
        "Soporte estándar"
      ],
      cta: "Suscribirme",
      href: "/registro",
      highlighted: false
    },
    {
      name: "Plan Profesional",
      price: "$14.990",
      period: "/mes",
      desc: "Para equipos en crecimiento.",
      features: [
        "Hasta 300 asegurados", 
        "Hasta 3 usuarios (Equipo)", 
        "Gestión avanzada de permisos", 
        "Soporte prioritario"
      ],
      cta: "Elegir Profesional",
      href: "/registro",
      highlighted: true,
      badge: "EL MÁS ELEGIDO"
    },
    {
      name: "Plan Agencia",
      price: "$24.990",
      period: "/mes",
      desc: "Para carteras masivas.",
      features: [
        "Asegurados ilimitados", 
        "Hasta 10 usuarios", 
        "Reportes consolidados", 
        "Asesor de cuenta dedicado"
      ],
      cta: "Elegir Agencia",
      href: "/registro",
      highlighted: false
    }
  ];

  return (
    <section id="precios" className="py-24 bg-gray-50 overflow-hidden">
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
            Arrancá con la versión de prueba de 14 días gratis, o potenciá tu agencia con las herramientas de nuestros planes avanzados.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl p-8 shadow-sm flex flex-col h-full transition-transform hover:-translate-y-1 ${
                plan.highlighted 
                  ? 'border-2 border-green-600 shadow-xl lg:-my-4 z-10' 
                  : 'border border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-md whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm h-10">{plan.desc}</p>
              </div>
              
              <div className="mb-8">
                <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
              </div>
              
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle2 size={20} className={`shrink-0 ${plan.highlighted ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href={plan.href}
                className={`w-full py-4 rounded-xl font-bold text-center transition-all ${
                  plan.highlighted
                    ? 'bg-green-700 text-white hover:bg-green-800 shadow-lg hover:shadow-green-700/30'
                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-green-600 hover:bg-green-50'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}