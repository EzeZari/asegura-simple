"use client";

import InformacionBasica from "./perfil/InformacionBasica";
import CredencialesAcceso from "./perfil/CredencialesAcceso";

export default function MiPerfilSettings() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
      <InformacionBasica />
      <CredencialesAcceso />
    </div>
  );
}