"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, completá todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // <--- LA LÍNEA MÁGICA AGREGADA ACÁ
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Credenciales incorrectas.");
        setIsLoading(false);
        return;
      }

      router.push("/");
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setIsLoading(false);
    }
  };

  // Mirá qué limpio quedó el return, solo es el formulario
  return (
    <div className="w-full max-w-md flex flex-col gap-10">

      <div>
        <h1 className="text-5xl leading-tight font-bold text-gray-900 tracking-tight">
          Hola!<br />Ingresa a tu<br />cuenta
        </h1>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>
        )}
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6 mt-2">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50" />
        
        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 pr-12" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700">
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <div className="flex justify-end mt-1">
          <Link href="#" className="text-sm text-green-700 font-medium hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-2 hover:bg-green-800 transition-colors disabled:bg-green-700/70">
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="text-sm text-gray-600 mt-2">
        ¿No tenés cuenta? <Link href="/registro" className="text-green-700 font-bold hover:underline">Creá una cuenta</Link>
      </div>
    </div>
  );
}