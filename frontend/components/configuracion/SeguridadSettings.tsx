"use client";

import CambioContrasena from "./seguridad/CambioContrasena";
import OpcionesAvanzadas from "./seguridad/OpcionesAvanzadas";
import RespaldoDatos from "./seguridad/RespaldoDatos";
import { useAuthStore } from "@/store/authStore";
import { PERMISOS, tienePermiso } from "@/utils/roles"; // 🔥 IMPORTAMOS EL DICCIONARIO

export default function SeguridadSettings() {
  const { user } = useAuthStore();
  
  // 🔥 Evaluamos si tiene permiso para modificar (Dueño o Productor)
  const puedeModificar = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 pb-10">
      
      {/* 🟢 Esto lo ven TODOS: El cambio de contraseña de su propia cuenta */}
      <CambioContrasena />
      
      {/* 🔥 ESTO SE OCULTA SI ES VENDEDOR (2FA, Dispositivos y Zona de Peligro) */}
      {puedeModificar && <OpcionesAvanzadas />}

      {/* 🟢 Esto lo ven TODOS: Permite a los Vendedores hacer backups / exportar */}
      <RespaldoDatos />

    </div>
  );
}