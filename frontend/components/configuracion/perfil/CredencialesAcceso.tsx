"use client";

import { useState } from "react";
import { Mail, CheckCircle2, ShieldAlert, ArrowRight, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/ui/Toast";

export default function CredencialesAcceso() {
  const { user, setUser } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  
  // Nuevo estado para manejar errores de forma visual
  const [errorMsg, setErrorMsg] = useState("");

  const solicitarCambioEmail = async () => {
    setErrorMsg(""); // Limpiamos errores previos
    
    if (!newEmail || !newEmail.includes("@")) {
      return setErrorMsg("Por favor, ingresá un correo válido.");
    }
    
    // --> ACÁ ESTÁ EL FILTRO NUEVO <--
    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      return setErrorMsg("El correo ingresado es exactamente el mismo que ya tenés.");
    }
    
    setIsProcessingEmail(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/request-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, newEmail }),
      });

      if (res.ok) {
        setEmailStep(2);
        setToastMessage("Código enviado a tu nuevo correo.");
        setShowToast(true);
      } else {
        setErrorMsg("Hubo un error al intentar enviar el correo.");
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setIsProcessingEmail(false);
    }
  };

  const verificarYGuardarEmail = async () => {
    setErrorMsg("");
    if (verificationCode.length !== 6) {
      return setErrorMsg("El código debe tener exactamente 6 dígitos.");
    }
    
    setIsProcessingEmail(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, codigo: verificationCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        setToastMessage("Tu correo de acceso ha sido actualizado.");
        setShowToast(true);
        cerrarModalEmail();
      } else {
        setErrorMsg(data.error || "El código ingresado es incorrecto.");
      }
    } catch (error) {
      setErrorMsg("Error de conexión con el servidor.");
    } finally {
      setIsProcessingEmail(false);
    }
  };

  const cerrarModalEmail = () => {
    setShowEmailModal(false);
    setEmailStep(1);
    setNewEmail("");
    setVerificationCode("");
    setErrorMsg(""); // Limpiamos errores al cerrar
  };

  return (
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

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
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

            <div className="p-6 flex flex-col gap-4">
              {/* CARTEL DE ERROR INLINE */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {emailStep === 1 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700">Nuevo Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@nuevo.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setErrorMsg(""); // Limpia el error al tipear
                    }}
                    className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900" 
                  />
                </div>
              )}

              {emailStep === 2 && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <p className="text-sm text-blue-800">
                      Enviamos un código de 6 dígitos a <strong>{newEmail}</strong>. Ingresalo abajo para confirmar.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-center mt-2">
                    <label className="text-sm font-bold text-gray-700">Código de Verificación</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, ''));
                        setErrorMsg(""); // Limpia el error al tipear
                      }}
                      className="w-32 p-3 text-center text-2xl tracking-[0.2em] font-bold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-900" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={cerrarModalEmail} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
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