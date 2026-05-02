import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex">
      {/* Mitad Izquierda - Imagen (Se oculta en celulares) */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img
          src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000"
          alt="AseguraSimple background"
          className="object-cover w-full h-full"
        />
        {/* Capa de degradado oscuro sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 pointer-events-none"></div>
      </div>

      {/* Mitad Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white relative">
        
        {/* Contenedor central del form - Ampliado a max-w-md y más espacio entre elementos */}
        <div className="w-full max-w-md flex flex-col gap-10">
          
          {/* Logo superior */}
          <div className="text-green-700 font-bold text-sm tracking-wide">
            Logo y nombre
          </div>

          {/* Título principal - Letra más grande */}
          <div>
            <h1 className="text-5xl leading-tight font-bold text-gray-900 tracking-tight">
              Hola!<br />Ingresa a tu<br />cuenta
            </h1>
          </div>

          {/* Formulario */}
          <form className="flex flex-col gap-6 mt-2">
            <div>
              <input
                type="email"
                placeholder="Email"
                // Inputs más altos (py-4) y letra más grande (text-base)
                className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full border border-gray-200 rounded-md px-5 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all"
              />
            </div>

            <div className="flex justify-end mt-1">
              <Link href="#" className="text-sm text-green-700 font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="button"
              className="w-full bg-green-700 text-white text-lg font-medium rounded-md py-4 mt-2 hover:bg-green-800 transition-colors shadow-sm"
            >
              Ingresar
            </button>
          </form>

          {/* Link al registro - Tamaño de fuente normalizado */}
          <div className="text-sm text-gray-600 mt-2">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="text-green-700 font-bold hover:underline">
              Creá una cuenta
            </Link>
          </div>
        </div>

        {/* Footer Copy */}
        <div className="absolute bottom-8 text-xs text-gray-400 font-light">
          ©2026 AseguraSimple. Reservados todos los derechos.
        </div>
      </div>
    </div>
  );
}