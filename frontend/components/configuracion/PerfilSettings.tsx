"use client";

import { useState, useEffect } from "react";
import { Save, UploadCloud } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; 

export default function PerfilSettings() {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [agencia, setAgencia] = useState({
    nombre: "",
    cuit: "",
    email: "",
    telefono: "",
    firma: "",
    usarFirma: false,
  });

  useEffect(() => {
    const fetchAgencia = async () => {
      try {
        const res = await apiFetch("/api/agencia"); 
        
        if (res.ok) {
          const data = await res.json();
          setAgencia({
            nombre: data.nombre || "",
            cuit: data.cuit || "",
            email: data.email || "",
            telefono: data.telefono || "",
            firma: data.firma || "",
            usarFirma: data.usarFirma || false, 
          });
        }
      } catch (error) {
        console.error("Error al cargar datos de la agencia", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencia();
  }, []);

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch("/api/agencia", {
        method: "PUT",
        body: JSON.stringify(agencia),
      });

      if (res.ok) {
        setShowToast(true);
      } else {
        alert("Hubo un error al guardar. El servidor denegó la petición.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAgencia({ ...agencia, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <div className="text-gray-500 dark:text-gray-400 animate-pulse p-4 transition-colors">Cargando perfil...</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* SECCIÓN: Logo de la Agencia */}
      {/* 🔥 Adaptamos contenedor y textos */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">Identidad Visual</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-2">
          {/* 🔥 Círculo del logo adaptado */}
          <div className="h-20 w-20 shrink-0 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-green-700 dark:text-green-500 transition-colors">
            {agencia.nombre ? agencia.nombre.substring(0, 2).toUpperCase() : "AS"}
          </div>
          <div className="w-full sm:w-auto">
            {/* 🔥 Botón de subir logo oscurecido */}
            <button className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm cursor-not-allowed">
              <UploadCloud size={16} /> Subir nuevo logo (Próximamente)
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center sm:text-left transition-colors">Recomendado: 256x256px, formato PNG o JPG.</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Datos Comerciales */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 transition-colors">Datos Comerciales</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* 🔥 Inputs transparentes para que adapten el fondo y texto blanco en modo oscuro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nombre de la Agencia</label>
            <input 
              type="text" name="nombre" value={agencia.nombre} onChange={handleChange} 
              className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">CUIT / Matrícula</label>
            <input 
              type="text" name="cuit" value={agencia.cuit} onChange={handleChange} placeholder="Ej: 20-34567890-1"
              className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Correo Electrónico</label>
            <input 
              type="email" name="email" value={agencia.email} onChange={handleChange} placeholder="contacto@agencia.com"
              className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">WhatsApp Profesional</label>
            <input 
              type="text" name="telefono" value={agencia.telefono} onChange={handleChange} placeholder="+54 9..."
              className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" 
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 transition-colors">Incluir firma en correos</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Añade tu firma y datos de contacto al pie de los correos automáticos.</p>
            </div>
            <button
              type="button"
              onClick={() => setAgencia({ ...agencia, usarFirma: !agencia.usarFirma })}
              // 🔥 Switch de encendido/apagado adaptado al modo oscuro
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${agencia.usarFirma ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${agencia.usarFirma ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {agencia.usarFirma && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <textarea 
                rows={3} name="firma" value={agencia.firma} onChange={handleChange} placeholder="Saludos cordiales, Equipo de AseguraSimple..." 
                className="w-full p-3 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 resize-none text-sm transition-colors"
              ></textarea>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button 
            onClick={guardarCambios} 
            disabled={isSaving}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-green-400 dark:disabled:bg-green-600 text-white px-5 py-3 md:py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} /> {isSaving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      </div>

      <Toast message="Perfil actualizado correctamente" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}