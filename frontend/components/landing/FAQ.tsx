"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, MessageCircleQuestion } from 'lucide-react';
import Link from 'next/link';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Mis datos y los de mis clientes están seguros?",
      a: (
        <>
          <p className="mb-3">La seguridad de tu cartera es nuestra prioridad absoluta. Operamos bajo estándares bancarios para proteger tu información:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" /> Servidores encriptados de alta seguridad.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" /> Backups diarios automáticos.</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" /> La información es 100% tuya. Podés exportarla o eliminarla en cualquier momento.</li>
          </ul>
        </>
      ),
      textOnly: "Absolutamente. Usamos servidores de alta seguridad y cifrado de datos..." // Para el Schema JSON-LD
    },
    {
      q: "¿Puedo importar mi cartera actual desde un Excel?",
      a: (
        <p>
          Sí, por supuesto. Desarrollamos una herramienta de <strong>importación masiva inteligente</strong>. Solo tenés que subir tu archivo Excel y el sistema se encarga de crear las fichas de los clientes y ordenar la información de forma automática. En menos de 5 minutos tenés todo el sistema listo para operar.
        </p>
      ),
      textOnly: "Sí. Tenemos una herramienta de importación masiva inteligente..."
    },
    {
      q: "¿Tienen soporte técnico si no entiendo algo?",
      a: (
        <p>
          Sí, y es uno de los beneficios mejor valorados por nuestros usuarios. A diferencia de otros sistemas, no te dejamos solo. Tendrás acceso a un <strong>Chat de Soporte Integrado</strong> directamente dentro de la plataforma para resolver cualquier duda al instante con nuestro equipo.
        </p>
      ),
      textOnly: "Sí, todos nuestros usuarios cuentan con acceso a un chat de soporte integrado..."
    },
    {
      q: "¿Funciona correctamente desde el celular?",
      a: (
        <p>
          Sí, AseguraSimple es una plataforma responsiva. Esto significa que la interfaz se adapta automáticamente y de manera perfecta a la pantalla de cualquier dispositivo móvil o tablet. Podés consultar una póliza, agendar un vencimiento o cargar un siniestro desde tu celular mientras estás en la calle visitando a un cliente.
        </p>
      ),
      textOnly: "Sí, AseguraSimple está diseñado para adaptarse perfectamente a cualquier pantalla..."
    },
    {
      q: "¿Qué pasa si decido cancelar mi suscripción?",
      a: (
        <p>
          Creemos en la libertad de nuestros usuarios. <strong>No hay contratos a largo plazo, cláusulas de permanencia ni letras chicas.</strong> Si en algún momento decidís dejar de usar el sistema premium, tu cuenta pasará automáticamente al plan gratuito, o bien, podés darla de baja por completo (te recomendamos exportar tu información en Excel antes de hacerlo).
        </p>
      ),
      textOnly: "No hay contratos a largo plazo. Podés cancelar cuando quieras y exportar tu información..."
    }
  ];

  // 🔥 JSON-LD para rich snippets de FAQ en Google (Usando el texto plano)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.textOnly
      }
    }))
  };

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Schema FAQPage — habilita rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-green-700 font-bold tracking-wider uppercase text-sm mb-3 block">Despejá tus dudas</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitás saber antes de dar el salto a la digitalización de tu cartera de seguros.
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
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 relative ${
                  isOpen 
                    ? 'border-green-200 shadow-lg ring-1 ring-green-50' 
                    : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Borde izquierdo verde al abrir (Detalle Premium) */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-green-600 transition-transform duration-300 origin-top ${isOpen ? 'scale-y-100' : 'scale-y-0'}`}></div>

                <button 
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group bg-transparent relative z-10"
                >
                  <span className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
                    isOpen ? 'text-green-800' : 'text-gray-900 group-hover:text-green-700'
                  }`}>
                    {faq.q}
                  </span>
                  
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
                
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isOpen ? "auto" : 0, 
                    opacity: isOpen ? 1 : 0 
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-6 pb-8 md:px-8 md:pb-8 text-gray-600 leading-relaxed border-t border-gray-50 pt-4 relative z-10 text-base md:text-lg">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Llamado a la acción secundario */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center bg-gray-50 p-8 rounded-3xl border border-gray-100"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
             <MessageCircleQuestion size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¿Tenés alguna otra consulta?</h3>
          <p className="text-gray-600 mb-6">Nuestro equipo está listo para ayudarte a evaluar si AseguraSimple es la herramienta adecuada para tu negocio.</p>
          <Link href="/contacto" className="inline-flex font-bold text-green-700 hover:text-green-800 hover:underline decoration-2 underline-offset-4 transition-all">
            Contactar al equipo de ventas
          </Link>
        </motion.div>

      </div>
    </section>
  );
}