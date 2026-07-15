"use client";

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mail, MessageSquare, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { validarRequerido, validarEmail } from '@/utils/validaciones';

export default function ContactoPage() {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [errores, setErrores] = useState({ nombre: '', email: '', mensaje: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (errores[id as keyof typeof errores]) {
      setErrores(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errNombre = validarRequerido(formData.nombre, "Nombre");
    const errEmail = validarEmail(formData.email, true); 
    const errMensaje = validarRequerido(formData.mensaje, "Mensaje");

    setErrores({ nombre: errNombre, email: errEmail, mensaje: errMensaje });

    if (!errNombre && !errEmail && !errMensaje) {
      setIsSubmitting(true);
      
      try {
        // En producción usa la variable de entorno, en local usa el 3001
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const respuesta = await fetch(`${API_URL}/api/contacto`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (respuesta.ok) {
          setIsSubmitting(false);
          setIsSuccess(true);
        } else {
          setIsSubmitting(false);
          alert('Hubo un inconveniente al enviar el mensaje. Por favor, intentá de nuevo más tarde.');
        }
      } catch (error) {
        setIsSubmitting(false);
        alert('No pudimos conectar con el servidor. Por favor, revisá tu conexión a internet e intentá de nuevo.');
      }
    }
  };

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
            <div className="p-8 md:p-12 relative min-h-[500px] flex flex-col justify-center">
              
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full"
                  >
                    <div className="text-center mb-10">
                      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Contactanos
                      </h1>
                      <p className="text-lg text-gray-600">
                        ¿Tenés alguna duda sobre AseguraSimple o necesitás un plan a medida? Escribinos y te respondemos rápido.
                      </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">Nombre completo</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className={`h-5 w-5 ${errores.nombre ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input 
                            type="text" id="nombre" value={formData.nombre} onChange={handleChange}
                            className={`block w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all ${
                              errores.nombre ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/50' : 'border-gray-200 focus:ring-green-600 focus:border-green-600'
                            }`} 
                            placeholder="Ej. Juan Pérez" 
                          />
                        </div>
                        {errores.nombre && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> {errores.nombre}</motion.p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className={`h-5 w-5 ${errores.email ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <input 
                            type="email" id="email" value={formData.email} onChange={handleChange}
                            className={`block w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all ${
                              errores.email ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/50' : 'border-gray-200 focus:ring-green-600 focus:border-green-600'
                            }`} 
                            placeholder="tu@email.com" 
                          />
                        </div>
                        {errores.email && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> {errores.email}</motion.p>}
                      </div>

                      <div>
                        <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">Mensaje</label>
                        <div className="relative">
                          <div className="absolute top-3 left-4 pointer-events-none">
                            <MessageSquare className={`h-5 w-5 ${errores.mensaje ? 'text-red-400' : 'text-gray-400'}`} />
                          </div>
                          <textarea 
                            id="mensaje" rows={5} value={formData.mensaje} onChange={handleChange}
                            className={`block w-full pl-11 pr-4 py-3 border rounded-xl outline-none transition-all resize-none ${
                              errores.mensaje ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/50' : 'border-gray-200 focus:ring-green-600 focus:border-green-600'
                            }`} 
                            placeholder="¿En qué te podemos ayudar?" 
                          ></textarea>
                        </div>
                        {errores.mensaje && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> {errores.mensaje}</motion.p>}
                      </div>

                      <button 
                        type="submit" disabled={isSubmitting}
                        className={`w-full text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                          isSubmitting ? 'bg-green-500 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 hover:shadow-green-700/30'
                        }`}
                      >
                        {isSubmitting ? 'Enviando...' : 'Enviar mensaje'} 
                        {!isSubmitting && <Send size={20} />}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 w-full h-full"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                      <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">¡Mensaje enviado!</h2>
                    <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
                      Gracias por contactarte con nosotros. Vamos a leer tu mensaje y te responderemos a <strong>{formData.email}</strong> a la brevedad.
                    </p>
                    <button 
                      onClick={() => { setIsSuccess(false); setFormData({ nombre: '', email: '', mensaje: '' }); }}
                      className="text-green-700 font-bold hover:text-green-800 transition-colors bg-green-50 px-6 py-3 rounded-lg"
                    >
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}