"use client";

import { useState, useEffect } from "react";
import { User, Save, Camera } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/ui/Toast";

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
      const res = await fetch("http://localhost:3001/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-20 w-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
            {nombre.substring(0, 2).toUpperCase() || "U"}
          </div>
          <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-gray-200 text-gray-500 hover:text-green-600 shadow-sm transition-colors">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Información Personal</h3>
          <p className="text-sm text-gray-500">Actualizá tu nombre y foto de perfil.</p>
        </div>
      </div>

      <div className="max-w-md flex flex-col gap-1.5">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <User size={14} className="text-gray-400" /> Nombre Completo
        </label>
        <input 
          type="text" 
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600 transition-all text-gray-900" 
        />
      </div>

      <div className="flex justify-start">
        <button 
          onClick={guardarDatosBasicos}
          disabled={isSaving || nombre === user?.nombre}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          <Save size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <Toast message="Perfil actualizado correctamente" isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}