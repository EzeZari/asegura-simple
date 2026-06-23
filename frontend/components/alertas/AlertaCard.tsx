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
}

export default function AlertaCard({ poliza, nivel }: Props) {
  const router = useRouter();
  
  // 🔥 EVALUAMOS LOS PERMISOS ACÁ ADENTRO
  // Esto da TRUE para el Dueño y el Admin Secundario. Da FALSE para el Lector.
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
    if (!puedeModificar) return; // 🔥 El Lector no pasa de acá

    setIsBajaLoading(true);
    try {
      await apiFetch(`/api/polizas/${poliza.id}`, {
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

  const yaAvisadoHoy = () => {
    if (!poliza.ultimoAviso) return false;
    const hoy = new Date().toLocaleDateString("es-AR");
    const ultimoAviso = new Date(poliza.ultimoAviso).toLocaleDateString("es-AR");
    return hoy === ultimoAviso;
  };

  // 🔥 ESTA FUNCIÓN QUEDA LIBRE PARA TODOS (Incluso el Lector)
  const enviarAvisoEmail = async () => {
    if (!poliza.asegurado?.email || yaAvisadoHoy()) return;
    
    setEstadoEmail("loading");
    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}/avisar-vencimiento`, { 
        method: "POST" 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      
      setEstadoEmail("success");
      poliza.ultimoAviso = new Date().toISOString(); 
      setTimeout(() => setEstadoEmail("idle"), 3000);
    } catch (error: any) {
      console.error(error.message);
      setEstadoEmail("error");
      setTimeout(() => setEstadoEmail("idle"), 3000);
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
          
          <div className="flex items-center gap-1.5 text-sm mt-2">
            <Shield size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-800">{poliza.tipoPoliza}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600 truncate">{poliza.compania?.nombre || "Sin Compañía"}</span>
          </div>

          <div className="ml-5 mt-1.5 mb-1 min-h-[24px]">
            {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (poliza.patente || poliza.marca || poliza.modelo) && (
              <div className="flex items-center gap-2">
                {poliza.patente && (
                  <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded font-mono font-bold uppercase text-gray-800 text-[10px] tracking-wider">
                    {poliza.patente}
                  </span>
                )}
                <span className="text-xs text-gray-600 font-medium truncate">{poliza.marca} {poliza.modelo}</span>
              </div>
            )}

            {(poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral de Comercio") && poliza.ubicacionRiesgo && (
              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" /> 
                <span className="truncate">{poliza.ubicacionRiesgo}</span>
              </div>
            )}

            {poliza.tipoPoliza === "ART" && poliza.cantidadEmpleados && (
              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" /> 
                <span>{poliza.cantidadEmpleados} Empleados</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2 ml-5 font-medium">Vence el {fechaFormat}</p>
        </div>

        <div className="mt-auto ml-2 flex gap-2 pt-4 border-t border-gray-50">
          
          {/* 🔥 DUEÑO Y ADMIN SECUNDARIO VEN ESTO. EL LECTOR NO. */}
          {puedeModificar && (
            nivel === "vencida" ? (
              <button 
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-sm font-bold transition-colors"
                title="Anular póliza"
              >
                <Trash2 size={16} /> <span className="hidden sm:inline">Anular</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowRenovarModal(true)}
                className="flex-1 flex justify-center items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-sm font-bold transition-colors"
                title="Renovar póliza"
              >
                <RefreshCcw size={16} /> <span className="hidden sm:inline">Renovar</span>
              </button>
            )
          )}

          <a 
            href={generarLinkWhatsApp(poliza.asegurado.telefono, poliza.asegurado.nombre, poliza.compania.nombre, fechaFormat)} 
            target="_blank" rel="noopener noreferrer"
            className={`flex-1 flex justify-center items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-xl text-sm font-bold transition-colors ${!poliza.asegurado.telefono ? 'opacity-50 pointer-events-none' : ''}`}
            title={poliza.asegurado.telefono ? "Avisar por WhatsApp" : "Cliente sin teléfono"}
          >
            <MessageCircle size={16} /> <span className="hidden sm:inline">Wsp</span>
          </a>

          <button 
            onClick={enviarAvisoEmail}
            disabled={estadoEmail !== "idle" || !poliza.asegurado.email || yaAvisadoHoy()}
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-colors ${
              yaAvisadoHoy() ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" :
              estadoEmail === "success" ? "bg-emerald-500 text-white" :
              estadoEmail === "error" ? "bg-red-500 text-white" :
              !poliza.asegurado.email ? "bg-gray-50 text-gray-400 cursor-not-allowed" :
              "bg-blue-50 hover:bg-blue-100 text-blue-700"
            }`}
            title={yaAvisadoHoy() ? "Ya se envió un recordatorio hoy" : !poliza.asegurado.email ? "Cliente sin email" : "Enviar correo formal"}
          >
            {estadoEmail === "loading" ? <Loader2 size={16} className="animate-spin" /> :
             estadoEmail === "success" ? <CheckCircle2 size={16} /> :
             <Mail size={16} />}
             <span className="hidden sm:inline">
               {yaAvisadoHoy() ? "Avisado" : estadoEmail === "success" ? "Enviado" : "Mail"}
             </span>
          </button>
        </div>
      </div>

      {/* 🔥 DUEÑO Y ADMIN SECUNDARIO VEN ESTO. EL LECTOR NO. */}
      {puedeModificar && (
        <>
          <ConfirmModal 
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={ejecutarBaja}
            isLoading={isBajaLoading}
            title="Anular Póliza"
            message={`¿Estás seguro que querés anular la póliza de ${poliza.asegurado?.nombre}? Esta acción la sacará de tus alertas activas.`}
            confirmText="Anular"
          />

          <NuevaPolizaModal 
            isOpen={showRenovarModal}
            onClose={() => setShowRenovarModal(false)}
            onSuccess={() => window.location.reload()}
            polizaAEditar={poliza}
            isRenovacion={true}
          />
        </>
      )}
    </>
  );
}