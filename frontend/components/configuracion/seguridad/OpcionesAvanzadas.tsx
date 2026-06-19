"use client";

import { useState, useEffect } from "react";
import { Shield, Smartphone, Laptop, AlertOctagon, TriangleAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; 
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; // 🔥 IMPORTAMOS NUESTRO FETCH SEGURO

export default function OpcionesAvanzadas() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state: any) => state.setUser); 

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
      // 🔥 ACTUALIZADO A APIFETCH
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
      // 🔥 ACTUALIZADO A APIFETCH PARA VIAJAR CON TOKEN
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
    <div className="flex flex-col gap-5 md:gap-8">
      
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
          <Shield size={18} className="text-gray-400" /> Autenticación en Dos Pasos (2FA)
        </h3>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Proteger cuenta con código adicional</p>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">Agrega una capa extra de seguridad. Además de tu contraseña, te pediremos un código de 6 dígitos enviado a tu correo/celular.</p>
          </div>
          <button 
            onClick={toggle2FA} 
            className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
          <Smartphone size={18} className="text-gray-400" /> Dispositivos y Sesiones
        </h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-200 gap-3 sm:gap-0">
          <div className="flex items-center gap-4">
            <Laptop className="text-green-600 shrink-0" size={24} />
            <div>
              <p className="text-sm font-bold text-gray-900 flex flex-wrap items-center gap-2">
                Navegador Actual 
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Sesión Activa</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Acceso autorizado</p>
            </div>
          </div>
          <span className="text-sm text-gray-400 font-medium ml-10 sm:ml-0">Ahora</span>
        </div>
      </div>

      <div className="bg-red-50/30 p-4 md:p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-red-700 border-b border-red-100 pb-2 flex items-center gap-2">
          <AlertOctagon size={18} /> Zona de Peligro
        </h3>
        <p className="text-sm text-red-900/80">Acciones irreversibles. Procedé con absoluta precaución. Una vez que borrás la información, no hay vuelta atrás.</p>
        <div className="flex gap-4 mt-2">
          <button 
            onClick={() => setShowDangerModal(true)}
            className="w-full sm:w-auto bg-white border border-red-200 text-red-700 hover:bg-red-50 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Vaciar toda la base de datos
          </button>
        </div>
      </div>

      {showDangerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-red-600 p-4 md:p-6 flex flex-col items-center justify-center text-white gap-3">
              <TriangleAlert size={48} className="text-red-200" />
              <h3 className="text-xl font-bold text-center">¡Estás a punto de borrar todo!</h3>
            </div>
            
            <div className="p-4 md:p-6 flex flex-col gap-4">
              <p className="text-sm text-gray-700 text-center">
                Esta acción es <strong>permanente</strong>. Se eliminarán todas las pólizas, asegurados y el historial de actividad de tu agencia.
              </p>
              
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-semibold text-gray-900 text-center">
                  Escribí la palabra <span className="text-red-600 select-none">ELIMINAR</span> para confirmar:
                </label>
                <input 
                  type="text" 
                  value={palabraConfirmacion}
                  onChange={(e) => setPalabraConfirmacion(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full text-center border-2 border-red-100 focus:border-red-500 rounded-lg p-3 font-bold text-red-700 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button 
                onClick={() => { setShowDangerModal(false); setPalabraConfirmacion(""); }}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={vaciarBaseDeDatos}
                disabled={palabraConfirmacion !== "ELIMINAR" || isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed rounded-lg transition-colors"
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