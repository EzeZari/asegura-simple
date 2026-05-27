"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!email) {
      setError("Por favor, ingresá tu email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocurrió un error.");
      } else {
        setMensaje(data.message);
        setEmail(""); // Limpiamos el campo
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-8">
      <div>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-colors mb-6">
          <ArrowLeft size={16} /> Volver al login
        </Link>
        <h1 className="text-4xl leading-tight font-bold text-gray-900 tracking-tight">
          Recuperar<br />contraseña
        </h1>
        <p className="text-gray-600 mt-3">
          Ingresá el email asociado a tu cuenta y te enviaremos un enlace para que puedas crear una nueva.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">{error}</div>
        )}
        {mensaje && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">{mensaje}</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input 
          type="email" 
          placeholder="Tu correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isLoading || !!mensaje} 
          className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50" 
        />
        
        <button 
          type="submit" 
          disabled={isLoading || !!mensaje} 
          className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 hover:bg-green-800 transition-colors disabled:bg-green-700/70"
        >
          {isLoading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
}