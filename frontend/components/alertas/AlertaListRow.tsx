"use client";

import { MessageCircle, Shield, Trash2, RefreshCcw, MapPin, Users, CarFront, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import ConfirmModal from "../ui/ConfirmModal"; 
import NuevaPolizaModal from "../polizas/NuevaPolizaModal";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "../ui/ActionMenu";
import { generarLinkWhatsApp } from "@/utils/whatsapp";

interface Props {
  poliza: any;
  nivel: "vencida" | "critica" | "proxima";
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  isSelected: boolean;
  onSelect: () => void;
  plantillas: { proxima: string; critica: string; vencida: string };
}

export default function AlertaListRow({ poliza, nivel, menuAbiertoId, onToggleMenu, isSelected, onSelect, plantillas }: Props) {
  const router = useRouter(); 
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [isBajaLoading, setIsBajaLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRenovarModal, setShowRenovarModal] = useState(false);

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

  const calcularDiasCorto = (fechaVencimiento: string) => {
    const hoy = new Date().getTime();
    const venc = new Date(fechaVencimiento).getTime();
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Venció";
    if (diff === 0) return "Hoy";
    return `${diff} días`;
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

  const estilos = {
    vencida: { linea: "bg-rose-500", fondo: "bg-rose-50 dark:bg-rose-900/30", texto: "text-rose-700 dark:text-rose-400" },
    critica: { linea: "bg-orange-500", fondo: "bg-orange-50 dark:bg-orange-900/30", texto: "text-orange-700 dark:text-orange-400" },
    proxima: { linea: "bg-green-400", fondo: "bg-green-50 dark:bg-green-900/30", texto: "text-green-700 dark:text-green-400" }
  }[nivel];

  return (
    <>
      <tr className={`${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'} ${gestionado ? 'opacity-60 hover:opacity-100' : ''} transition-all relative group ${isBajaLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <td className="p-3 md:p-4 text-center border-l-2 border-transparent relative">
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${estilos.linea}`}></div>
          <input type="checkbox" checked={isSelected} onChange={onSelect} className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded cursor-pointer" />
        </td>
        <td className="p-3 md:p-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
              {poliza.tipoPoliza === 'Automotor' || poliza.tipoPoliza === 'Motovehículo' ? <CarFront size={18} /> : <Shield size={18} />}
            </div>
            <div className="flex flex-col">
              <span onClick={() => router.push(`/polizas/${poliza.id}`)} className="font-bold text-gray-900 dark:text-white text-sm cursor-pointer hover:underline">
                {poliza.asegurado?.nombre} {poliza.asegurado?.apellido}
              </span>
              {poliza.cantidadEmpleados ? (
                <span className="text-xs text-gray-500 flex items-center gap-1"><Users size={12}/> {poliza.cantidadEmpleados} Empleados</span>
              ) : (
                <span className="text-xs text-gray-500 font-mono">DNI: {poliza.asegurado?.dni}</span>
              )}
            </div>
          </div>
        </td>
        <td className="p-3 md:p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          {poliza.tipoPoliza} <span className="mx-1 text-gray-300">•</span> {poliza.compania?.nombre || "-"}
        </td>
        <td className="p-3 md:p-4 whitespace-nowrap font-mono text-sm font-semibold">
          <span onClick={() => router.push(`/polizas/${poliza.id}`)} className="text-gray-700 dark:text-gray-200 cursor-pointer hover:underline">#{poliza.nroPoliza}</span>
        </td>
        <td className="p-3 md:p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
          {poliza.patente ? <span className="uppercase font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 text-xs font-bold">{poliza.patente}</span> : '-'}
          {poliza.marca && <span className="ml-2 font-medium">{poliza.marca} {poliza.modelo}</span>}
          {poliza.ubicacionRiesgo && <span className="flex items-center gap-1 mt-1 text-xs"><MapPin size={12}/> {poliza.ubicacionRiesgo}</span>}
        </td>
        <td className="p-3 md:p-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
          {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}
        </td>
        <td className="p-3 md:p-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${estilos.fondo} ${estilos.texto}`}>
            {calcularDiasCorto(poliza.fechaVencimiento)}
          </span>
        </td>
        
        <td className="p-3 md:p-4 min-w-[180px] max-w-[220px]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`gestion-row-${poliza.id}`} 
                checked={gestionado} 
                onChange={(e) => { 
                  setGestionado(e.target.checked); 
                  handleSaveGestion(e.target.checked, observacion); 
                }} 
                className="w-4 h-4 text-green-600 border-gray-300 rounded cursor-pointer" 
              />
              <label htmlFor={`gestion-row-${poliza.id}`} className="text-[10px] font-bold text-gray-500 uppercase tracking-wider cursor-pointer">
                Ya contactado
              </label>
              {isSavingNota && <Loader2 size={12} className="animate-spin text-gray-400 ml-auto" />}
            </div>
            
            {isEditingNota ? (
              <input 
                autoFocus
                type="text" 
                placeholder="Ej: Paga el viernes..." 
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
                className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors w-fit"
              >
                + Añadir nota
              </button>
            )}
          </div>
        </td>

        <td className="p-3 md:p-4 whitespace-nowrap text-right relative">
          {puedeModificar && (
            <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => onToggleMenu(menuAbiertoId === poliza.id ? null : poliza.id)}>
              <ActionMenuItem icon={MessageCircle} label={poliza.asegurado.telefono ? "Enviar WhatsApp" : "Cliente sin teléfono"} onClick={enviarWsp} />
              <ActionMenuDivider />
              {nivel === "vencida" ? (
                <ActionMenuItem icon={Trash2} label="Anular Póliza" color="red" onClick={() => setShowConfirmModal(true)} />
              ) : (
                <ActionMenuItem icon={RefreshCcw} label="Renovar Póliza" onClick={() => setShowRenovarModal(true)} />
              )}
            </ActionMenu>
          )}
        </td>
      </tr>

      {puedeModificar && (
        <>
          <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={ejecutarBaja} isLoading={isBajaLoading} title="Anular Póliza" message={`¿Estás seguro que querés anular la póliza de ${poliza.asegurado?.nombre}?`} confirmText="Anular" />
          <NuevaPolizaModal isOpen={showRenovarModal} onClose={() => setShowRenovarModal(false)} onSuccess={() => window.location.reload()} polizaAEditar={poliza} isRenovacion={true} />
        </>
      )}
    </>
  );
}