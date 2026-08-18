"use client";

import { useState } from "react";
import { Mail, CheckCircle2, ShieldAlert, ArrowRight, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/ui/Toast";
import { apiFetch } from "@/services/api"; 

export default function CredencialesAcceso() {
  const { user, setUser } = useAuthStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessingEmail, setIsProcessingEmail] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");

  const solicitarCambioEmail = async () => {
    setErrorMsg(""); 
    
    if (!newEmail || !newEmail.includes("@")) {
      return setErrorMsg("Por favor, ingresá un correo válido.");
    }
    
    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      return setErrorMsg("El correo ingresado es exactamente el mismo que ya tenés.");
    }
    
    setIsProcessingEmail(true);
    
    try {
      const res = await apiFetch(`/api/auth/request-email-change`, {
        method: "POST",
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
      const res = await apiFetch(`/api/auth/verify-email-change`, {
        method: "POST",
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
    setErrorMsg(""); 
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-5 md:gap-6 transition-colors">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
          <KeyRound size={18} className="text-gray-400 dark:text-gray-500" /> Credenciales de Acceso
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Este es el correo que utilizás para iniciar sesión en AseguraSimple.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">Correo Actual</p>
          <div className="flex flex-wrap items-center gap-2">
            <Mail size={16} className="text-gray-700 dark:text-gray-300 transition-colors" />
            <span className="font-semibold text-gray-900 dark:text-white break-all transition-colors">{user?.email}</span>
            <span className="flex items-center gap-1 text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide transition-colors">
              <CheckCircle2 size={12} /> Verificado
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowEmailModal(true)}
          className="w-full md:w-auto flex justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 md:py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Cambiar Correo
        </button>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
          <div className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto transition-colors">
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex items-start gap-3 md:gap-4 bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 md:p-3 rounded-full text-blue-600 dark:text-blue-500 shrink-0 transition-colors">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white transition-colors">Cambio de Credenciales</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-1 transition-colors">
                  Por seguridad, verificaremos tu nuevo correo electrónico antes de aplicarlo.
                </p>
              </div>
            </div>

            <div className="p-4 md:p-6 flex flex-col gap-4">
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/30 p-3 rounded-xl text-sm font-medium transition-colors">
                  {errorMsg}
                </div>
              )}

              {emailStep === 1 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Nuevo Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@nuevo.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setErrorMsg(""); 
                    }}
                    className="p-3 bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" 
                  />
                </div>
              )}

              {emailStep === 2 && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl transition-colors">
                    <p className="text-sm text-blue-800 dark:text-blue-300 break-all transition-colors">
                      Enviamos un código de 6 dígitos a <strong>{newEmail}</strong>. Ingresalo abajo para confirmar.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-center mt-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Código de Verificación</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, ''));
                        setErrorMsg(""); 
                      }}
                      className="w-32 p-3 text-center text-2xl tracking-[0.2em] font-bold bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
              <button onClick={cerrarModalEmail} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Cancelar
              </button>
              {emailStep === 1 ? (
                <button 
                  onClick={solicitarCambioEmail}
                  disabled={!newEmail || isProcessingEmail}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 sm:py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 rounded-lg transition-colors"
                >
                  {isProcessingEmail ? "Procesando..." : "Enviar Código"} <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={verificarYGuardarEmail}
                  disabled={verificationCode.length !== 6 || isProcessingEmail}
                  className="w-full sm:w-auto flex justify-center items-center px-5 py-2.5 sm:py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 dark:disabled:bg-green-800 rounded-lg transition-colors"
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