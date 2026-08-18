"use client";

import { useState, useEffect } from "react";
import { Shield, Smartphone, Laptop, AlertOctagon, TriangleAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; 
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api";
import { PERMISOS, tienePermiso } from "@/utils/roles"; 

export default function OpcionesAvanzadas() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state: any) => state.setUser); 

  const esDueno = tienePermiso(user, PERMISOS.PUEDE_EDITAR_PLAN);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [showDangerModal, setShowDangerModal] = useState(false);
  const [palabraConfirmacion, setPalabraConfirmacion] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const usuarioLoco = user as any; 
    if (usuarioLoco && typeof usuarioLoco.twoFactorEnabled === 'boolean') {
      setTwoFactorEnabled(usuarioLoco.twoFactorEnabled);
    }
  }, [user]);

  const toggle2FA = async () => {
    const newState = !twoFactorEnabled;
    setTwoFactorEnabled(newState); 

    try {
      const res = await apiFetch('/api/auth/2fa', {
        method: "PUT",
        body: JSON.stringify({ email: user?.email, enabled: newState })
      });

      if (res.ok) {
        if (user) {
          setUser({ ...user, twoFactorEnabled: newState } as any); 
        }
        setToastMessage(newState ? "2FA Activado" : "2FA Desactivado");
        setShowToast(true);
      } else {
        throw new Error("Error en el servidor");
      }

    } catch (error) {
      setTwoFactorEnabled(!newState); 
      alert("Error al guardar la preferencia.");
    }
  };

  const vaciarBaseDeDatos = async () => {
    if (palabraConfirmacion !== "ELIMINAR") return;
    setIsDeleting(true);

    try {
      const res = await apiFetch('/api/auth/wipe-data', {
        method: "DELETE",
        body: JSON.stringify({ email: user?.email, confirmacion: palabraConfirmacion })
      });

      if (res.ok) {
        setToastMessage("Tu base de datos fue vaciada por completo.");
        setShowToast(true);
        setShowDangerModal(false);
        setPalabraConfirmacion("");
      } else {
        const data = await res.json();
        alert(data.error || "Hubo un error al vaciar los datos.");
      }
    } catch (error) {
      alert("Error de conexión.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 md:gap-8 transition-colors">
      
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 flex items-center gap-2 transition-colors">
          <Shield size={18} className="text-gray-400 dark:text-gray-500" /> Autenticación en Dos Pasos (2FA)
        </h3>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 transition-colors">Proteger cuenta con código adicional</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl transition-colors">Agrega una capa extra de seguridad. Además de tu contraseña, te pediremos un código de 6 dígitos enviado a tu correo/celular.</p>
          </div>
          <button 
            onClick={toggle2FA} 
            className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-gray-700 pb-2 flex items-center gap-2 transition-colors">
          <Smartphone size={18} className="text-gray-400 dark:text-gray-500" /> Dispositivos y Sesiones
        </h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 gap-3 sm:gap-0 transition-colors">
          <div className="flex items-center gap-4">
            <Laptop className="text-green-600 dark:text-green-500 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2 transition-colors">
                Navegador Actual 
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full transition-colors">Sesión Activa</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">Acceso autorizado</p>
            </div>
          </div>
          <span className="text-sm text-gray-400 dark:text-gray-500 font-medium ml-10 sm:ml-0 transition-colors">Ahora</span>
        </div>
      </div>

      {esDueno && (
        <div className="bg-red-50/30 dark:bg-red-900/10 p-4 md:p-6 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm flex flex-col gap-4 transition-colors">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-500 border-b border-red-100 dark:border-red-900/30 pb-2 flex items-center gap-2 transition-colors">
            <AlertOctagon size={18} /> Zona de Peligro
          </h3>
          <p className="text-sm text-red-900/80 dark:text-red-400/80 transition-colors">Acciones irreversibles. Procedé con absoluta precaución. Una vez que borrás la información, no hay vuelta atrás.</p>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setShowDangerModal(true)}
              className="w-full sm:w-auto bg-white dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Vaciar toda la base de datos
            </button>
          </div>
        </div>
      )}

      {esDueno && showDangerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
          <div className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col transition-colors">
            <div className="bg-red-600 dark:bg-red-700 p-4 md:p-6 flex flex-col items-center justify-center text-white gap-3 transition-colors">
              <TriangleAlert size={48} className="text-red-200 dark:text-red-300" />
              <h3 className="text-xl font-bold text-center">¡Estás a punto de borrar todo!</h3>
            </div>
            
            <div className="p-4 md:p-6 flex flex-col gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 text-center transition-colors">
                Esta acción es <strong>permanente</strong>. Se eliminarán todas las pólizas, asegurados y el historial de actividad de tu agencia.
              </p>
              
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-gray-200 text-center transition-colors">
                  Escribí la palabra <span className="text-red-600 dark:text-red-500 select-none">ELIMINAR</span> para confirmar:
                </label>
                <input 
                  type="text" 
                  value={palabraConfirmacion}
                  onChange={(e) => setPalabraConfirmacion(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full text-center bg-transparent border-2 border-red-100 dark:border-red-900/50 focus:border-red-500 dark:focus:border-red-500 rounded-lg p-3 font-bold text-red-700 dark:text-red-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3 transition-colors">
              <button 
                onClick={() => { setShowDangerModal(false); setPalabraConfirmacion(""); }}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={vaciarBaseDeDatos}
                disabled={palabraConfirmacion !== "ELIMINAR" || isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isDeleting ? "Borrando..." : "Sí, vaciar datos"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}