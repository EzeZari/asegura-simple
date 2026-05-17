"use client";

import { useState, useEffect } from "react";
import { User, Mail, Save, Camera, CheckCircle2, ShieldAlert, ArrowRight, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/ui/Toast";

export default function MiPerfilSettings() {
  const { user, setUser } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ESTADO PARA DATOS BÁSICOS
  const [formData, setFormData] = useState({ nombre: "" });

  // ESTADOS PARA EL FLUJO DE CAMBIO DE CORREO
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ nombre: user.nombre || "" });
    }
  }, [user]);

  // --- 1. GUARDAR DATOS BÁSICOS (Nombre) ---
  const guardarDatosBasicos = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, nombre: formData.nombre, email: user?.email }),
      });

      if (res.ok) {
        const usuarioActualizado = await res.json();
        setUser(usuarioActualizado);
        setToastMessage("Perfil actualizado correctamente");
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

  // --- 2. FLUJO DE CAMBIO DE EMAIL ---
  const solicitarCambioEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) return alert("Ingresá un correo válido.");
    setIsProcessingEmail(true);
    
    // Simulamos que el backend manda un mail con el código
    setTimeout(() => {
      setIsProcessingEmail(false);
      setEmailStep(2); // Pasamos al paso de ingresar el código
    }, 1500);
  };

  const verificarYGuardarEmail = async () => {
    if (verificationCode.length !== 6) return alert("El código debe tener 6 dígitos.");
    setIsProcessingEmail(true);

    try {
      // Usamos el mismo endpoint, pero ahora le mandamos el nuevo email
      const res = await fetch("http://localhost:3001/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, nombre: formData.nombre, email: newEmail }),
      });

      if (res.ok) {
        const usuarioActualizado = await res.json();
        setUser(usuarioActualizado);
        setToastMessage("Tu correo de acceso ha sido actualizado.");
        setShowToast(true);
        cerrarModalEmail();
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsProcessingEmail(false);
    }
  };

  const cerrarModalEmail = () => {
    setShowEmailModal(false);
    setEmailStep(1);
    setNewEmail("");
    setVerificationCode("");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
      
      {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
              {formData.nombre.substring(0, 2).toUpperCase() || "U"}
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
            value={formData.nombre}
            onChange={(e) => setFormData({ nombre: e.target.value })}
            className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600 transition-all text-gray-900" 
          />
        </div>

        <div className="flex justify-start">
          <button 
            onClick={guardarDatosBasicos}
            disabled={isSaving || formData.nombre === user?.nombre}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            <Save size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: CREDENCIALES DE ACCESO (EMAIL) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <KeyRound size={18} className="text-gray-400" /> Credenciales de Acceso
          </h3>
          <p className="text-sm text-gray-500 mt-1">Este es el correo que utilizás para iniciar sesión en AseguraSimple.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Correo Actual</p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-700" />
              <span className="font-semibold text-gray-900">{user?.email}</span>
              <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ml-2">
                <CheckCircle2 size={12} /> Verificado
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowEmailModal(true)}
            className="bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Cambiar Correo
          </button>
        </div>
      </div>

      {/* MODAL DE CAMBIO DE EMAIL */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            
            {/* Cabecera del modal */}
            <div className="p-6 border-b border-gray-100 flex items-start gap-4 bg-gray-50/50">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cambio de Credenciales</h3>
                <p className="text-sm text-gray-500 leading-relaxed mt-1">
                  Por seguridad, verificaremos tu nuevo correo electrónico antes de aplicarlo.
                </p>
              </div>
            </div>

            {/* Cuerpo del modal: PASO 1 */}
            {emailStep === 1 && (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">Nuevo Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@nuevo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900" 
                  />
                </div>
              </div>
            )}

            {/* Cuerpo del modal: PASO 2 */}
            {emailStep === 2 && (
              <div className="p-6 flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-sm text-blue-800">
                    Enviamos un código de 6 dígitos a <strong>{newEmail}</strong>. Ingresalo abajo para confirmar el cambio.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 items-center mt-2">
                  <label className="text-sm font-bold text-gray-700">Código de Verificación</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} // Solo números
                    className="w-32 p-3 text-center text-2xl tracking-[0.2em] font-bold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900" 
                  />
                </div>
              </div>
            )}

            {/* Footer del modal */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={cerrarModalEmail}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              {emailStep === 1 ? (
                <button 
                  onClick={solicitarCambioEmail}
                  disabled={!newEmail || isProcessingEmail}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                >
                  {isProcessingEmail ? "Procesando..." : "Enviar Código"} <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={verificarYGuardarEmail}
                  disabled={verificationCode.length !== 6 || isProcessingEmail}
                  className="px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-lg transition-colors"
                >
                  {isProcessingEmail ? "Verificando..." : "Verificar y Cambiar"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}