"use client";

import { motion } from 'framer-motion';
import { FileSpreadsheet, Settings, Send } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <FileSpreadsheet size={32} className="text-blue-600" />,
      bg: "bg-blue-100",
      title: "1. Importá tu Excel",
      description: "Subí tu base de datos actual en un clic. El sistema reconoce y ordena automáticamente a tus asegurados y pólizas para que no tengas que tipear nada a mano."
    },
    {
      icon: <Settings size={32} className="text-orange-600" />,
      bg: "bg-orange-100",
      title: "2. El sistema se encarga",
      description: "AseguraSimple lee todas las fechas de vigencia, arma tu calendario de vencimientos y te muestra un semáforo de prioridades en tu panel de control."
    },
    {
      icon: <Send size={32} className="text-green-600" />,
      bg: "bg-green-100",
      title: "3. Comunicate en 1 clic",
      description: "Revisá las alertas diarias y enviá recordatorios de pago o renovación a tus clientes por WhatsApp sin moverte de la plataforma."
    }
  ];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Transición sin estrés en 3 pasos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pasarte a un sistema digital nunca fue tan fácil. Empezá a operar y enviar recordatorios en el mismo día.
          </p>
        </motion.div>

        {/* 🔥 Grilla de 3 Pasos */}
        <div className="relative">
          
          {/* Línea conectora de fondo (Solo en PC) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0"></div>

          <div className="grid md:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Ícono */}
                <div className={`w-24 h-24 rounded-full ${step.bg} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ring-8 ring-gray-50`}>
                  {step.icon}
                </div>
                
                {/* Texto */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}