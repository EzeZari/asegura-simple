"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, User, Building, 
  Shield, Mail, Phone, Edit, UploadCloud, Loader2
} from "lucide-react";
import NuevaPolizaModal from "@/components/polizas/NuevaPolizaModal";
import Toast from "@/components/ui/Toast";

export default function PolizaDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [poliza, setPoliza] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  
  // Estados y refs para el manejo del PDF
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPoliza = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polizas/${id}`);
      const data = await res.json();
      setPoliza(data);
    } catch (err) {
      console.error("Error al cargar la póliza:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPoliza(); }, [id]);

  const handleEditSuccess = () => {
    setIsModalOpen(false);
    fetchPoliza(); 
    setMensajeToast("Póliza actualizada con éxito");
    setShowToast(true);
  };

  // Función para manejar la subida del archivo a nuestro nuevo endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polizas/${id}/subir-pdf`, {
        method: "POST",
        body: formData, // No hace falta poner 'Content-Type', el navegador lo calcula solo al mandar FormData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo");

      setMensajeToast("Póliza digital guardada con éxito");
      setShowToast(true);
      fetchPoliza(); // Recargamos para que aparezca el botón de "Ver Póliza"
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reseteamos el input
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Cargando ficha técnica...</div>;
  if (!poliza) return <div className="p-8 text-red-500 font-bold">Error: Póliza no encontrada.</div>;

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
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen">
      
      {/* Header Principal */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-green-700 transition-all w-fit font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a la lista
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-green-700 text-white rounded-2xl shadow-lg shadow-green-100">
              <FileText size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Póliza #{poliza.nroPoliza}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(poliza.estado)}`}>
                  {poliza.estado.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400 mt-1 flex items-center gap-2 font-medium">
                Registrada el {new Date(poliza.fechaInicio).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Edit size={18} /> Editar Póliza
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal: Cobertura */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield size={120} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Shield size={22} className="text-green-700" /> Especificaciones del Riesgo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              <DataField label="Rama / Riesgo" value={poliza.tipoPoliza} />
              <DataField label="Plan / Cobertura" value={poliza.cobertura || "Según condiciones"} />
              <DataField label="Vigencia Inicio" value={new Date(poliza.fechaInicio).toLocaleDateString("es-AR")} />
              <DataField label="Vigencia Fin" value={new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR")} />
              
              {(poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (
                <>
                  <DataField label="Dominio / Patente" value={poliza.patente?.toUpperCase() || "-"} />
                  <DataField label="Marca y Modelo" value={`${poliza.marca || ""} ${poliza.modelo || ""}`.trim() || "-"} />
                </>
              )}

              {(poliza.tipoPoliza === "Combinado Familiar" || poliza.tipoPoliza === "Integral de Comercio") && (
                <DataField label="Ubicación del Riesgo" value={poliza.ubicacionRiesgo || "-"} />
              )}

              {poliza.tipoPoliza === "ART" && (
                <DataField label="Personal Declarado" value={poliza.cantidadEmpleados ? `${poliza.cantidadEmpleados} Empleados` : "-"} />
              )}
            </div>
          </div>

          <div className="p-8 border border-gray-100 rounded-3xl bg-gray-50/30 border-dashed">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Observaciones y Notas</h3>
            <p className="text-gray-400 italic text-sm">
              No se han registrado siniestros ni modificaciones técnicas en este período de vigencia.
            </p>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="flex flex-col gap-6">
          
          {/* 🔥 NUEVA TARJETA: DOCUMENTACIÓN */}
          <div className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-6">Documentación</h3>
            
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
                  href={`${process.env.NEXT_PUBLIC_API_URL}/${poliza.pdfUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 rounded-xl font-bold transition-colors"
                >
                  <FileText size={20} /> Ver Póliza Digital
                </a>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs text-gray-400 hover:text-gray-700 text-center font-medium transition-colors"
                >
                  {isUploading ? "Subiendo..." : "¿Querés reemplazar el archivo?"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex flex-col justify-center items-center gap-2 border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-500 hover:text-green-700 py-8 rounded-xl font-medium transition-all"
                >
                  {isUploading ? (
                    <Loader2 size={28} className="animate-spin text-green-600 mb-1" />
                  ) : (
                    <UploadCloud size={28} className="mb-1" />
                  )}
                  {isUploading ? "Procesando archivo..." : "Cargar copia en PDF"}
                </button>
                <p className="text-[10px] text-center text-gray-400 uppercase tracking-wider">Solo formato PDF</p>
              </div>
            )}
          </div>

          <div className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-6">Asegurado Titular</h3>
            <div className="flex flex-col gap-4">
              <p className="text-2xl font-bold text-gray-900">{poliza.asegurado?.nombre} {poliza.asegurado?.apellido}</p>
              <div className="flex flex-col gap-2 text-sm">
                <span className="flex items-center gap-2 text-gray-500">
                   <User size={16} className="text-green-600" /> DNI: {poliza.asegurado?.dni}
                </span>
                <span className="flex items-center gap-2 text-gray-500">
                   <Phone size={16} className="text-green-600" /> {poliza.asegurado?.telefono || "Sin teléfono"}
                </span>
                <span className="flex items-center gap-2 text-gray-500 truncate">
                   <Mail size={16} className="text-green-600" /> {poliza.asegurado?.email || "Sin email"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-6">Compañía Emisora</h3>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Building size={24} className="text-gray-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{poliza.compania?.nombre}</p>
                <p className="text-xs text-gray-500 font-mono">CUIT: {poliza.compania?.cuit || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NuevaPolizaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleEditSuccess} 
        polizaAEditar={poliza} 
      />

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}

function DataField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.15em]">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  );
}