"use client";

import { useState, useEffect } from "react";
import { Save, UploadCloud } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function PerfilSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // El estado donde guardamos todo lo que escribís en los inputs
  const [agencia, setAgencia] = useState({
    nombre: "",
    cuit: "",
    email: "",
    telefono: "",
    firma: "",
  });

  // 1. CARGAR DATOS AL ENTRAR
  useEffect(() => {
    const fetchAgencia = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/agencia");
        const data = await res.json();
        // Si la base de datos devuelve nulos, los convertimos a string vacío para que React no se queje
        setAgencia({
          nombre: data.nombre || "",
          cuit: data.cuit || "",
          email: data.email || "",
          telefono: data.telefono || "",
          firma: data.firma || "",
        });
      } catch (error) {
        console.error("Error al cargar datos de la agencia", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencia();
  }, []);

  // 2. FUNCIÓN PARA GUARDAR (El PUT al backend)
  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:3001/api/agencia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agencia),
      });

      if (res.ok) {
        setShowToast(true);
      } else {
        alert("Hubo un error al guardar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  // Función genérica para manejar los cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAgencia({ ...agencia, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <div className="text-gray-500 animate-pulse p-4">Cargando perfil...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* SECCIÓN: Logo de la Agencia (Aún inactivo funcionalmente) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Identidad Visual</h3>
        <div className="flex items-center gap-6 mt-2">
          <div className="h-20 w-20 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
            {agencia.nombre ? agencia.nombre.substring(0, 2).toUpperCase() : "AS"}
          </div>
          <div>
            <button className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-400 px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-not-allowed">
              <UploadCloud size={16} /> Subir nuevo logo (Próximamente)
            </button>
            <p className="text-xs text-gray-400 mt-2">Recomendado: 256x256px, formato PNG o JPG.</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Datos Comerciales */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Datos Comerciales</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Agencia</label>
            <input 
              type="text" name="nombre" value={agencia.nombre} onChange={handleChange} 
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CUIT / Matrícula</label>
            <input 
              type="text" name="cuit" value={agencia.cuit} onChange={handleChange} placeholder="Ej: 20-34567890-1"
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" name="email" value={agencia.email} onChange={handleChange} placeholder="contacto@agencia.com"
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Profesional</label>
            <input 
              type="text" name="telefono" value={agencia.telefono} onChange={handleChange} placeholder="+54 9..."
              className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 transition-shadow" 
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Firma para correos y mensajes (Opcional)</label>
          <textarea 
            rows={3} name="firma" value={agencia.firma} onChange={handleChange} placeholder="Saludos cordiales, Equipo de AseguraSimple..." 
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 resize-none text-sm"
          ></textarea>
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={guardarCambios} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </div>

      <Toast message="Perfil actualizado correctamente" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}