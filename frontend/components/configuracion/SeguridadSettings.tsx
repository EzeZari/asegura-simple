"use client";

import CambioContrasena from "./seguridad/CambioContrasena";
import OpcionesAvanzadas from "./seguridad/OpcionesAvanzadas";
import RespaldoDatos from "./seguridad/RespaldoDatos";

export default function SeguridadSettings() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-10">
      <CambioContrasena />
      <OpcionesAvanzadas />
      <RespaldoDatos />
    </div>
  );
}