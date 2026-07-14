"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.header 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* 🔥 Logo en formato texto limpio y elegante */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-black text-green-700 tracking-tight">
            AseguraSimple
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-8 font-medium text-gray-600">
          <Link href="#funcionalidades" className="hover:text-green-700 transition-colors">Funcionalidades</Link>
          <Link href="#precios" className="hover:text-green-700 transition-colors">Precios</Link>
          <Link href="#faq" className="hover:text-green-700 transition-colors">FAQ</Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="font-semibold text-green-700 hover:text-green-800 transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="bg-green-700 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-green-700/30">
            Empezar gratis
          </Link>
        </div>
      </div>
    </motion.header>
  );
}