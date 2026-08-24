"use client";

import Link from 'next/link';
import { ShieldCheck, ArrowRight, BellRing } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function Hero() {
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const floatAnimation = {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <section className="relative bg-gray-50 overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-green-100/60 blur-3xl opacity-50 pointer-events-none"></div>
      
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm mb-8 border border-green-200">
          <ShieldCheck size={16} />
          <span>Sin tarjeta de crédito · Configuración en 5 minutos</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
          Gestioná tu cartera de seguros <span className="text-green-700 text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-500">sin perder ningún vencimiento</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          La plataforma todo-en-uno para productores independientes. Asegurados, pólizas, siniestros y alertas en un solo lugar.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/registro" className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl text-white bg-green-700 hover:bg-green-600 transition-all shadow-lg hover:shadow-green-700/40 flex items-center justify-center gap-2">
            Empezar gratis <ArrowRight size={20} />
          </Link>
        </motion.div>

        {/* 🔥 COMPOSICIÓN VISUAL MINIMALISTA */}
        <motion.div 
          variants={itemVariants}
          className="mt-20 relative max-w-4xl mx-auto" 
        >
          {/* Imagen central */}
          <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="bg-gray-50 flex items-center justify-center relative w-full h-auto">
              <img
                src="/dashboard.png"
                alt="Dashboard de AseguraSimple"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* 🔥 Único Widget Flotante (Arriba Derecha) */}
          <motion.div 
            animate={floatAnimation}
            className="hidden lg:flex absolute -right-20 xl:-right-56 top-16 z-20 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 items-center gap-4 w-64"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
              <BellRing size={20} className="text-orange-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Alerta del sistema</p>
              <p className="text-xs text-gray-500">3 pólizas vencen hoy</p>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </section>
  );
}