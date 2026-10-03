"use client";

import { MessageCircle, Shield, Trash2, RefreshCcw, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal"; 
import NuevaPolizaModal from "../polizas/NuevaPolizaModal";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 
import { generarLinkWhatsApp } from "@/utils/whatsapp";

interface Props {
  poliza: any;
  nivel: "vencida" | "critica" | "proxima";
  isSelected?: boolean;
  onSelect?: () => void;
  plantillas: { proxima: string; critica: string; vencida: string };
}

export default function AlertaCard({ poliza, nivel, isSelected, onSelect, plantillas }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [isBajaLoading, setIsBajaLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRenovarModal, setShowRenovarModal] = useState(false);
  const [estadoEmail, setEstadoEmail] = useState<"idle" | "loading" | "success" | "error">("idle");

  const [gestionado, setGestionado] = useState(poliza.avisoGestionado || false);
  const [observacion, setObservacion] = useState(poliza.observacionesAviso || "");
  const [isSavingNota, setIsSavingNota] = useState(false);
  const [isEditingNota, setIsEditingNota] = useState(false);

  const handleSaveGestion = async (nuevoEstado: boolean, nuevaObs: string) => {
    setIsSavingNota(true);
    try {
      await apiFetch(`/api/polizas/${poliza.id}/gestion-aviso`, {
        method: "PATCH",
        body: JSON.stringify({ avisoGestionado: nuevoEstado, observacionesAviso: nuevaObs }),
      });
    } catch (error) {
      console.error("Error al guardar nota", error);
    } finally {
      setIsSavingNota(false);
    }
  };

  const calcularDias = (fechaVencimiento: string) => {
    const hoy = new Date().getTime();
    const venc = new Date(fechaVencimiento).getTime();
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Venció hace ${Math.abs(diff)} días`;
    if (diff === 0) return "Vence HOY";
    return `Vence en ${diff} días`;
  };

  const ejecutarBaja = async () => {
    if (!puedeModificar) return; 
    setIsBajaLoading(true);
    try {
      await apiFetch(`/api/polizas/${poliza.id}`, { method: "PUT", body: JSON.stringify({ ...poliza, estado: "Anulada" }) });
      window.location.reload(); 
    } catch (error) {
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

  const enviarWsp = () => {
    const url = generarLinkWhatsApp(poliza, plantillas[nivel]);
    window.open(url, '_blank');
    
    // 🔥 IDEA 3: Automatización. Si no estaba gestionado, lo tilda y guarda.
    if (!gestionado) {
      setGestionado(true);
      handleSaveGestion(true, observacion);
    }
  };

  const enviarAvisoEmail = async () => {
    if (!poliza.asegurado?.email || yaAvisadoHoy() || estadoEmail !== "idle") return;
    setEstadoEmail("loading");
    try {
      await apiFetch(`/api/polizas/${poliza.id}/aviso`, { method: "POST" });
      setEstadoEmail("success");
      poliza.ultimoAviso = new Date().toISOString(); 
      
      // 🔥 IDEA 3: Automatizamos visualmente el tilde al mandar el mail (el backend ya lo hizo en DB)
      setGestionado(true);

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
      <div className={`flex flex-col pt-5 px-5 pb-3 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${isSelected ? 'bg-blue-50/30 border-blue-300' : 'bg-white dark:bg-gray-800 ' + estilos.borde} ${gestionado ? 'opacity-60 hover:opacity-100' : ''} ${isBajaLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className={`absolute top-0 left-0 w-1.5 h-full ${estilos.linea}`}></div>
        
        {onSelect && (
          <div className="absolute top-4 right-4 z-10">
             <input type="checkbox" checked={isSelected} onChange={onSelect} className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded cursor-pointer" />
          </div>
        )}

        <div className="flex justify-between items-start mb-3 ml-2 pr-6">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${estilos.fondo} ${estilos.texto}`}>{calcularDias(poliza.fechaVencimiento)}</span>
          <span onClick={() => router.push(`/polizas/${poliza.id}`)} className="text-xs font-mono text-gray-400 cursor-pointer hover:underline">#{poliza.nroPoliza}</span>
        </div>

        <div className="ml-2 mb-4">
          <h3 onClick={() => router.push(`/polizas/${poliza.id}`)} className="text-lg inline-block font-bold text-gray-900 dark:text-white leading-tight cursor-pointer hover:underline">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</h3>
          <div className="flex items-center gap-1.5 text-sm mt-2">
            <Shield size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{poliza.tipoPoliza}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-gray-600 dark:text-gray-400 truncate">{poliza.compania?.nombre || "Sin Compañía"}</span>
          </div>

          <div className="ml-5 mt-1.5 mb-1 min-h-[24px]">
            {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (poliza.patente || poliza.marca || poliza.modelo) && (
              <div className="flex items-center gap-2">
                {poliza.patente && <span className="bg-gray-100 dark:bg-gray-700 border border-gray-300 px-2 py-0.5 rounded font-mono font-bold uppercase text-gray-800 text-[10px] tracking-wider">{poliza.patente}</span>}
                <span className="text-xs text-gray-600 font-medium truncate">{poliza.marca} {poliza.modelo}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-5 font-medium">Vence el {fechaFormat}</p>
        </div>

        <div className="ml-2 mr-1 mb-4 pt-3 border-t border-gray-50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id={`gestion-card-${poliza.id}`} 
              checked={gestionado} 
              onChange={(e) => { 
                setGestionado(e.target.checked); 
                handleSaveGestion(e.target.checked, observacion); 
              }} 
              className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer" 
            />
            <label htmlFor={`gestion-card-${poliza.id}`} className="text-xs font-bold text-gray-500 uppercase cursor-pointer">
              Ya contactado
            </label>
            {isSavingNota && <Loader2 size={12} className="animate-spin text-gray-400 ml-auto" />}
          </div>
          
          {isEditingNota ? (
            <input 
              autoFocus
              type="text" 
              placeholder="Anotar respuesta (Ej: Paga el 15)..." 
              value={observacion} 
              onChange={(e) => setObservacion(e.target.value)} 
              onBlur={(e) => {
                setIsEditingNota(false);
                handleSaveGestion(gestionado, e.target.value);
              }} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingNota(false);
                  handleSaveGestion(gestionado, observacion);
                }
              }}
              className={`w-full text-xs px-2 py-1.5 bg-white dark:bg-gray-900 border border-green-400 rounded-lg outline-none focus:ring-1 focus:ring-green-500 shadow-sm`} 
            />
          ) : observacion ? (
            <div 
              onClick={() => setIsEditingNota(true)}
              className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-2 py-1.5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer truncate transition-colors"
              title={observacion}
            >
              💬 {observacion}
            </div>
          ) : (
            <button 
              onClick={() => setIsEditingNota(true)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors w-fit"
            >
              + Añadir nota
            </button>
          )}
        </div>

        <div className="mt-auto ml-2 flex gap-2 pt-3 border-t border-gray-50 dark:border-gray-700/50">
          {puedeModificar && (
            nivel === "vencida" ? (
              <button onClick={() => setShowConfirmModal(true)} className="flex-1 flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl text-sm font-bold"><Trash2 size={16} /> <span className="hidden sm:inline">Anular</span></button>
            ) : (
              <button onClick={() => setShowRenovarModal(true)} className="flex-1 flex justify-center items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-sm font-bold"><RefreshCcw size={16} /> <span className="hidden sm:inline">Renovar</span></button>
            )
          )}

          {/* 🔥 IDEA 3: CAMBIAMOS EL <A> POR BUTTON PARA QUE PUEDA AUTO-TILDAR */}
          <button onClick={enviarWsp} disabled={!poliza.asegurado.telefono} className={`flex-1 flex justify-center items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 py-2 rounded-xl text-sm font-bold ${!poliza.asegurado.telefono ? 'opacity-50 pointer-events-none' : ''}`}>
            <MessageCircle size={16} /> <span className="hidden sm:inline">Wsp</span>
          </button>

          <button onClick={enviarAvisoEmail} disabled={estadoEmail !== "idle" || !poliza.asegurado.email || yaAvisadoHoy()} className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-sm font-bold ${yaAvisadoHoy() ? "bg-gray-100 text-gray-400 cursor-not-allowed" : estadoEmail === "success" ? "bg-emerald-500 text-white" : estadoEmail === "error" ? "bg-red-500 text-white" : !poliza.asegurado.email ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-blue-50 hover:bg-blue-100 text-blue-700"}`}>
            {estadoEmail === "loading" ? <Loader2 size={16} className="animate-spin" /> : estadoEmail === "success" ? <CheckCircle2 size={16} /> : <Mail size={16} />}
             <span className="hidden sm:inline">{yaAvisadoHoy() ? "Avisado" : estadoEmail === "success" ? "Enviado" : "Mail"}</span>
          </button>
        </div>
      </div>

      {puedeModificar && (
        <>
          <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={ejecutarBaja} isLoading={isBajaLoading} title="Anular Póliza" message={`¿Estás seguro que querés anular la póliza?`} confirmText="Anular" />
          <NuevaPolizaModal isOpen={showRenovarModal} onClose={() => setShowRenovarModal(false)} onSuccess={() => window.location.reload()} polizaAEditar={poliza} isRenovacion={true} />
        </>
      )}
    </>
  );
}