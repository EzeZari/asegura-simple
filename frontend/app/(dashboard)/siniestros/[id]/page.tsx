"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, AlertTriangle, User, Building, 
  CarFront, Clock, CheckCircle, MessageSquare, Send, 
  FileText, Calendar, ShieldCheck, MessageCircle
} from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function SiniestroDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [siniestro, setSiniestro] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nuevaNota, setNuevaNota] = useState("");
  const [isSubmittingNota, setIsSubmittingNota] = useState(false);
  const [isUpdatingEstado, setIsUpdatingEstado] = useState(false);
  
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const [linkGenerado, setLinkGenerado] = useState("");
  const [isGenerandoLink, setIsGenerandoLink] = useState(false);

  // 🔥 ACÁ ESTÁ LA CORRECCIÓN: Usamos window.location.origin
  const fetchSiniestro = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${id}`);
      const data = await res.json();
      
      if (res.ok) {
        setSiniestro(data);
        
        // Si el siniestro ya tiene un link activo, lo armamos con el dominio actual
        if (data.linksConsulta && data.linksConsulta.length > 0) {
          setLinkGenerado(`${window.location.origin}/consulta/${data.linksConsulta[0].token}`);
        }
      }
    } catch (err) {
      console.error("Error al cargar el siniestro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSiniestro(); }, [id]);

  const handleAgregarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    setIsSubmittingNota(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${id}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: nuevaNota })
      });

      if (!res.ok) throw new Error("Error al guardar la nota");

      setNuevaNota("");
      fetchSiniestro(); 
      setMensajeToast("Nota guardada en el historial de seguimiento");
      setShowToast(true);
    } catch (error) {
      alert("Error al intentar procesar la nota.");
    } finally {
      setIsSubmittingNota(false);
    }
  };

  const handleCambiarEstadoRapido = async (nuevoEstado: string) => {
    setIsUpdatingEstado(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...siniestro, estadoSiniestro: nuevoEstado })
      });

      if (!res.ok) throw new Error();

      fetchSiniestro();
      setMensajeToast(`Estado del trámite actualizado a: ${nuevoEstado}`);
      setShowToast(true);
    } catch (error) {
      alert("No se pudo actualizar el estado.");
    } finally {
      setIsUpdatingEstado(false);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse font-medium">Cargando expediente integral...</div>;
  if (!siniestro) return <div className="p-8 text-red-500 font-bold">Error: El siniestro solicitado no existe.</div>;

  const fechaHechoDate = new Date(siniestro.fechaHecho);
  const hoy = new Date();
  const diffTime = Math.abs(hoy.getTime() - fechaHechoDate.getTime());
  const diasTranscurridos = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case "Denuncia Pendiente": return "text-orange-700 bg-orange-50 border-orange-200";
      case "En Análisis": return "text-blue-700 bg-blue-50 border-blue-200";
      case "Aprobado": return "text-green-700 bg-green-50 border-green-200";
      case "Pagado": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "Rechazado": return "text-red-700 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const poliza = siniestro.poliza || {};
  const asegurado = poliza.asegurado || {};
  const compania = poliza.compania || {};

  const handleGenerarLink = async () => {
    setIsGenerandoLink(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${id}/generar-link`, { method: "POST" });
      const data = await res.json();
      
      // 🔥 CORRECCIÓN: Al generarlo por primera vez también usamos el dominio actual
      const urlFinal = data.urlPublica.replace(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '', window.location.origin);
      setLinkGenerado(urlFinal);
      
      setMensajeToast("Enlace de seguimiento generado y listo");
      setShowToast(true);
    } catch (err) {
      alert("Error al generar el link.");
    } finally {
      setIsGenerandoLink(false);
    }
  };

  const copiarAlPortapapeles = () => {
    navigator.clipboard.writeText(linkGenerado);
    setMensajeToast("¡Enlace copiado al portapapeles!");
    setShowToast(true);
  };

  const enviarPorWhatsApp = () => {
    if (!asegurado.telefono) {
      setMensajeToast("El asegurado no tiene un teléfono registrado.");
      setShowToast(true);
      return;
    }
    const numeroLimpio = asegurado.telefono.replace(/\D/g, '');
    const mensaje = `Hola ${asegurado.nombre}, te comparto el link seguro de tu portal de cliente para que sigas el avance de tu siniestro en tiempo real:\n\n${linkGenerado}`;
    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col p-4 md:p-8 w-full gap-6 md:gap-8 bg-white min-h-screen overflow-x-hidden">
      
      {/* Header Principal */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-all w-fit font-medium group text-sm md:text-base"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver a Siniestros
        </button>
        
        {/* Header card */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/40 p-4 md:p-6 rounded-2xl border border-gray-100">
          
          <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
            <div className="p-3 md:p-4 bg-orange-600 text-white rounded-2xl shadow-md shadow-orange-100 shrink-0">
              <AlertTriangle size={28} className="md:w-8 md:h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-gray-950 truncate">Expediente {siniestro.nroSiniestro}</h1>
                <span className={`w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-extrabold border ${getStatusStyle(siniestro.estadoSiniestro)}`}>
                  {siniestro.estadoSiniestro.toUpperCase()}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mt-1 flex items-center gap-2 font-medium">
                <Calendar size={14} /> Sucedido el {new Date(siniestro.fechaHecho).toLocaleDateString("es-AR")}
                <span className="text-gray-300">|</span>
                <span className="text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded text-[10px] md:text-xs">{diasTranscurridos} días transcurridos</span>
              </p>
            </div>
          </div>

          {/* Selector de estado */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase pl-2">Estado:</span>
            <select
              value={siniestro.estadoSiniestro}
              disabled={isUpdatingEstado}
              onChange={(e) => handleCambiarEstadoRapido(e.target.value)}
              className="flex-1 md:flex-none text-sm font-bold text-gray-700 bg-transparent outline-none cursor-pointer pr-2"
            >
              <option value="Denuncia Pendiente">Denuncia Pendiente</option>
              <option value="En Análisis">En Análisis</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Pagado">Pagado / Liquidado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Cerrado">Cerrado Administrativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Columna Principal */}
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
          
          {/* Declaración Inicial */}
          <div className="p-5 md:p-6 border border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col gap-5">
            <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
              <FileText size={18} className="text-orange-600 shrink-0" /> Declaración Inicial del Siniestro
            </h3>
            <div className="bg-gray-50/60 p-4 md:p-5 rounded-2xl border border-gray-200/50">
              <p className="text-gray-700 leading-relaxed text-xs md:text-sm whitespace-pre-wrap font-medium">
                {siniestro.descripcionInicial}
              </p>
            </div>
          </div>

          {/* Bitácora de Seguimiento */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-orange-600 shrink-0" /> Historial de Seguimiento / Notas
            </h3>
            
            <form onSubmit={handleAgregarNota} className="flex gap-3">
              <input 
                type="text" 
                placeholder="Añadir una novedad interna (ej: 'Documentación enviada a la compañía')..." 
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-xs md:text-sm font-medium"
              />
              <button 
                type="submit" 
                disabled={isSubmittingNota || !nuevaNota.trim()}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 md:px-5 py-3 rounded-xl font-bold transition-colors disabled:opacity-40 flex items-center gap-1.5 text-xs md:text-sm shrink-0"
              >
                <Send size={14} /> Registrar
              </button>
            </form>

            <div className="flex flex-col gap-3 mt-2">
              {siniestro.notas?.length === 0 ? (
                <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl text-xs md:text-sm italic">
                  No se registran novedades para este siniestro todavía.
                </div>
              ) : (
                siniestro.notas.map((nota: any) => (
                  <div key={nota.id} className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                      <span className="text-[10px] md:text-[11px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock size={12} className="shrink-0" />
                        {new Date(nota.fecha).toLocaleString("es-AR", { dateStyle: 'long', timeStyle: 'short' })}
                      </span>
                      <span className="text-[9px] md:text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Interno</span>
                    </div>
                    <p className="text-gray-800 text-xs md:text-sm font-medium leading-relaxed">{nota.texto}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="flex flex-col gap-6">
          
          {/* Tarjeta Riesgo / Vehículo */}
          <div className="p-5 md:p-6 border border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest border-b border-gray-50 pb-2">Riesgo Cubierto</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="p-2 bg-white text-gray-600 rounded-lg shadow-sm border border-gray-100 shrink-0">
                  <CarFront size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">Rama</p>
                  <p className="text-xs md:text-sm font-bold text-gray-800 break-words">{poliza.tipoPoliza}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/70">
                  <span className="block text-gray-400 font-medium mb-0.5 text-[10px] md:text-xs">Nro Póliza</span>
                  <span className="font-bold text-gray-800 text-xs md:text-sm">#{poliza.nroPoliza}</span>
                </div>
                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/70">
                  <span className="block text-gray-400 font-medium mb-0.5 text-[10px] md:text-xs">Patente</span>
                  <span className="font-mono font-bold text-gray-900 uppercase bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-xs text-xs md:text-sm">{poliza.patente || "N/A"}</span>
                </div>
              </div>

              {(poliza.marca || poliza.modelo || poliza.cobertura) && (
                <div className="bg-gray-50/30 p-3 md:p-4 rounded-xl border border-gray-100 flex flex-col gap-2 text-[10px] md:text-xs font-medium text-gray-600">
                  {poliza.marca && <p><span className="text-gray-400">Vehículo:</span> {poliza.marca} {poliza.modelo}</p>}
                  {poliza.cobertura && <p>• <span className="text-gray-400">Cobertura:</span> {poliza.cobertura}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta Asegurado */}
          <div className="p-5 md:p-6 border border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest border-b border-gray-50 pb-2">Asegurado Titular</h3>
            <div className="flex flex-col gap-3">
              <div className="min-w-0">
                <p className="text-base md:text-lg font-black text-gray-900 flex items-center gap-1.5 break-words">
                  <User size={16} className="text-gray-400 shrink-0" /> {asegurado.nombre} {asegurado.apellido}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 font-mono mt-0.5 ml-5">CUIT/DNI: {asegurado.dni}</p>
              </div>
              <div className="flex flex-col gap-1.5 text-xs md:text-sm font-medium text-gray-600 border-t border-gray-50 pt-2 ml-5">
                {asegurado.telefono && <p><span className="text-gray-400">Tel:</span> {asegurado.telefono}</p>}
                {asegurado.email && <p className="break-all"><span className="text-gray-400">Email:</span> {asegurado.email}</p>}
              </div>
            </div>
          </div>

          {/* Tarjeta Compañía */}
          <div className="p-5 md:p-6 border border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest border-b border-gray-50 pb-2">Compañía Emisora</h3>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl border border-gray-100 shrink-0">
                <Building size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold text-gray-900 break-words">{compania.nombre}</p>
                <p className="text-[10px] md:text-xs font-mono text-gray-400 mt-0.5">CUIT: {compania.cuit || "-"}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta Link de Seguimiento */}
          <div className="p-5 md:p-6 border border-gray-100 rounded-3xl bg-gray-900 text-white shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShieldCheck size={80} />
            </div>
            
            <h3 className="font-bold text-gray-400 uppercase text-[10px] md:text-xs tracking-widest border-b border-gray-700 pb-2">Acceso Cliente</h3>
            
            <p className="text-[10px] md:text-xs text-gray-300 font-medium leading-relaxed">
              Generá un link público y seguro para que el cliente siga el estado de su siniestro sin necesidad de usuario y contraseña.
            </p>

            {!linkGenerado ? (
              <button 
                onClick={handleGenerarLink}
                disabled={isGenerandoLink}
                className="mt-2 w-full bg-white text-gray-900 hover:bg-gray-100 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-colors disabled:opacity-50 active:scale-95"
              >
                {isGenerandoLink ? "Generando..." : "Crear Link de Seguimiento"}
              </button>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <input 
                  type="text" 
                  readOnly 
                  value={linkGenerado} 
                  className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-[10px] md:text-xs p-3 rounded-xl outline-none truncate font-mono"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={copiarAlPortapapeles}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2.5 rounded-xl font-bold text-[10px] md:text-xs transition-colors active:scale-95"
                  >
                    Copiar
                  </button>
                  <button 
                    onClick={enviarPorWhatsApp}
                    className="flex-[2] bg-green-500 hover:bg-green-400 text-gray-900 px-3 py-2.5 rounded-xl font-black text-[10px] md:text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <MessageCircle size={14} className="shrink-0" /> WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Auditoría Temporal */}
          <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1.5 text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">
            <div className="flex justify-between">
              <span>Fecha de Reporte:</span>
              <span className="text-gray-600">{new Date(siniestro.fechaCreacion).toLocaleDateString("es-AR")}</span>
            </div>
            {siniestro.fechaCierre && (
              <div className="flex justify-between text-emerald-600">
                <span>Fecha de Resolución:</span>
                <span>{new Date(siniestro.fechaCierre).toLocaleDateString("es-AR")}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}