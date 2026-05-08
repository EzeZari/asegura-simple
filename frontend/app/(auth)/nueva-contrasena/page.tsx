"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); 

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al restablecer la contraseña.");
      } else {
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md text-center flex flex-col items-center gap-4">
        <CheckCircle2 size={64} className="text-green-600 mb-2" />
        <h1 className="text-3xl font-bold text-gray-900">¡Listo!</h1>
        {/* Cambiado a text-gray-900 para que sea negro */}
        <p className="text-gray-900">Tu contraseña fue actualizada correctamente. Te estamos redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Crear nueva<br />contraseña</h1>
        {/* Cambiado a text-gray-900 para que sea negro */}
        <p className="text-gray-900 mt-2">Elegí una clave segura para tu cuenta de AseguraSimple.</p>
        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Nueva contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-5 py-4 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all pr-12 text-gray-900" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700">
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <input 
          type="password" 
          placeholder="Confirmar contraseña" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-5 py-4 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all text-gray-900" 
        />

        <button 
          type="submit" 
          disabled={isLoading || !token}
          className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-2 hover:bg-green-800 transition-colors disabled:bg-gray-300"
        >
          {isLoading ? "Actualizando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}