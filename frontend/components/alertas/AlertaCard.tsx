"use client";

import { MessageCircle, Shield, ArrowRight, Trash2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal"; 
import NuevaPolizaModal from "../polizas/NuevaPolizaModal"; // Importamos el modal de pólizas

interface Props {
  poliza: any;
  nivel: "vencida" | "critica" | "proxima";
}

export default function AlertaCard({ poliza, nivel }: Props) {
  const router = useRouter();
  const [isBajaLoading, setIsBajaLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRenovarModal, setShowRenovarModal] = useState(false);

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

  const ejecutarBaja = async () => {
    setIsBajaLoading(true);
    try {
      await fetch(`http://localhost:3001/api/polizas/${poliza.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...poliza, estado: "Anulada" })
      });
      window.location.reload(); 
    } catch (error) {
      console.error("Error al anular", error);
      setIsBajaLoading(false);
      setShowConfirmModal(false);
    }
  };

  const estilos = {
    vencida: { borde: "border-rose-200", fondo: "bg-rose-50", texto: "text-rose-700", linea: "bg-rose-500" },
    critica: { borde: "border-orange-200", fondo: "bg-orange-50", texto: "text-orange-700", linea: "bg-orange-500" },
    proxima: { borde: "border-amber-200", fondo: "bg-amber-50", texto: "text-amber-700", linea: "bg-amber-400" }
  }[nivel];

  const fechaFormat = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");

  return (
    <>
      <div className={`flex flex-col p-5 bg-white rounded-2xl border ${estilos.borde} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group ${isBajaLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
          
          {nivel === "vencida" ? (
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <Trash2 size={16} /> Anular
            </button>
          ) : (
            <button 
              onClick={() => setShowRenovarModal(true)}
              className="flex-1 flex justify-center items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              <RefreshCcw size={16} /> Renovar
            </button>
          )}

          <a 
            href={generarLinkWhatsApp(poliza.asegurado.telefono, poliza.asegurado.nombre, poliza.compania.nombre, fechaFormat)} 
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex justify-center items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <MessageCircle size={16} /> Avisar
          </a>
        </div>
      </div>

      {/* Modal de Confirmación para anular */}
      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={ejecutarBaja}
        isLoading={isBajaLoading}
        title="Anular Póliza"
        message={`¿Estás seguro que querés anular la póliza de ${poliza.asegurado?.nombre}? Esta acción la sacará de tus alertas activas.`}
        confirmText="Anular"
      />

      {/* Modal de Renovación Rápida */}
      <NuevaPolizaModal 
        isOpen={showRenovarModal}
        onClose={() => setShowRenovarModal(false)}
        onSuccess={() => window.location.reload()}
        polizaAEditar={poliza}
        isRenovacion={true}
      />
    </>
  );
}