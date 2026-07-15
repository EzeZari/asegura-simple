"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-black text-green-700 tracking-tight">
            AseguraSimple
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 font-medium text-gray-600">
          <Link href="#funcionalidades" className="hover:text-green-700 transition-colors">Funcionalidades</Link>
          <Link href="#precios" className="hover:text-green-700 transition-colors">Precios</Link>
          <Link href="#faq" className="hover:text-green-700 transition-colors">FAQ</Link>
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="font-semibold text-green-700 hover:text-green-800 transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="bg-green-700 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-md hover:shadow-green-700/30">
            Empezar gratis
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-green-700 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
              <Link href="#funcionalidades" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-600 hover:text-green-700">Funcionalidades</Link>
              <Link href="#precios" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-600 hover:text-green-700">Precios</Link>
              <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-gray-600 hover:text-green-700">FAQ</Link>
              
              <div className="h-px w-full bg-gray-100 my-2"></div>
              
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-green-700 text-center py-3 border border-green-200 rounded-lg bg-green-50">
                Iniciar sesión
              </Link>
              <Link href="/registro" onClick={() => setIsMobileMenuOpen(false)} className="bg-green-700 text-white text-center py-3 rounded-lg font-bold shadow-md">
                Empezar gratis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}