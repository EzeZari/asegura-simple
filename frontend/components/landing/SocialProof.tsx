"use client";

import { motion } from 'framer-motion';
// import Image from 'next/image'; // 🔥 Descomentá esto cuando tengas las imágenes

export default function SocialProof() {
  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="max-w-7xl mx-auto px-4 text-center"
      >
        {/* 🔥 TEXTO LEGALMENTE SEGURO */}
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
          Gestioná en un solo lugar pólizas de:
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          
          {/* OPCIÓN 1: Si querés seguir usando solo texto por seguridad */}
          <span className="font-bold text-xl">SANCOR</span>
          <span className="font-bold text-xl">ZURICH</span>
          <span className="font-bold text-xl">LA SEGUNDA</span>
          <span className="font-bold text-xl">MERCANTIL</span>

          {/* OPCIÓN 2: Si te bajás los logos, borrá los <span> de arriba y usá esto: */}
          {/* 
          <Image src="/sancor-logo.png" alt="Sancor" width={120} height={40} className="object-contain" />
          <Image src="/zurich-logo.png" alt="Zurich" width={120} height={40} className="object-contain" />
          <Image src="/lasegunda-logo.png" alt="La Segunda" width={120} height={40} className="object-contain" />
          <Image src="/mercantil-logo.png" alt="Mercantil" width={120} height={40} className="object-contain" /> 
          */}
        </div>
      </motion.div>
    </section>
  );
}