"use client";

import { FileSpreadsheet, Clock, Search, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Problems() {
  const cards = [
    {
      icon: <FileSpreadsheet size={24} />,
      title: "¿Seguís usando Excel?",
      desc: "Planillas interminables que se desactualizan, se borran o son imposibles de leer desde el celular."
    },
    {
      icon: <Clock size={24} />,
      title: "¿Te enterás tarde?",
      desc: "Perdés comisiones porque una póliza venció y nadie le avisó al cliente para renovarla a tiempo."
    },
    {
      icon: <Search size={24} />,
      title: "¿Perdés tiempo?",
      desc: "Tardás horas buscando el número de póliza o la patente cuando un cliente te llama de urgencia."
    }
  ];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            La forma antigua de trabajar te está costando plata
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {cards.map((card, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }} // El delay multiplicado por el index hace el efecto escalera
              className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 bg-green-700 text-white px-6 py-3 rounded-full font-bold shadow-lg">
            <CheckCircle2 size={24} /> AseguraSimple lo resuelve todo
          </div>
        </motion.div>
      </div>
    </section>
  );
}