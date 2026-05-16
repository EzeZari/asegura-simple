"use client";

import { useState } from "react";
import { Shield, Smartphone, Laptop, AlertOctagon, LogOut } from "lucide-react";

export default function OpcionesAvanzadas() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* 2FA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
          <Shield size={18} className="text-gray-400" /> Autenticación en Dos Pasos (2FA)
        </h3>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Proteger cuenta con código adicional</p>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">Agrega una capa extra de seguridad. Además de tu contraseña, te pediremos un código de 6 dígitos enviado a tu celular.</p>
          </div>
          <button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Sesiones */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
          <Smartphone size={18} className="text-gray-400" /> Dispositivos y Sesiones
        </h3>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <Laptop className="text-green-600" size={24} />
            <div>
              <p className="text-sm font-bold text-gray-900">Chrome en Windows <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full ml-2">Sesión Actual</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Argentina • IP: 190.178.X.X</p>
            </div>
          </div>
          <span className="text-sm text-gray-400 font-medium">Activa ahora</span>
        </div>
      </div>

      {/* Zona Peligro */}
      <div className="bg-red-50/30 p-6 rounded-2xl border border-red-200 shadow-sm flex flex-col gap-4">
        <h3 className="text-lg font-bold text-red-700 border-b border-red-100 pb-2 flex items-center gap-2">
          <AlertOctagon size={18} /> Zona de Peligro
        </h3>
        <p className="text-sm text-red-900/80">Acciones irreversibles. Procedé con absoluta precaución.</p>
        <div className="flex gap-4 mt-2">
          <button className="bg-white border border-red-200 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold">Vaciar toda la base de datos</button>
          <button className="bg-red-600 border border-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold">Eliminar cuenta de la Agencia</button>
        </div>
      </div>
    </div>
  );
}