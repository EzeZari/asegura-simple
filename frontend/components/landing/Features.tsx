"use client";

import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  MessageCircle, 
  BarChart3, 
  Mail, 
  FileText, 
  Wallet, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import ZoomableImage from '@/components/ui/ZoomableImage';

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
            Todo lo que necesitás para escalar tu cartera de seguros
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para que los productores de seguros ahorren tiempo, cobren más rápido y aumenten sus renovaciones.
          </p>
        </motion.div>

        <div className="space-y-28">
          
          {/* 🔥 FEATURE DESTACADA: INTELIGENCIA ARTIFICIAL */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 bg-gray-50/50 rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-sm">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] mb-6 uppercase tracking-widest shadow-sm">
                <Sparkles size={14} /> Inteligencia Artificial
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Cargá pólizas desde un PDF en segundos.
              </h3>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                Subí la póliza emitida por la compañía y nuestra Inteligencia Artificial lee el documento para extraer DNI, vigencia, coberturas y cuotas de refacturación. <strong>Vos solo revisás y guardás.</strong>
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  Extracción automática de datos del tomador y vigencia.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  Detección inteligente del plan de pagos y cuotas.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  Olvidate de tipear a mano y cometé cero errores.
                </li>
              </ul>
              
              <a href="#precios" className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-800 transition-colors group">
                Ver planes con IA <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2 w-full"
            >
              {/* Diseño UI Claro (PDF a Formulario) */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col p-2">
                
                {/* Cabecera estilo navegador */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2 rounded-t-2xl">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 mx-auto">AseguraSimple - Nueva Póliza</span>
                </div>
                
                {/* Contenedor principal de la UI animada */}
                <div className="p-5 md:p-8 flex flex-col md:flex-row items-center justify-center gap-4 bg-gray-50/30">
                  
                  {/* Bloque Izquierdo: El PDF */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 w-full md:w-4/12 shadow-sm flex flex-col gap-4 relative z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm shrink-0">PDF</div>
                      {/* 🔥 NUEVO DATO */}
                      <span className="text-sm font-bold text-gray-800 truncate">Poliza_Allianz...</span>
                    </div>
                    {/* Líneas simulando texto del PDF */}
                    <div className="space-y-2.5">
                      <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
                      <div className="h-2.5 bg-emerald-200 rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-2.5 bg-gray-200 rounded-full w-5/6"></div>
                      <div className="h-2.5 bg-emerald-200 rounded-full w-1/2 animate-pulse"></div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 font-medium">320 KB • 4 páginas</span>
                  </div>
                  
                  {/* Flecha Central con IA */}
                  <div className="flex flex-col items-center justify-center shrink-0 relative z-0 mx-2 my-4 md:my-0">
                    <div className="bg-blue-600 text-white p-2.5 rounded-full shadow-md relative z-10">
                      <Sparkles size={18} className="animate-pulse" />
                    </div>
                    <ArrowRight size={24} className="text-gray-300 md:rotate-0 rotate-90 absolute md:-right-5 md:top-1/2 md:-translate-y-1/2 -bottom-5 -translate-x-1/2 md:translate-x-0" />
                  </div>
                  
                  {/* Bloque Derecho: Formulario Autocompletado */}
                  <div className="bg-white border-2 border-blue-500/20 rounded-2xl p-4 md:p-5 w-full md:w-7/12 shadow-md relative z-10 shrink-0">
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-50 pb-2">
                      Formulario Pre-Llenado
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-end border-b border-gray-50 pb-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 shrink-0 mr-2">TOMADOR</span>
                        {/* 🔥 NUEVO DATO */}
                        <span className="text-xs font-bold text-gray-900 text-right truncate">Martínez, Carlos E.</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-50 pb-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 shrink-0 mr-2">COMPAÑÍA</span>
                        {/* 🔥 NUEVO DATO */}
                        <span className="text-xs font-bold text-gray-900 text-right truncate">Allianz</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-50 pb-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 shrink-0 mr-2">PÓLIZA N°</span>
                        {/* 🔥 NUEVO DATO */}
                        <span className="text-xs font-bold text-gray-900 text-right truncate">234-9812736-01</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-gray-50 pb-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 shrink-0 mr-2">VEHÍCULO</span>
                        {/* 🔥 NUEVO DATO */}
                        <span className="text-xs font-bold text-gray-900 text-right truncate">VW Taos Highline</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-semibold text-gray-400 shrink-0 mr-2">VIGENCIA</span>
                        {/* 🔥 NUEVO DATO */}
                        <span className="text-xs font-bold text-gray-900 text-right truncate">10/11/26 - 10/11/27</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-emerald-50 text-emerald-700 text-xs font-bold p-2 rounded-lg flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} /> ¡Listo para emitir!
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </div>

          {/* FEATURE 1: REFACTURACIÓN */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Wallet size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Módulo de Refacturación y Cobranzas
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Separamos la gestión de cobranzas de tus renovaciones para que no se te escape ni un pago. Llevá el control exacto de las cuotas mensuales de tu cartera y detectá la mora al instante.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div> 
                  Monitoreo automático de morosos en tiempo real.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div> 
                  Reclamos de deuda por WhatsApp con 1 clic.
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
              <div className="absolute inset-0 bg-emerald-50 rounded-[2rem] transform -translate-x-4 translate-y-4 -z-10"></div>
              <ZoomableImage 
                src="/cobranzas.png" 
                alt="Módulo de Refacturación AseguraSimple" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* FEATURE 2: CALENDARIO */}
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
                Visualizá tus próximos vencimientos con nuestro sistema de semáforo. Navegá por mes o agenda y detectá al instante qué pólizas de renovación están vencidas (rojo), críticas (naranja) o próximas (verde).
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div> 
                  Filtros rápidos por compañía y ramo.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></div> 
                  Toda la info del riesgo al pasar el mouse.
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
              <ZoomableImage 
                src="/calendario.png" 
                alt="Calendario de vencimientos de pólizas para PAS" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* FEATURE 3: ESTADÍSTICAS */}
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
                Olvidate de las planillas desactualizadas. Tu panel principal te da una radiografía exacta de cuántas pólizas tenés activas, tu dinero en la calle (mora) y cómo se compone tu cartera.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div> 
                  Métricas de crecimiento actualizadas al instante.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div> 
                  Historial detallado de actividad de tu equipo.
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
              <ZoomableImage 
                src="/estadisticas.png" 
                alt="Métricas y Estadísticas de AseguraSimple" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* FEATURE 4: FICHA DE PÓLIZA */}
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
                Se acabó buscar PDFs en carpetas perdidas o revisar contactos en el celular. Accedé al detalle completo de cada riesgo, historial de siniestros, cuotas y documentación digital en una sola pantalla.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> 
                  Guardá la póliza original y la cuponera en la nube.
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div> 
                  Botones de contacto rápido integrados.
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
              <ZoomableImage 
                src="/poliza.png" 
                alt="Detalle de Póliza en AseguraSimple" 
                className="rounded-2xl shadow-2xl border border-gray-100 w-full object-cover" 
              />
            </motion.div>
          </div>

          {/* FEATURE 5: COMUNICACIÓN RÁPIDA */}
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
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle size={28} className="text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">WhatsApp en 1 Clic</h4>
                <p className="text-gray-600 leading-relaxed">
                  No pierdas tiempo tipeando. Al presionar el botón de aviso, generamos un mensaje pre-armado contextualizado (mora o renovación) con los datos del cliente, listo para que lo envíes.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail size={28} className="text-blue-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Correos Electrónicos Integrados</h4>
                <p className="text-gray-600 leading-relaxed">
                  Dejá que el sistema trabaje por vos. Enviá correos corporativos formateados con plantillas HTML profesionales directamente desde la plataforma para avisar vencimientos o saldos deudores.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}