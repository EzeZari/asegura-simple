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

      {/* Mitad Derecha - Contenedor dinámico (Acá se inyecta el login o el registro) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 bg-white relative overflow-y-auto">
        {children}
      </div>
    </div>
  );
}