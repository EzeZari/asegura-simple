import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen flex">
      {/* Mitad Izquierda - Imagen Compartida */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <img
          src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000"
          alt="AseguraSimple background"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 pointer-events-none"></div>
      </div>

      {/* Mitad Derecha - Contenedor blanco con el formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-white relative overflow-y-auto">
        
        {/* LOGO CENTRADO Y MÁS GRANDE */}
        <div className="w-full max-w-md flex justify-center mb-10">
          <img 
            src="/logo.png" 
            alt="AseguraSimple Logo" 
            className="h-24 w-auto drop-shadow-[0_0px_2px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Acá adentro se inyecta el Login o el Registro de forma dinámica */}
        {children}

      </div>
    </div>
  );
}