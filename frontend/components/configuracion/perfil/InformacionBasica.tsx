"use client";

import { useState, useEffect } from "react";
import { User, Save, Camera } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; 

export default function InformacionBasica() {
  const { user, setUser } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (user) setNombre(user.nombre || "");
  }, [user]);

  const guardarDatosBasicos = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/auth/update-profile`, {
        method: "PUT",
        body: JSON.stringify({ id: user?.id, nombre, email: user?.email }),
      });

      if (res.ok) {
        const usuarioActualizado = await res.json();
        setUser(usuarioActualizado);
        setShowToast(true);
      } else {
        alert("Error al guardar los cambios");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-8 transition-colors">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-sm transition-colors">
            {nombre.substring(0, 2).toUpperCase() || "U"}
          </div>
          <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-1.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 shadow-sm transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Información Personal</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">Actualizá tu nombre y foto de perfil.</p>
        </div>
      </div>

      <div className="max-w-md flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors">
          <User size={14} className="text-gray-400 dark:text-gray-500 transition-colors" /> Nombre Completo
        </label>
        <input 
          type="text" 
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="p-3 bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
        />
      </div>

      <div className="flex justify-start">
        <button 
          onClick={guardarDatosBasicos}
          disabled={isSaving || nombre === user?.nombre}
          className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
        >
          <Save size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <Toast message="Perfil actualizado correctamente" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}