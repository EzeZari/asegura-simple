"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  
  // 🔥 TRUCO ANTI-EXTENSIONES: Evita el Error 418 de hidratación
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Estados generales
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  
  // Estados Paso 1: Credenciales
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados Paso 2: 2FA
  const [step, setStep] = useState<1 | 2>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [codigo2fa, setCodigo2fa] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, completá todos los campos.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Credenciales incorrectas.");
        setIsLoading(false);
        return;
      }

      if (data.require2FA) {
        setUserId(data.userId);
        setStep(2);
        setIsLoading(false);
        return;
      }

      setUser(data.user);
      router.push("/");
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (codigo2fa.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, codigo: codigo2fa }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Código incorrecto.");
        setIsLoading(false);
        return;
      }

      setUser(data.user);
      router.push("/");
    } catch (err) {
      setError("Error de conexión con el servidor.");
      setIsLoading(false);
    }
  };

  // 🔥 Si no está montado aún, devolvemos null para que las extensiones no rompan el HTML inicial
  if (!isMounted) return null;

  // ================= RENDERIZADO DEL PASO 2 (CÓDIGO 2FA) =================
  if (step === 2) {
    return (
      <div className="w-full max-w-md flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Volver al login
          </button>
          
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Verificación en dos pasos
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hemos enviado un código de 6 dígitos a tu correo <strong>{email}</strong>. Ingresalo para verificar tu identidad.
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-medium">{error}</div>
          )}
        </div>

        <form onSubmit={handleVerify2FA} className="flex flex-col gap-6">
          <input 
            type="text" 
            maxLength={6}
            placeholder="000000" 
            value={codigo2fa} 
            onChange={(e) => setCodigo2fa(e.target.value.replace(/[^0-9]/g, ''))} 
            disabled={isLoading} 
            className="w-full border border-gray-200 rounded-xl px-5 py-5 text-4xl text-center font-black tracking-[0.5em] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all disabled:bg-gray-50" 
            style={{ paddingLeft: 'calc(1.25rem + 0.25em)' }} 
          />
          
          <button type="submit" disabled={isLoading} className="w-full bg-green-700 text-white text-lg font-medium rounded-lg py-4 hover:bg-green-800 transition-colors disabled:bg-green-700/70 shadow-md">
            {isLoading ? "Verificando..." : "Verificar Código"}
          </button>
        </form>
      </div>
    );
  }

  // ================= RENDERIZADO DEL PASO 1 (LOGIN NORMAL) =================
  return (
    <div className="w-full max-w-md flex flex-col gap-10 animate-in fade-in duration-300">
      <div>
        <h1 className="text-5xl leading-tight font-bold text-gray-900 tracking-tight">
          Hola!<br />Ingresa a tu<br />cuenta
        </h1>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md font-medium">{error}</div>
        )}
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6 mt-2">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isLoading} 
          className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50" 
        />
        
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={isLoading} 
            className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 pr-12" 
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700">
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <div className="flex justify-end mt-1">
          <Link href="/recuperar" className="text-sm text-green-700 font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
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