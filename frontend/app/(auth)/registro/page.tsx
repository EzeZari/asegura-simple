import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full min-h-screen flex">
      {/* Mitad Izquierda - Imagen (Reutilizamos la del login para mantener el estilo) */}
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
        
        <div className="w-full max-w-md flex flex-col gap-6 my-auto">
          
          <div className="text-green-700 font-bold text-sm tracking-wide">
            Logo y nombre
          </div>

          <div>
            <h1 className="text-4xl leading-tight font-bold text-gray-900 tracking-tight">
              Creá tu cuenta
            </h1>
          </div>

          {/* Formulario de registro basado en tu mockup */}
          <form className="flex flex-col gap-4 mt-2">
            {/* Usamos grid para poner inputs uno al lado del otro si queremos, 
                pero basándome en tu diseño, van todos apilados en una columna */}
            <input type="text" placeholder="Nombre completo" className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all" />
            <input type="email" placeholder="Email" className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all" />
            <input type="tel" placeholder="Teléfono" className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all" />
            
            {/* Podríamos seguir agregando Dirección, Código Postal, etc. */}
            
            <input type="password" placeholder="Contraseña" className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all" />
            <input type="password" placeholder="Confirmar contraseña" className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all" />

            <div className="text-xs text-gray-500 mt-2">
              <p>La contraseña debe poseer:</p>
              <ul className="list-disc pl-4 mt-1 text-green-700">
                <li><span className="text-gray-500">Al menos 8 caracteres</span></li>
                <li><span className="text-gray-500">Al menos 1 mayúscula</span></li>
                <li><span className="text-gray-500">Al menos 1 número</span></li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-4 hover:bg-green-800 transition-colors shadow-sm"
            >
              Registrarse
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