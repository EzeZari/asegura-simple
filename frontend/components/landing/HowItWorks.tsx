"use client";

import { UserPlus, FileSpreadsheet, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus size={32} className="text-white" />,
      title: "1. Creá tu cuenta",
      desc: "Registrate en menos de 1 minuto. Es gratis y no te pedimos tarjeta de crédito."
    },
    {
      icon: <FileSpreadsheet size={32} className="text-white" />,
      title: "2. Cargá tu cartera",
      desc: "Importá tus asegurados y pólizas desde un Excel o cargalos manualmente a tu ritmo."
    },
    {
      icon: <Zap size={32} className="text-white" />,
      title: "3. El sistema hace el resto",
      desc: "Relajate. AseguraSimple empieza a ordenar tu información y te avisa de los vencimientos."
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Empezar es así de simple
          </h2>
          <p className="text-xl text-gray-600">
            Cambiá tu forma de trabajar en solo tres pasos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
          {/* Línea conectora de fondo (solo visible en desktop) */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-green-100 z-0 w-2/3 mx-auto"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30 mb-6 border-4 border-white">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}