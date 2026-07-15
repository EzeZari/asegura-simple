"use client";

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, User } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-green-200">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="p-8 md:p-12">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  Contactanos
                </h1>
                <p className="text-lg text-gray-600">
                  ¿Tenés alguna duda sobre AseguraSimple o necesitás un plan a medida? Escribinos y te respondemos rápido.
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" id="nombre" className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-green-600 focus:border-green-600 outline-none transition-all" placeholder="Ej. Juan Pérez" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="email" id="email" className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-green-600 focus:border-green-600 outline-none transition-all" placeholder="tu@email.com" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">Mensaje</label>
                  <div className="relative">
                    <div className="absolute top-3 left-4 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea id="mensaje" rows={5} className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-green-600 focus:border-green-600 outline-none transition-all resize-none" placeholder="¿En qué te podemos ayudar?" required></textarea>
                  </div>
                </div>

                <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-green-700/30">
                  Enviar mensaje <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}