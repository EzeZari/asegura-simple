"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  // 1. Estados para cada campo del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2. Estados de control
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Función para validar la seguridad de la contraseña
  const isPasswordSecure = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return hasMinLength && hasUpperCase && hasNumber;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpiamos errores previos

    // Validar que no haya campos vacíos
    if (!nombre || !email || !telefono || !password || !confirmPassword) {
      setError("Por favor, completá todos los campos para continuar.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden. Verificalas por favor.");
      return;
    }

    // Validar seguridad de la contraseña (tus reglas del diseño)
    if (!isPasswordSecure(password)) {
      setError("La contraseña no cumple con los requisitos de seguridad mínimos.");
      return;
    }

    setIsLoading(true);

    try {
      // Simulamos la creación del usuario en tu backend (puerto 3001)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Si se registra con éxito, lo mandamos directo al dashboard
      router.push("/");
    } catch (err) {
      setError("Ocurrió un error al crear la cuenta. Intentá nuevamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* Mitad Izquierda - Imagen */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img
          src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000"
          alt="AseguraSimple background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 pointer-events-none"></div>
      </div>

      {/* Mitad Derecha - Formulario de Registro */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-white relative overflow-y-auto">
        
        <div className="w-full max-w-md flex flex-col gap-6 my-auto py-10">
          
          <div className="text-green-700 font-bold text-sm tracking-wide">
            Logo y nombre
          </div>

          <div>
            <h1 className="text-4xl leading-tight font-bold text-gray-900 tracking-tight">
              Creá tu cuenta
            </h1>
            
            {/* Banner de Errores */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-2">
            <input 
              type="text" 
              placeholder="Nombre completo" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400" 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400" 
            />
            <input 
              type="tel" 
              placeholder="Teléfono" 
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400" 
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400" 
            />
            <input 
              type="password" 
              placeholder="Confirmar contraseña" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400" 
            />

            <div className="text-xs text-gray-500 mt-2">
              <p>La contraseña debe poseer:</p>
              <ul className="list-disc pl-4 mt-1 text-green-700">
                <li><span className={`transition-colors ${password.length >= 8 ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 8 caracteres</span></li>
                <li><span className={`transition-colors ${/[A-Z]/.test(password) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 1 mayúscula</span></li>
                <li><span className={`transition-colors ${/[0-9]/.test(password) ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos 1 número</span></li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-4 hover:bg-green-800 transition-colors shadow-sm disabled:bg-green-700/70 flex justify-center items-center"
            >
              {isLoading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="text-sm text-gray-600 mt-2 mb-8">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-green-700 font-bold hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}