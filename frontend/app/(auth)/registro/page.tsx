"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { validarEmail, validarTelefono, validarPassword } from "@/utils/validaciones";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 🔥 AHORA GUARDAMOS LOS ERRORES POR CAMPO
  const [errores, setErrores] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState({ text: "", type: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores({}); // Limpiamos errores previos

    const nuevosErrores: Record<string, string> = {};

    // 1. Validar campos vacíos
    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (!email.trim()) nuevosErrores.email = "El email es obligatorio.";
    if (!telefono.trim()) nuevosErrores.telefono = "El teléfono es obligatorio.";
    if (!password) nuevosErrores.password = "La contraseña es obligatoria.";
    if (!confirmPassword) nuevosErrores.confirmPassword = "Debes confirmar tu contraseña.";

    // 2. Validación Legal
    if (!aceptaTerminos) {
      nuevosErrores.terminos = "Debes aceptar los Términos y Condiciones.";
    }

    // 3. Coincidencia de contraseñas
    if (password && confirmPassword && password !== confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden.";
    }

    // 4. Validaciones centralizadas (solo si escribieron algo)
    if (email) {
      const errorEmail = validarEmail(email, true);
      if (errorEmail) nuevosErrores.email = errorEmail;
    }
    if (telefono) {
      const errorTelefono = validarTelefono(telefono, true);
      if (errorTelefono) nuevosErrores.telefono = errorTelefono;
    }
    if (password) {
      const errorPassword = validarPassword(password);
      if (errorPassword) nuevosErrores.password = errorPassword;
    }

    // Si hay algún error, cortamos acá y mostramos los rojos
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrores({ general: data.error || "Error al crear la cuenta." });
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setErrores({ general: "Error de conexión con el servidor." });
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), 
      });

      const data = await response.json();

      if (!response.ok) {
        setResendMessage({ text: data.error || "Error al reenviar el correo.", type: "error" });
      } else {
        setResendMessage({ text: "¡Correo reenviado! Revisá tu bandeja de entrada o Spam.", type: "success" });
      }
    } catch (err) {
      setResendMessage({ text: "Error de conexión con el servidor.", type: "error" });
    } finally {
      setIsResending(false);
    }
  };

  // 🔥 FUNCIÓN PARA ESTILOS DINÁMICOS DEL BORDE
  const getInputClass = (campo: string) => {
    const baseClass = "w-full border rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none transition-all disabled:bg-gray-50 ";
    if (errores[campo]) {
      return baseClass + "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/30";
    }
    return baseClass + "border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600";
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6 my-auto py-10 px-4 md:px-0">

      {isSuccess ? (
        <div className="flex flex-col items-center text-center gap-6 py-12 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <MailCheck className="text-blue-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">¡Casi listo!</h1>
          <div className="flex flex-col gap-2">
            <p className="text-gray-600 text-base md:text-lg">
              Te enviamos un correo electrónico a <br/><strong className="text-gray-900">{email}</strong>.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Hacé clic en el enlace del mensaje para confirmar tu cuenta y poder iniciar sesión. Si no lo ves, revisá la carpeta de Spam.
            </p>
          </div>
          
          <div className="w-full flex flex-col gap-3 mt-4">
            <Link href="/login" className="w-full bg-gray-900 text-white text-base font-medium rounded-lg py-3 hover:bg-black transition-colors text-center shadow-sm">
              Volver a Iniciar Sesión
            </Link>
            
            <button 
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-sm text-gray-500 font-medium hover:text-blue-600 hover:underline transition-colors mt-2 disabled:opacity-50 disabled:no-underline"
            >
              {isResending ? "Reenviando..." : "¿No recibiste el correo? Reenviar"}
            </button>
            
            {resendMessage.text && (
              <p className={`text-sm mt-1 ${resendMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {resendMessage.text}
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl md:text-4xl leading-tight font-bold text-gray-900 tracking-tight">Creá tu cuenta</h1>
            {/* Error General (ej: Backend caído) */}
            {errores.general && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-medium">{errores.general}</div>}
          </div>

          {/* 🔥 AGREGAMOS noValidate PARA APAGAR LOS CARTELES NATIVOS DE GOOGLE */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-2" noValidate>
            
            <div>
              <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={isLoading} className={getInputClass('nombre')} />
              {errores.nombre && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errores.nombre}</p>}
            </div>

            <div>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className={getInputClass('email')} />
              {errores.email && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errores.email}</p>}
            </div>

            <div>
              <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={isLoading} className={getInputClass('telefono')} />
              {errores.telefono && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errores.telefono}</p>}
            </div>
            
            <div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className={`${getInputClass('password')} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errores.password && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errores.password}</p>}
            </div>
            
            <div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className={`${getInputClass('confirmPassword')} pr-12`} />
              </div>
              {errores.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errores.confirmPassword}</p>}
            </div>

            <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="font-semibold mb-1">La contraseña debe poseer:</p>
              <ul className="list-none flex flex-col gap-1">
                <li className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`}></span> <span className={`${password.length >= 8 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 8 caracteres</span></li>
                <li className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-600' : 'bg-gray-300'}`}></span> <span className={`${/[A-Z]/.test(password) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 1 mayúscula</span></li>
                <li className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-600' : 'bg-gray-300'}`}></span> <span className={`${/[0-9]/.test(password) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 1 número</span></li>
              </ul>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terminos"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  disabled={isLoading}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600 cursor-pointer disabled:opacity-50"
                />
                <label htmlFor="terminos" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                  He leído y acepto los{" "}
                  <Link href="/terminos" target="_blank" className="text-green-700 font-semibold hover:underline">
                    Términos y Condiciones
                  </Link>
                  {" "}y la{" "}
                  <Link href="/privacidad" target="_blank" className="text-green-700 font-semibold hover:underline">
                    Política de Privacidad
                  </Link>
                  .
                </label>
              </div>
              {errores.terminos && <p className="text-red-500 text-xs ml-7 font-medium">{errores.terminos}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-green-700 text-white text-base font-bold rounded-lg py-3.5 mt-2 hover:bg-green-800 transition-colors disabled:bg-green-700/50 shadow-sm flex items-center justify-center">
              {isLoading ? "Enviando correo..." : "Registrarse"}
            </button>
          </form>

          <div className="text-sm text-gray-600 mt-2 mb-8 text-center">
            ¿Ya tenés cuenta? <Link href="/login" className="text-green-700 font-bold hover:underline">Iniciar Sesión</Link>
          </div>
        </>
      )}
    </div>
  );
}