"use client";

import { useState } from "react";
import { UserCircle, Building2, MessageSquare, Bell, Users, Shield, CreditCard } from "lucide-react"; 

import MiPerfilSettings from "@/components/configuracion/MiPerfilSettings"; 
import PerfilSettings from "@/components/configuracion/PerfilSettings";
import PlantillasSettings from "@/components/configuracion/PlantillasSettings";
import NotificacionesSettings from "@/components/configuracion/NotificacionesSettings";
import EquipoSettings from "@/components/configuracion/EquipoSettings";
import SeguridadSettings from "@/components/configuracion/SeguridadSettings";
import SuscripcionSettings from "@/components/configuracion/SuscripcionSettings"; 
import { useAuthStore } from "@/store/authStore"; // 🔥 Importamos la memoria de sesión

export default function ConfiguracionPage() {
  // 🔥 LEEMOS EL ROL DEL USUARIO
  const { user } = useAuthStore();
  const esSoloLectura = user?.role === "VIEWER";

  const [activeTab, setActiveTab] = useState("mi-perfil"); 

  // 🔥 Agregamos una propiedad "adminOnly" a las pestañas sensibles
  const todasLasPestanas = [
    { id: "mi-perfil", label: "Mi Perfil", icon: UserCircle }, 
    { id: "perfil", label: "Perfil de Agencia", icon: Building2, adminOnly: true },
    { id: "plantillas", label: "Plantillas", icon: MessageSquare, adminOnly: true },
    { id: "notificaciones", label: "Notificaciones", icon: Bell, adminOnly: true },
    { id: "equipo", label: "Equipo", icon: Users, adminOnly: true },
    { id: "suscripcion", label: "Suscripción", icon: CreditCard, adminOnly: true },
    { id: "seguridad", label: "Seguridad y Datos", icon: Shield }, // La dejamos para que puedan cambiar su contraseña
  ];

  // 🔥 Filtramos mágicamente las pestañas: si es lector, volamos las que son adminOnly
  const tabs = todasLasPestanas.filter(tab => !esSoloLectura || !tab.adminOnly);

  return (
    <div className="flex flex-col p-4 lg:p-8 w-full gap-4 lg:gap-6 bg-white min-h-screen overflow-x-hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Administrá los ajustes de tu plataforma y automatizaciones.</p>
      </div>

      <div className="flex border-b border-gray-200 mt-2 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 mb-[-1px] whitespace-nowrap ${
                isActive ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 w-full max-w-7xl">
        {activeTab === "mi-perfil" && <MiPerfilSettings />}
        {/* 🔥 Bloqueo de renderizado por seguridad */}
        {!esSoloLectura && activeTab === "perfil" && <PerfilSettings />}
        {!esSoloLectura && activeTab === "plantillas" && <PlantillasSettings />}
        {!esSoloLectura && activeTab === "notificaciones" && <NotificacionesSettings />}
        {!esSoloLectura && activeTab === "equipo" && <EquipoSettings />}
        {!esSoloLectura && activeTab === "suscripcion" && <SuscripcionSettings />} 
        {activeTab === "seguridad" && <SeguridadSettings />} 
      </div>
    </div>
  );
}