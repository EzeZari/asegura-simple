"use client";

import { Users, FileText, Bell, CarFront, Mail, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Features() {
  const features = [
    {
      icon: <Users size={28} className="text-green-700" />,
      title: "Gestión de Asegurados",
      desc: "Cargá y buscá toda tu cartera en segundos. Fichas completas con historial y datos de contacto a un clic de distancia."
    },
    {
      icon: <FileText size={28} className="text-green-700" />,
      title: "Pólizas y Coberturas",
      desc: "Registrá cada póliza con todos sus datos técnicos, sumas aseguradas, franquicias y planes de pago estructurados."
    },
    {
      icon: <Bell size={28} className="text-green-700" />,
      title: "Alertas de Vencimiento",
      desc: "El sistema escanea tu cartera todos los días y te avisa qué pólizas o cuotas están por vencer para que no se te pase ninguna."
    },
    {
      icon: <CarFront size={28} className="text-green-700" />,
      title: "Gestión de Siniestros",
      desc: "Seguimiento completo del estado de cada reclamo. Adjuntá presupuestos, fotos y mantené al cliente informado."
    },
    {
      icon: <Mail size={28} className="text-green-700" />,
      title: "Soporte Inteligente 24/7",
      desc: "Asistente con Inteligencia Artificial integrado para destrabarte en segundos con cualquier duda operativa de la plataforma."
    },
    {
      icon: <BarChart3 size={28} className="text-green-700" />,
      title: "Dashboard y Estadísticas",
      desc: "Visualizá el estado de tu negocio de un vistazo. Pólizas activas, primas mensuales y asegurados nuevos."
    }
  ];

  return (
    <section id="funcionalidades" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitás, en un solo lugar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AseguraSimple está diseñado específicamente para automatizar las tareas repetitivas del Productor de Seguros.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feat.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}