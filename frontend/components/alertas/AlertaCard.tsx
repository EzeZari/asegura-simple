"use client";

import { MessageCircle, Shield, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  poliza: any;
  nivel: "vencida" | "critica" | "proxima";
}

export default function AlertaCard({ poliza, nivel }: Props) {
  const router = useRouter();

  const calcularDias = (fechaVencimiento: string) => {
    const hoy = new Date().getTime();
    const venc = new Date(fechaVencimiento).getTime();
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Venció hace ${Math.abs(diff)} días`;
    if (diff === 0) return "Vence HOY";
    return `Vence en ${diff} días`;
  };

  const generarLinkWhatsApp = (telefono: string, nombre: string, compania: string, fecha: string) => {
    if (!telefono) return "#";
    const numeroLimpio = telefono.replace(/\D/g, '');
    const mensaje = nivel === "vencida"
      ? `Hola ${nombre}, te escribo urgente porque tu póliza de ${compania} venció el ${fecha}. Avisame si la renovamos para no dejarte sin cobertura.`
      : `Hola ${nombre}, te aviso que tu póliza de ${compania} vence el ${fecha}. ¿Avanzamos con la renovación?`;
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  };

  const estilos = {
    vencida: { borde: "border-rose-200", fondo: "bg-rose-50", texto: "text-rose-700", linea: "bg-rose-500" },
    critica: { borde: "border-orange-200", fondo: "bg-orange-50", texto: "text-orange-700", linea: "bg-orange-500" },
    proxima: { borde: "border-amber-200", fondo: "bg-amber-50", texto: "text-amber-700", linea: "bg-amber-400" }
  }[nivel];

  const fechaFormat = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");

  return (
    <div className={`flex flex-col p-5 bg-white rounded-2xl border ${estilos.borde} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${estilos.linea}`}></div>
      
      <div className="flex justify-between items-start mb-3 ml-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${estilos.fondo} ${estilos.texto}`}>
          {calcularDias(poliza.fechaVencimiento)}
        </span>
        <span className="text-xs font-mono text-gray-400">#{poliza.nroPoliza}</span>
      </div>

      <div className="ml-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900 leading-tight">
          {poliza.asegurado?.nombre} {poliza.asegurado?.apellido}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1.5">
          <Shield size={14} className="text-gray-400" />
          <span>{poliza.compania?.nombre} • {poliza.tipoPoliza}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Vence: {fechaFormat}</p>
      </div>

      <div className="mt-auto ml-2 flex gap-2 pt-4 border-t border-gray-50">
        <a 
          href={generarLinkWhatsApp(poliza.asegurado.telefono, poliza.asegurado.nombre, poliza.compania.nombre, fechaFormat)} 
          target="_blank" rel="noopener noreferrer"
          className="flex-1 flex justify-center items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <MessageCircle size={16} /> Avisar
        </a>
        <button 
          onClick={() => router.push(`/polizas/${poliza.id}`)}
          className="flex-1 flex justify-center items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          Ver Ficha <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}