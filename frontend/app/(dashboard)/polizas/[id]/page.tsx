"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, User, Building, 
  Shield, Mail, Phone, Edit, Loader2, MessageCircle, CheckCircle2, RefreshCcw
} from "lucide-react";

import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
// 🔥 IMPORTAMOS LOS DOS COMPONENTES NUEVOS
import PolizaDocumentos from "@/components/polizas/PolizaDocumentos";
import PolizaSiniestros from "@/components/polizas/PolizaSiniestros";

import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; 

export default function PolizaDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { user } = useAuthStore();
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  const [poliza, setPoliza] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 🔥 NUEVO ESTADO PARA EL MODAL DE RENOVACIÓN
  const [showRenovarModal, setShowRenovarModal] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [estadoEmail, setEstadoEmail] = useState<"idle" | "loading" | "success" | "error">("idle");

  const fetchPoliza = async () => {
    try {
      const res = await apiFetch(`/api/polizas/${id}`);
      if (!res.ok) throw new Error("No se pudo cargar la póliza.");
      const data = await res.json();
      setPoliza(data);
    } catch (err) {
      console.error("Error al cargar la póliza:", err);
      setPoliza(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    if (id) fetchPoliza(); 
  }, [id]);

  const handleActionSuccess = (mensaje: string = "Operación exitosa") => {
    setIsModalOpen(false);
    setShowRenovarModal(false);
    fetchPoliza(); 
    setMensajeToast(mensaje);
    setShowToast(true);
  };

  const handleActionError = (mensaje: string) => {
    alert(mensaje);
  };

  const generarLinkWhatsApp = () => {
    if (!poliza?.asegurado?.telefono) return "#";
    const numeroLimpio = poliza.asegurado.telefono.replace(/\D/g, '');
    const fechaFormat = new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR");
    const mensaje = `Hola ${poliza.asegurado.nombre}, te escribo por tu póliza de ${poliza.compania?.nombre || "seguro"} (vto: ${fechaFormat}). Avisame cualquier consulta.`;
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  };

  const yaAvisadoHoy = () => {
    if (!poliza?.ultimoAviso) return false;
    const hoy = new Date().toLocaleDateString("es-AR");
    const ultimoAviso = new Date(poliza.ultimoAviso).toLocaleDateString("es-AR");
    return hoy === ultimoAviso;
  };

  const enviarAvisoEmail = async () => {
    if (!poliza?.asegurado?.email || yaAvisadoHoy()) return;
    setEstadoEmail("loading");
    try {
      const res = await apiFetch(`/api/polizas/${poliza.id}/aviso`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      
      setEstadoEmail("success");
      setPoliza((prev: any) => ({ ...prev, ultimoAviso: new Date().toISOString() }));
      setTimeout(() => setEstadoEmail("idle"), 3000);
    } catch (error: any) {
      setEstadoEmail("error");
      setTimeout(() => setEstadoEmail("idle"), 3000);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 dark:text-gray-400 animate-pulse transition-colors">Cargando ficha técnica...</div>;
  if (!poliza) return <div className="p-8 text-red-500 dark:text-red-400 font-bold transition-colors">Error: Póliza no encontrada o no autorizada.</div>;

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case "Vigente": return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/30";
      case "Renovada": return "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800/30";
      case "Anulada": return "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-800/30";
      case "Pendiente de Pago": return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/30";
      default: return "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700";
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-8 w-full gap-6 md:gap-8 min-h-screen overflow-x-hidden transition-colors duration-300">
      
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-green-700 dark:hover:text-green-400 transition-all w-fit font-medium group text-sm md:text-base"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a la lista
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
            <div className="p-3 md:p-4 bg-green-700 dark:bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 dark:shadow-none shrink-0 transition-colors">
              <FileText size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate transition-colors">Póliza #{poliza.nroPoliza}</h1>
                <span className={`w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border transition-colors ${getStatusStyle(poliza.estado)}`}>
                  {poliza.estado.toUpperCase()}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 dark:text-gray-400 mt-1 flex items-center gap-2 font-medium transition-colors">
                Registrada el {new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Botones de Comunicación */}
            <a 
              href={generarLinkWhatsApp()} 
              target="_blank" rel="noopener noreferrer"
              className={`flex-1 md:flex-none flex justify-center items-center gap-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 px-4 py-3 md:py-2.5 rounded-xl font-bold transition-colors text-sm border border-transparent shadow-sm ${!poliza.asegurado?.telefono ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button 
              onClick={enviarAvisoEmail}
              disabled={estadoEmail !== "idle" || !poliza.asegurado?.email || yaAvisadoHoy()}
              className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                yaAvisadoHoy() ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-600" :
                estadoEmail === "success" ? "bg-emerald-500 dark:bg-emerald-600 text-white" :
                estadoEmail === "error" ? "bg-red-500 dark:bg-red-600 text-white" :
                !poliza.asegurado?.email ? "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent" :
                "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-transparent"
              }`}
            >
              {estadoEmail === "loading" ? <Loader2 size={18} className="animate-spin" /> :
               estadoEmail === "success" ? <CheckCircle2 size={18} /> :
               <Mail size={18} />}
               <span className="hidden sm:inline">
                 {yaAvisadoHoy() ? "Avisado" : estadoEmail === "success" ? "Enviado" : "Enviar Mail"}
               </span>
            </button>

            {/* 🔥 NUEVO: BOTÓN RENOVAR */}
            {puedeModificar && poliza.estado !== "Renovada" && (
              <button 
                onClick={() => setShowRenovarModal(true)}
                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
              >
                <RefreshCcw size={18} /> Renovar
              </button>
            )}

            {puedeModificar && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 px-5 py-3 md:py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
              >
                <Edit size={18} /> Editar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
          <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 text-gray-900 dark:text-white transition-opacity">
              <Shield size={120} />
            </div>
            
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-6 md:mb-8 flex items-center gap-2 transition-colors">
              <Shield size={22} className="text-green-700 dark:text-green-500 transition-colors" /> Especificaciones del Riesgo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
              <DataField label="Rama / Riesgo" value={poliza.tipoPoliza} />
              <DataField label="Plan / Cobertura" value={poliza.cobertura || "Según condiciones"} />
              <DataField label="Vigencia Inicio" value={new Date(poliza.fechaInicio).toLocaleDateString("es-AR")} />
              <DataField label="Vigencia Fin" value={new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")} />
              
              <DataField label="Forma de Pago" value={poliza.formaPago || "No especificada"} />

              {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (
                <>
                  <DataField label="Dominio / Patente" value={poliza.patente?.toUpperCase() || "-"} />
                  <DataField label="Marca y Modelo" value={`${poliza.marca || ""} ${poliza.modelo || ""}`.trim() || "-"} />
                </>
              )}

              {(poliza.tipoPoliza === "Combinado familiar" || poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral para comercio" || poliza.tipoPoliza === "Integral de Comercio") && (
                <DataField label="Ubicación del Riesgo" value={poliza.ubicacionRiesgo || "-"} />
              )}

              {poliza.tipoPoliza === "ART" && (
                <DataField label="Personal Declarado" value={poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} Empleados` : "-"} />
              )}
            </div>
          </div>

          {/* 🔥 INYECTAMOS EL NUEVO COMPONENTE DE SINIESTROS VINCULADOS */}
          <PolizaSiniestros polizaId={poliza.id} />

        </div>

        {/* Columna Lateral */}
        <div className="flex flex-col gap-6">
          
          {/* 🔥 INYECTAMOS EL NUEVO COMPONENTE DE DOCUMENTACIÓN (PDF + CUPONERA) */}
          <PolizaDocumentos 
            poliza={poliza} 
            puedeModificar={puedeModificar}
            onSuccess={(msg) => handleActionSuccess(msg)}
            onError={handleActionError}
          />

          <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors">
            <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6 transition-colors">Asegurado Titular</h3>
            <div className="flex flex-col gap-4">
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white break-words transition-colors">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</p>
              <div className="flex flex-col gap-2 text-xs md:text-sm">
                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 transition-colors">
                   <User size={16} className="text-green-600 dark:text-green-500 shrink-0 transition-colors" /> DNI: {poliza.asegurado?.dni}
                </span>
                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 transition-colors">
                   <Phone size={16} className="text-green-600 dark:text-green-500 shrink-0 transition-colors" /> {poliza.asegurado?.telefono || "Sin teléfono"}
                </span>
                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 break-all transition-colors">
                   <Mail size={16} className="text-green-600 dark:text-green-500 shrink-0 transition-colors" /> {poliza.asegurado?.email || "Sin email"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8 border border-gray-100 dark:border-gray-700 rounded-3xl bg-white dark:bg-gray-800 shadow-sm transition-colors">
            <h3 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6 transition-colors">Compañía Emisora</h3>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl shrink-0 transition-colors">
                <Building size={24} className="text-gray-400 dark:text-gray-500 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 break-words transition-colors">{poliza.compania?.nombre}</p>
                <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 transition-colors">CUIT: {poliza.compania?.cuit || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {puedeModificar && isModalOpen && (
        <NuevaPolizaModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => handleActionSuccess("Póliza actualizada con éxito")} 
          polizaAEditar={poliza} 
        />
      )}

      {/* 🔥 MODAL DE RENOVACIÓN */}
      {puedeModificar && showRenovarModal && (
        <NuevaPolizaModal 
          isOpen={showRenovarModal} 
          onClose={() => setShowRenovarModal(false)} 
          onSuccess={() => handleActionSuccess("La póliza fue renovada y se guardó como un nuevo registro")} 
          polizaAEditar={poliza}
          isRenovacion={true} // Le pasamos la prop que ya habías programado
        />
      )}

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}

function DataField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0 transition-colors">
      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.15em] transition-colors">{label}</p>
      <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 break-words transition-colors">{value}</p>
    </div>
  );
}