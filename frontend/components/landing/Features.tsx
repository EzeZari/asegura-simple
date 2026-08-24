"use client";

import { motion } from 'framer-motion';
import { CalendarDays, MessageCircle, BarChart3, Mail, FileText } from 'lucide-react';

export default function Features() {
  return (
    <section id="funcionalidades" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Todo lo que necesitás para escalar tu cartera
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para que los productores de seguros ahorren tiempo y aumenten sus renovaciones.
          </p>
        </motion.div>

        <div className="space-y-24">
          
          {/* Feature 1: Calendario (Imagen a la derecha) */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <CalendarDays size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Calendario inteligente de alertas
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Visualizá tus próximos vencimientos con nuestro sistema de semáforo. Navegá por mes o agenda y detectá al instante qué pólizas están vencidas (rojo), cuáles son críticas (naranja) y cuáles están próximas a vencer (verde).
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> Filtros rápidos por compañía y ramo.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div> Toda la info de la póliza al pasar el mouse.
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 relative w-full"
            >
              <div className="absolute inset-0 bg-orange-50 rounded-[2rem] transform translate-x-4 translate-y-4 -z-10"></div>
              <img 
                src="/calendario.png" 
                alt="Calendario de Vencimientos" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* Feature 2: Estadísticas (Imagen a la izquierda) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Control total de tu negocio en tiempo real
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Olvidate de las planillas desactualizadas. Tu panel principal te da una radiografía exacta de cuántas pólizas tenés activas, qué vencimientos requieren atención inmediata y cómo se compone tu cartera.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Métricas de crecimiento actualizadas al instante.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Historial detallado de actividad de tu equipo.
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 relative w-full"
            >
              <div className="absolute inset-0 bg-green-50 rounded-[2rem] transform -translate-x-4 translate-y-4 -z-10"></div>
              <img 
                src="/estadisticas.png" 
                alt="Métricas y Estadísticas" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* Feature 3: Detalle de Póliza (Imagen a la derecha) */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <FileText size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Ficha 360º de cada póliza
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Se acabó buscar PDFs en carpetas perdidas o revisar contactos en el celular. Accedé al detalle completo de cada riesgo, historial de siniestros y documentación digital en una sola pantalla.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Guardá la póliza original y la cuponera en la nube.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> Botones de contacto rápido integrados.
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 relative w-full"
            >
              <div className="absolute inset-0 bg-blue-50 rounded-[2rem] transform translate-x-4 translate-y-4 -z-10"></div>
              {/* 🔥 ACÁ CARGAMOS LA NUEVA IMAGEN */}
              <img 
                src="/poliza.png" 
                alt="Detalle de Póliza AseguraSimple" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* Feature 4: Comunicación (Tarjetas explicativas abajo) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pt-12"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Comunicate con tus clientes en tiempo récord
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* WhatsApp */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle size={28} className="text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">WhatsApp en 1 Clic</h4>
                <p className="text-gray-600 leading-relaxed">
                  No pierdas tiempo tipeando. Al presionar el botón, generamos un mensaje pre-armado con el nombre del cliente, la compañía y la fecha exacta de vencimiento, listo para que lo envíes desde tu celular o WhatsApp Web.
                </p>
              </div>
              
              {/* Email */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail size={28} className="text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Robot de Correos</h4>
                <p className="text-gray-600 leading-relaxed">
                  Dejá que el sistema trabaje por vos. AseguraSimple detecta todos los días las pólizas que están por vencer y envía avisos preventivos por correo electrónico a tus clientes de forma 100% automática.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}