"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isPasswordSecure = (pass: string) => pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre || !email || !telefono || !password || !confirmPassword) {
      setError("Por favor, completá todos los campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!isPasswordSecure(password)) {
      setError("La contraseña no cumple los requisitos.");
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
        setError(data.error || "Error al crear la cuenta.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6 my-auto py-10">

      {isSuccess ? (
        <div className="flex flex-col items-center text-center gap-6 py-12 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">¡Cuenta Creada!</h1>
          <p className="text-gray-600 text-lg">Tu usuario se registró correctamente.</p>
          <Link href="/login" className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-4 hover:bg-green-800 transition-colors text-center">
            Ir a Iniciar Sesión
          </Link>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-4xl leading-tight font-bold text-gray-900 tracking-tight">Creá tu cuenta</h1>
            {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>}
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-2">
            <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50" />
            <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50" />
            
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 pr-12" />
            </div>

            <div className="text-xs text-gray-500 mt-2">
              <p>La contraseña debe poseer:</p>
              <ul className="list-disc pl-4 mt-1 text-green-700">
                <li><span className={`${password.length >= 8 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 8 caracteres</span></li>
                <li><span className={`${/[A-Z]/.test(password) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 1 mayúscula</span></li>
                <li><span className={`${/[0-9]/.test(password) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 1 número</span></li>
              </ul>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-4 hover:bg-green-800 transition-colors disabled:bg-green-700/70">
              {isLoading ? "Creando..." : "Registrarse"}
            </button>
          </form>

          <div className="text-sm text-gray-600 mt-2 mb-8">
            ¿Ya tenés cuenta? <Link href="/login" className="text-green-700 font-bold hover:underline">Iniciar Sesión</Link>
          </div>
        </>
      )}
    </div>
  );
}