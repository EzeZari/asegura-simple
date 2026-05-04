"use function"; // Mantenemos "use client" porque acá hay interactividad
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Importamos el gancho para manejar estados

export default function LoginPage() {
  const router = useRouter();

  // 1. Creamos los "cajones" (estados) para guardar lo que escribe el usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. Estados para manejar errores y la animación de carga
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitamos que la página recargue
    setError(""); // Limpiamos errores previos

    // Validación básica
    if (!email || !password) {
      setError("Por favor, completá todos los campos.");
      return;
    }

    // Prendemos el estado de carga
    setIsLoading(true);

    try {
      // Acá simulamos que le pegamos al Backend (puerto 3001) con un retraso de 1.5 segundos
      // En el futuro acá irá un fetch('http://localhost:3001/api/login', ...)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Si todo sale bien, lo mandamos al panel
      router.push("/");
    } catch (err) {
      setError("Credenciales incorrectas. Volvé a intentar.");
      setIsLoading(false); // Apagamos la carga si hay error
    }
  };

  return (
    <div className="w-full min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img
          src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000"
          alt="AseguraSimple background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 pointer-events-none"></div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white relative">
        <div className="w-full max-w-md flex flex-col gap-10">
          <div className="text-green-700 font-bold text-sm tracking-wide">
            Logo y nombre
          </div>

          <div>
            <h1 className="text-5xl leading-tight font-bold text-gray-900 tracking-tight">
              Hola!<br />Ingresa a tu<br />cuenta
            </h1>
            
            {/* Si hay un error, mostramos este cartelito rojo */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6 mt-2">
            <div>
              <input
                type="email"
                placeholder="Email"
                // Conectamos el input con el estado "email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading} // Si está cargando, bloqueamos el input
                className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                // Conectamos el input con el estado "password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div className="flex justify-end mt-1">
              <Link href="#" className="text-sm text-green-700 font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading} // Deshabilitamos el botón mientras carga
              className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-2 hover:bg-green-800 transition-colors shadow-sm disabled:bg-green-700/70 flex justify-center items-center"
            >
              {/* Cambiamos el texto dinámicamente */}
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="text-sm text-gray-600 mt-2">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="text-green-700 font-bold hover:underline">
              Creá una cuenta
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 text-xs text-gray-400 font-light">
          ©2026 AseguraSimple. Reservados todos los derechos.
        </div>
      </div>
    </div>
  );
}