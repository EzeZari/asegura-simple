"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, User, Building, 
  Shield, Mail, Phone, Edit, UploadCloud, Loader2
} from "lucide-react";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
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
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEditSuccess = () => {
    setIsModalOpen(false);
    fetchPoliza(); 
    setMensajeToast("Póliza actualizada con éxito");
    setShowToast(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!puedeModificar) return; 
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos en formato PDF.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await apiFetch(`/api/polizas/${id}/subir-pdf`, {
        method: "POST",
        body: formData, 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo");

      setMensajeToast("Póliza digital guardada con éxito");
      setShowToast(true);
      fetchPoliza(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Cargando ficha técnica...</div>;
  if (!poliza) return <div className="p-8 text-red-500 font-bold">Error: Póliza no encontrada o no autorizada.</div>;

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case "Vigente": return "text-emerald-700 bg-emerald-50 border-emerald-100";
      case "Renovada": return "text-blue-700 bg-blue-50 border-blue-100";
      case "Anulada": return "text-red-700 bg-red-50 border-red-100";
      case "Pendiente de Pago": return "text-amber-700 bg-amber-50 border-amber-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-8 w-full gap-6 md:gap-8 bg-white min-h-screen overflow-x-hidden">
      
      {/* Header Principal */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-green-700 transition-all w-fit font-medium group text-sm md:text-base"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a la lista
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
            <div className="p-3 md:p-4 bg-green-700 text-white rounded-2xl shadow-lg shadow-green-100 shrink-0">
              <FileText size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight truncate">Póliza #{poliza.nroPoliza}</h1>
                <span className={`w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border ${getStatusStyle(poliza.estado)}`}>
                  {poliza.estado.toUpperCase()}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2 font-medium">
                Registrada el {new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
          
          {puedeModificar && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm md:text-base"
            >
              <Edit size={18} /> Editar Póliza
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Columna Principal: Cobertura */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
          <div className="p-5 md:p-8 border border-gray-100 rounded-3xl bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield size={120} />
            </div>
            
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-2">
              <Shield size={22} className="text-green-700" /> Especificaciones del Riesgo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
              <DataField label="Rama / Riesgo" value={poliza.tipoPoliza} />
              <DataField label="Plan / Cobertura" value={poliza.cobertura || "Según condiciones"} />
              <DataField label="Vigencia Inicio" value={new Date(poliza.fechaInicio).toLocaleDateString("es-AR")} />
              <DataField label="Vigencia Fin" value={new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")} />
              
              {/* 🔥 NUEVO CAMPO: FORMA DE PAGO */}
              <DataField label="Forma de Pago" value={poliza.formaPago || "No especificada"} />

              {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (
                <>
                  <DataField label="Dominio / Patente" value={poliza.patente?.toUpperCase() || "-"} />
                  <DataField label="Marca y Modelo" value={`${poliza.marca || ""} ${poliza.modelo || ""}`.trim() || "-"} />
                </>
              )}

              {/* 🔥 ACTUALIZADO CON LOS NUEVOS NOMBRES OFICIALES DE LAS RAMAS */}
              {(poliza.tipoPoliza === "Combinado familiar" || poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral para comercio" || poliza.tipoPoliza === "Integral de Comercio") && (
                <DataField label="Ubicación del Riesgo" value={poliza.ubicacionRiesgo || "-"} />
              )}

              {poliza.tipoPoliza === "ART" && (
                <DataField label="Personal Declarado" value={poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} Empleados` : "-"} />
              )}
            </div>
          </div>

          <div className="p-5 md:p-8 border border-gray-100 rounded-3xl bg-gray-50/30 border-dashed">
            <h3 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Observaciones y Notas</h3>
            <p className="text-gray-400 italic text-xs md:text-sm">
              No se han registrado siniestros ni modificaciones técnicas en este período de vigencia.
            </p>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="flex flex-col gap-6">
          
          <div className="p-5 md:p-8 border border-gray-100 rounded-3xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6">Documentación</h3>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="application/pdf" 
              className="hidden" 
            />

            {poliza.pdfUrl ? (
              <div className="flex flex-col gap-3">
                <a 
                  href={poliza.pdfUrl.startsWith('http') ? poliza.pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}/${poliza.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 rounded-xl font-bold transition-colors text-sm md:text-base"
                >
                  <FileText size={20} /> Ver Póliza Digital
                </a>
                
                {puedeModificar && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[10px] md:text-xs text-gray-400 hover:text-gray-700 text-center font-medium transition-colors"
                  >
                    {isUploading ? "Subiendo..." : "¿Querés reemplazar el archivo?"}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {puedeModificar ? (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex flex-col justify-center items-center gap-2 border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-500 hover:text-green-700 py-6 md:py-8 rounded-xl font-medium transition-all text-sm md:text-base"
                  >
                    {isUploading ? (
                      <Loader2 size={24} className="animate-spin text-green-600 mb-1" />
                    ) : (
                      <UploadCloud size={24} className="mb-1" />
                    )}
                    {isUploading ? "Procesando archivo..." : "Cargar copia en PDF"}
                  </button>
                ) : (
                   <div className="flex flex-col justify-center items-center gap-2 border-2 border-dashed border-gray-100 bg-gray-50 text-gray-400 py-6 md:py-8 rounded-xl text-sm md:text-base italic">
                     <FileText size={24} className="mb-1 opacity-50" />
                     No hay póliza digital cargada.
                   </div>
                )}
                {puedeModificar && <p className="text-[10px] text-center text-gray-400 uppercase tracking-wider">Solo formato PDF</p>}
              </div>
            )}
          </div>

          <div className="p-5 md:p-8 border border-gray-100 rounded-3xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6">Asegurado Titular</h3>
            <div className="flex flex-col gap-4">
              <p className="text-xl md:text-2xl font-bold text-gray-900 break-words">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</p>
              <div className="flex flex-col gap-2 text-xs md:text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                   <User size={16} className="text-green-600 shrink-0" /> DNI: {poliza.asegurado?.dni}
                </span>
                <span className="flex items-center gap-2 text-gray-500">
                   <Phone size={16} className="text-green-600 shrink-0" /> {poliza.asegurado?.telefono || "Sin teléfono"}
                </span>
                <span className="flex items-center gap-2 text-gray-500 break-all">
                   <Mail size={16} className="text-green-600 shrink-0" /> {poliza.asegurado?.email || "Sin email"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8 border border-gray-100 rounded-3xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest mb-5 md:mb-6">Compañía Emisora</h3>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 bg-gray-50 rounded-xl shrink-0">
                <Building size={24} className="text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-xl font-bold text-gray-800 break-words">{poliza.compania?.nombre}</p>
                <p className="text-[10px] md:text-xs text-gray-500 font-mono mt-0.5">CUIT: {poliza.compania?.cuit || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {puedeModificar && (
        <NuevaPolizaModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleEditSuccess} 
          polizaAEditar={poliza} 
        />
      )}

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}

function DataField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.15em]">{label}</p>
      <p className="text-base md:text-lg font-semibold text-gray-800 break-words">{value}</p>
    </div>
  );
}