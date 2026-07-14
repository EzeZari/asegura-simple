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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-bold text-gray-900">{faq.q}</span>
                <ChevronDown 
                  className={`text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 text-gray-600"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}