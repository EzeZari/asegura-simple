"use client";

import { useState } from "react";
import { Key, Check, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; 
import Toast from "@/components/ui/Toast";

export default function CambioContrasena() {
  const user = useAuthStore((state) => state.user);
  const [showToast, setShowToast] = useState(false);
  
  const [passwords, setPasswords] = useState({ actual: "", nueva: "", confirmacion: "" });
  const [passError, setPassError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPassError(""); 
  };

  const tieneLongitud = passwords.nueva.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(passwords.nueva);
  const tieneNumero = /[0-9]/.test(passwords.nueva);
  const esDiferente = passwords.nueva !== passwords.actual && passwords.nueva.length > 0;
  const cumpleRequisitos = tieneLongitud && tieneMayuscula && tieneNumero && esDiferente;

  const cambiarContrasena = async () => {
    if (!passwords.actual || !passwords.nueva || !passwords.confirmacion) return setPassError("Todos los campos son obligatorios.");
    if (!cumpleRequisitos) return setPassError("La nueva contraseña no cumple con los requisitos.");
    if (passwords.nueva !== passwords.confirmacion) return setPassError("Las contraseñas nuevas no coinciden.");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, actual: passwords.actual, nueva: passwords.nueva })
      });
      const data = await res.json();
      if (!res.ok) return setPassError(data.error || "Hubo un error al cambiar la contraseña.");

      setShowToast(true);
      setPasswords({ actual: "", nueva: "", confirmacion: "" });
    } catch (error) {
      setPassError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-5 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 flex items-center gap-2 transition-colors">
        <Key size={18} className="text-gray-400 dark:text-gray-500" /> Cambio de Contraseña
      </h3>
      <div className="max-w-md flex flex-col gap-4">
        {passError && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 transition-colors">{passError}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Contraseña Actual</label>
          <input type="password" name="actual" value={passwords.actual} onChange={handleChange} className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nueva Contraseña</label>
            <input type="password" name="nueva" value={passwords.nueva} onChange={handleChange} className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Repetir Nueva</label>
            <input type="password" name="confirmacion" value={passwords.confirmacion} onChange={handleChange} className="w-full p-2.5 bg-transparent border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 transition-colors" />
          </div>
        </div>

        {passwords.nueva.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 transition-colors">La contraseña debe tener:</p>
            <div className="flex items-center gap-2 text-xs">
              {tieneLongitud ? <Check size={14} className="text-green-600 dark:text-green-500" /> : <X size={14} className="text-gray-400 dark:text-gray-600" />}
              <span className={tieneLongitud ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-500"}>Al menos 8 caracteres</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {tieneMayuscula ? <Check size={14} className="text-green-600 dark:text-green-500" /> : <X size={14} className="text-gray-400 dark:text-gray-600" />}
              <span className={tieneMayuscula ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-500"}>Una letra mayúscula</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {tieneNumero ? <Check size={14} className="text-green-600 dark:text-green-500" /> : <X size={14} className="text-gray-400 dark:text-gray-600" />}
              <span className={tieneNumero ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-500"}>Un número</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {esDiferente ? <Check size={14} className="text-green-600 dark:text-green-500" /> : <X size={14} className="text-gray-400 dark:text-gray-600" />}
              <span className={esDiferente ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-500 dark:text-gray-500"}>Ser diferente a la actual</span>
            </div>
          </div>
        )}
        
        <button onClick={cambiarContrasena} disabled={passwords.nueva.length > 0 && !cumpleRequisitos} className="mt-2 w-full sm:w-fit bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 text-white dark:text-gray-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors">
          Actualizar Contraseña
        </button>
      </div>
      <Toast message="Contraseña actualizada con éxito." isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}