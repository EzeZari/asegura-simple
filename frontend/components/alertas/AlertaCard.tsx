"use client";

import { MessageCircle, Shield, Trash2, RefreshCcw, Mail, CheckCircle2, Loader2, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal"; 
import NuevaPolizaModal from "../polizas/NuevaPolizaModal";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 

interface Props {
  poliza: any;
  nivel: "vencida" | "critica" | "proxima";
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function AlertaCard({ poliza, nivel, isSelected, onSelect }: Props) {
  const router = useRouter();
  
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [isBajaLoading, setIsBajaLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRenovarModal, setShowRenovarModal] = useState(false);
  const [estadoEmail, setEstadoEmail] = useState<"idle" | "loading" | "success" | "error">("idle");

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
    if (!puedeModificar) return; 
    setIsBajaLoading(true);
    try {
      await apiFetch(`/api/polizas/${poliza.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...poliza, estado: "Anulada" })
      });
      window.location.reload(); 
    } catch (error) {
      console.error("Error al anular", error);
      setIsBajaLoading(false);
      setShowConfirmModal(false);
    }
  };

  const yaAvisadoHoy = () => {
    if (!poliza.ultimoAviso) return false;
    const hoy = new Date().toLocaleDateString("es-AR");
    const ultimoAviso = new Date(poliza.ultimoAviso).toLocaleDateString("es-AR");
    return hoy === ultimoAviso;
  };

  const enviarAvisoEmail = async () => {
    if (!poliza.asegurado?.email || yaAvisadoHoy() || estadoEmail !== "idle") return;
    setEstadoEmail("loading");
    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}/aviso`, { method: "POST" });
      if (!res.ok) throw new Error("Error al enviar");
      setEstadoEmail("success");
      poliza.ultimoAviso = new Date().toISOString(); 
      setTimeout(() => setEstadoEmail("idle"), 3000);
    } catch (error: any) {
      setEstadoEmail("error");
      setTimeout(() => setEstadoEmail("idle"), 3000);
    }
  };

  const estilos = {
    vencida: { borde: "border-rose-200 dark:border-rose-900/50", fondo: "bg-rose-50 dark:bg-rose-900/30", texto: "text-rose-700 dark:text-rose-400", linea: "bg-rose-500" },
    critica: { borde: "border-orange-200 dark:border-orange-900/50", fondo: "bg-orange-50 dark:bg-orange-900/30", texto: "text-orange-700 dark:text-orange-400", linea: "bg-orange-500" },
    proxima: { borde: "border-amber-200 dark:border-amber-900/50", fondo: "bg-amber-50 dark:bg-amber-900/30", texto: "text-amber-700 dark:text-amber-400", linea: "bg-amber-400" }
  }[nivel];

  const fechaFormat = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");

  return (
    <>
      <div className={`flex flex-col p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${isSelected ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-800 ' + estilos.borde} ${isBajaLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${estilos.linea}`}></div>
        
        {/* Checkbox Absoluto en la esquina */}
        {onSelect && (
          <div className="absolute top-4 right-4 z-10">
             <input 
              type="checkbox" 
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-3 ml-2 pr-6">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${estilos.fondo} ${estilos.texto} transition-colors`}>
            {calcularDias(poliza.fechaVencimiento)}
          </span>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 transition-colors">#{poliza.nroPoliza}</span>
        </div>

        <div className="ml-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight transition-colors">
            {poliza.asegurado?.nombre} {poliza.asegurado?.apellido}
          </h3>
          
          <div className="flex items-center gap-1.5 text-sm mt-2 transition-colors">
            <Shield size={14} className="text-gray-400 dark:text-gray-500" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{poliza.tipoPoliza}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-600 dark:text-gray-400 truncate">{poliza.compania?.nombre || "Sin Compañía"}</span>
          </div>

          <div className="ml-5 mt-1.5 mb-1 min-h-[24px]">
            {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (poliza.patente || poliza.marca || poliza.modelo) && (
              <div className="flex items-center gap-2">
                {poliza.patente && (
                  <span className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded font-mono font-bold uppercase text-gray-800 dark:text-gray-200 text-[10px] tracking-wider transition-colors">
                    {poliza.patente}
                  </span>
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate transition-colors">{poliza.marca} {poliza.modelo}</span>
              </div>
            )}

            {(poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral de Comercio") && poliza.ubicacionRiesgo && (
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 transition-colors">
                <MapPin size={14} className="text-gray-400 dark:text-gray-500" /> 
                <span className="truncate">{poliza.ubicacionRiesgo}</span>
              </div>
            )}

            {poliza.tipoPoliza === "ART" && poliza.cantidadEmpleados && (
              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 transition-colors">
                <Users size={14} className="text-gray-400 dark:text-gray-500" /> 
                <span>{poliza.cantidadEmpleados} Empleados</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 ml-5 font-medium transition-colors">Vence el {fechaFormat}</p>
        </div>

        <div className="mt-auto ml-2 flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-700/50 transition-colors">
          {puedeModificar && (
            nivel === "vencida" ? (
              <button onClick={() => setShowConfirmModal(true)} className="flex-1 flex justify-center items-center gap-1.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 py-2 rounded-xl text-sm font-bold transition-colors">
                <Trash2 size={16} /> <span className="hidden sm:inline">Anular</span>
              </button>
            ) : (
              <button onClick={() => setShowRenovarModal(true)} className="flex-1 flex justify-center items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 py-2 rounded-xl text-sm font-bold transition-colors">
                <RefreshCcw size={16} /> <span className="hidden sm:inline">Renovar</span>
              </button>
            )
          )}

          <a href={generarLinkWhatsApp(poliza.asegurado.telefono, poliza.asegurado.nombre, poliza.compania.nombre, fechaFormat)} target="_blank" rel="noopener noreferrer" className={`flex-1 flex justify-center items-center gap-1.5 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 py-2 rounded-xl text-sm font-bold transition-colors ${!poliza.asegurado.telefono ? 'opacity-50 pointer-events-none' : ''}`}>
            <MessageCircle size={16} /> <span className="hidden sm:inline">Wsp</span>
          </a>

          <button onClick={enviarAvisoEmail} disabled={estadoEmail !== "idle" || !poliza.asegurado.email || yaAvisadoHoy()} className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${yaAvisadoHoy() ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed" : estadoEmail === "success" ? "bg-emerald-500 text-white" : estadoEmail === "error" ? "bg-red-500 text-white" : !poliza.asegurado.email ? "bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed" : "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-700 dark:text-blue-400"}`}>
            {estadoEmail === "loading" ? <Loader2 size={16} className="animate-spin" /> : estadoEmail === "success" ? <CheckCircle2 size={16} /> : <Mail size={16} />}
             <span className="hidden sm:inline">{yaAvisadoHoy() ? "Avisado" : estadoEmail === "success" ? "Enviado" : "Mail"}</span>
          </button>
        </div>
      </div>

      {puedeModificar && (
        <>
          <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={ejecutarBaja} isLoading={isBajaLoading} title="Anular Póliza" message={`¿Estás seguro que querés anular la póliza de ${poliza.asegurado?.nombre}? Esta acción la sacará de tus alertas activas.`} confirmText="Anular" />
          <NuevaPolizaModal isOpen={showRenovarModal} onClose={() => setShowRenovarModal(false)} onSuccess={() => window.location.reload()} polizaAEditar={poliza} isRenovacion={true} />
        </>
      )}
    </>
  );
}