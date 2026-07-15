"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Mis datos y los de mis clientes están seguros?",
      a: "Absolutamente. Usamos servidores de alta seguridad y cifrado de datos. Tu información es tuya, no la compartimos con nadie y podés exportarla o borrarla cuando quieras."
    },
    {
      q: "¿Puedo importar mi cartera actual desde un Excel?",
      a: "Sí. Tenemos una herramienta de importación masiva para que no tengas que cargar tus asegurados y pólizas uno por uno. En minutos tenés todo el sistema listo."
    },
    {
      q: "¿Qué pasa si cancelo mi suscripción?",
      a: "No hay contratos a largo plazo ni letras chicas. Si cancelás, tu cuenta pasa al plan gratuito o podés darla de baja por completo exportando toda tu información previamente."
    },
    {
      q: "¿Funciona en el celular?",
      a: "Sí, AseguraSimple está diseñado para adaptarse perfectamente a cualquier pantalla. Podés consultar una póliza o cargar un siniestro desde tu celular mientras estás en la calle."
    },
    {
      q: "¿Cómo funcionan los avisos de vencimiento?",
      a: "El sistema lee automáticamente las fechas de vigencia de tus pólizas cargadas y te muestra alertas en tu panel principal. En los planes premium, además, te manda un resumen por email."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Resolvemos tus dudas para que puedas dar el salto a la digitalización con total tranquilidad.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'border-green-200 shadow-md ring-1 ring-green-50' 
                    : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                >
                  <span className={`text-lg font-bold transition-colors duration-300 ${
                    isOpen ? 'text-green-700' : 'text-gray-900 group-hover:text-green-700'
                  }`}>
                    {faq.q}
                  </span>
                  
                  {/* Contenedor del ícono con fondo dinámico */}
                  <div className={`ml-4 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    isOpen 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-600'
                  }`}>
                    <ChevronDown 
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                      size={20} 
                    />
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}