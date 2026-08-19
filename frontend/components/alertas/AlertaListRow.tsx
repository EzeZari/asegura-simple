"use client";

import { MessageCircle, Shield, Trash2, RefreshCcw, Mail, MapPin, Users, CarFront } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal"; 
import NuevaPolizaModal from "../polizas/NuevaPolizaModal";
import { apiFetch } from "@/services/api"; 
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 
import { ActionMenu, ActionMenuItem, ActionMenuDivider } from "../ui/ActionMenu";

interface Props {
  poliza: any;
  nivel: "vencida" | "critica" | "proxima";
  menuAbiertoId: number | null;
  onToggleMenu: (id: number | null) => void;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AlertaListRow({ poliza, nivel, menuAbiertoId, onToggleMenu, isSelected, onSelect }: Props) {
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [isBajaLoading, setIsBajaLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRenovarModal, setShowRenovarModal] = useState(false);

  const calcularDiasCorto = (fechaVencimiento: string) => {
    const hoy = new Date().getTime();
    const venc = new Date(fechaVencimiento).getTime();
    const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Venció";
    if (diff === 0) return "Hoy";
    return `${diff} días`;
  };

  const generarLinkWhatsApp = () => {
    const { telefono, nombre } = poliza.asegurado;
    if (!telefono) return "#";
    const numeroLimpio = telefono.replace(/\D/g, '');
    const fecha = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");
    const mensaje = nivel === "vencida"
      ? `Hola ${nombre}, te escribo urgente porque tu póliza de ${poliza.compania?.nombre} venció el ${fecha}. Avisame si la renovamos.`
      : `Hola ${nombre}, te aviso que tu póliza de ${poliza.compania?.nombre} vence el ${fecha}. ¿Avanzamos con la renovación?`;
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  };

  const enviarWsp = () => {
    const url = generarLinkWhatsApp();
    if(url !== "#") window.open(url, '_blank');
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

  const estilos = {
    vencida: { linea: "bg-rose-500", fondo: "bg-rose-50 dark:bg-rose-900/30", texto: "text-rose-700 dark:text-rose-400" },
    critica: { linea: "bg-orange-500", fondo: "bg-orange-50 dark:bg-orange-900/30", texto: "text-orange-700 dark:text-orange-400" },
    proxima: { linea: "bg-green-400", fondo: "bg-green-50 dark:bg-green-900/30", texto: "text-green-700 dark:text-green-400" }
  }[nivel];

  return (
    <>
      <tr className={`${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-gray-50/50 dark:hover:bg-gray-700/30'} transition-colors relative group ${isBajaLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Checkbox */}
        <td className="p-3 md:p-4 text-center border-l-2 border-transparent relative">
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${estilos.linea}`}></div>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
          />
        </td>

        <td className="p-3 md:p-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
              {poliza.tipoPoliza === 'Automotor' || poliza.tipoPoliza === 'Motovehículo' ? <CarFront size={18} /> : <Shield size={18} />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white text-sm transition-colors">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</span>
              {poliza.cantidadEmpleados ? (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 transition-colors"><Users size={12}/> {poliza.cantidadEmpleados} Empleados</span>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono transition-colors">DNI: {poliza.asegurado?.dni}</span>
              )}
            </div>
          </div>
        </td>

        <td className="p-3 md:p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors">
          {poliza.tipoPoliza} <span className="mx-1 text-gray-300 dark:text-gray-600">•</span> {poliza.compania?.nombre || "-"}
        </td>
        
        <td className="p-3 md:p-4 whitespace-nowrap font-mono text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
          #{poliza.nroPoliza}
        </td>
        
        <td className="p-3 md:p-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 transition-colors">
          {poliza.patente ? <span className="uppercase font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-xs font-bold transition-colors">{poliza.patente}</span> : '-'}
          {poliza.marca && <span className="ml-2 font-medium">{poliza.marca} {poliza.modelo}</span>}
          {poliza.ubicacionRiesgo && <span className="flex items-center gap-1 mt-1 text-xs"><MapPin size={12}/> {poliza.ubicacionRiesgo}</span>}
        </td>
        
        <td className="p-3 md:p-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors">
          {new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")}
        </td>
        
        <td className="p-3 md:p-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider transition-colors ${estilos.fondo} ${estilos.texto}`}>
            {calcularDiasCorto(poliza.fechaVencimiento)}
          </span>
        </td>
        
        <td className="p-3 md:p-4 whitespace-nowrap text-right relative">
          {puedeModificar && (
            <ActionMenu isOpen={menuAbiertoId === poliza.id} onToggle={() => onToggleMenu(menuAbiertoId === poliza.id ? null : poliza.id)}>
              <ActionMenuItem 
                icon={MessageCircle} 
                label={poliza.asegurado.telefono ? "Enviar WhatsApp" : "Cliente sin teléfono"} 
                onClick={enviarWsp} 
              />
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
          <ConfirmModal 
            isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}
            onConfirm={ejecutarBaja} isLoading={isBajaLoading}
            title="Anular Póliza"
            message={`¿Estás seguro que querés anular la póliza de ${poliza.asegurado?.nombre}? Esta acción la sacará de tus alertas activas.`}
            confirmText="Anular"
          />
          <NuevaPolizaModal 
            isOpen={showRenovarModal} onClose={() => setShowRenovarModal(false)}
            onSuccess={() => window.location.reload()} polizaAEditar={poliza} isRenovacion={true}
          />
        </>
      )}
    </>
  );
}