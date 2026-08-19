"use client";

import { MessageCircle, Mail, Edit } from "lucide-react";

interface Props {
  siniestro: any;
  puedeModificar: boolean;
  onEdit: () => void;
}

export default function SiniestroBotonera({ siniestro, puedeModificar, onEdit }: Props) {
  const asegurado = siniestro?.poliza?.asegurado;

  const generarLinkWhatsApp = () => {
    if (!asegurado?.telefono) return "#";
    const numeroLimpio = asegurado.telefono.replace(/\D/g, '');
    const mensaje = `Hola ${asegurado.nombre}, te escribo de la agencia para avisarte que el siniestro #${siniestro.nroSiniestro} pasó a estado "${siniestro.estadoSiniestro}". Avisame cualquier consulta.`;
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  };

  const generarMailto = () => {
    if (!asegurado?.email) return "#";
    const subject = `Actualización de Siniestro #${siniestro.nroSiniestro}`;
    const body = `Hola ${asegurado.nombre},%0D%0A%0D%0ATe escribimos para informarte que tu siniestro #${siniestro.nroSiniestro} se encuentra actualmente en estado: ${siniestro.estadoSiniestro}.%0D%0A%0D%0AAnte cualquier duda, estamos a tu disposición.%0D%0A%0D%0ASaludos cordiales.`;
    return `mailto:${asegurado.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
      
      {/* Botón WhatsApp */}
      <a 
        href={generarLinkWhatsApp()} 
        target="_blank" rel="noopener noreferrer"
        className={`flex-1 md:flex-none flex justify-center items-center gap-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 px-4 py-3 md:py-2.5 rounded-xl font-bold transition-colors text-sm border border-transparent shadow-sm ${!asegurado?.telefono ? 'opacity-50 pointer-events-none' : ''}`}
        title={asegurado?.telefono ? "Avisar por WhatsApp" : "Cliente sin teléfono"}
      >
        <MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Botón Mail (Abre el cliente de correo por defecto) */}
      <a 
        href={generarMailto()}
        className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${
          !asegurado?.email 
            ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent pointer-events-none" 
            : "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-transparent"
        }`}
        title={!asegurado?.email ? "Cliente sin email" : "Enviar correo"}
      >
         <Mail size={18} />
         <span className="hidden sm:inline">Enviar Mail</span>
      </a>

      {/* Botón Editar original */}
      {puedeModificar && (
        <button 
          onClick={onEdit}
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 px-5 py-3 md:py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
        >
          <Edit size={18} /> Editar Siniestro
        </button>
      )}
    </div>
  );
}