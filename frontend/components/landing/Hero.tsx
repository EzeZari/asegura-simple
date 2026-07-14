"use client";

import Link from 'next/link';
import { ShieldCheck, ArrowRight, PlayCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion'; // 🔥 Importamos Variants acá

export default function Hero() {
  
  // 🔥 Le aclaramos a TypeScript que esto es del tipo "Variants"
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  // 🔥 Lo mismo acá
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative bg-gray-50 overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
      {/* Círculo decorativo de fondo */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-green-100/60 blur-3xl opacity-50 pointer-events-none"></div>
      
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Etiqueta superior */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm mb-8 border border-green-200">
          <ShieldCheck size={16} />
          <span>Sin tarjeta de crédito · Configuración en 5 minutos</span>
        </motion.div>
        
        {/* Título principal */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
          Gestioná tu cartera de seguros <span className="text-green-700 text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-500">sin perder ningún vencimiento</span>
        </motion.h1>
        
        {/* Subtítulo */}
        <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          La plataforma todo-en-uno para productores independientes. Asegurados, pólizas, siniestros y alertas en un solo lugar.
        </motion.p>
        
        {/* Botones de acción */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/registro" className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl text-white bg-green-700 hover:bg-green-600 transition-all shadow-lg hover:shadow-green-700/40 flex items-center justify-center gap-2">
            Empezar gratis <ArrowRight size={20} />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
            <PlayCircle size={20} className="text-green-600" /> Ver demo
          </button>
        </motion.div>

        {/* Captura de pantalla animada */}
        <motion.div 
          variants={itemVariants}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white transform hover:-translate-y-2 transition-transform duration-500">
            
            {/* Barra superior estilo navegador de Mac */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            {/* Contenedor de la imagen */}
            <div className="bg-gray-50 flex items-center justify-center relative w-full h-auto">
              <img
              src="/dashboard.png"
              alt="Dashboard de AseguraSimple"
              className="w-full h-auto object-cover"
              />
            </div>

          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}