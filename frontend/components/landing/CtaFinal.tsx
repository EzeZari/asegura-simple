"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CtaFinal() {
  return (
    <section className="py-24 bg-green-700 text-white text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] rounded-full bg-green-600 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[150%] rounded-full bg-green-800 blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Empezá hoy. Tu primer mes es gratis.
        </h2>
        <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
          Unite a los productores que ya digitalizaron su cartera, automatizaron sus procesos y ahorran horas de trabajo por semana.
        </p>
        
        <Link 
          href="/registro" 
          className="inline-block bg-white text-green-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          Crear mi cuenta gratis
        </Link>
        <p className="mt-6 text-green-200 text-sm font-medium">
          Sin tarjeta de crédito · Cancelás cuando quieras
        </p>
      </motion.div>
    </section>
  );
}