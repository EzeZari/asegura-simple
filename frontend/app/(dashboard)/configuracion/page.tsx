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
import { useAuthStore } from "@/store/authStore"; 
import { PERMISOS, tienePermiso } from "@/utils/roles"; // 🔥 IMPORTAMOS EL DICCIONARIO

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  
  // 🔥 EVALUAMOS PERMISOS (Solo Dueño o Productor pueden ver opciones sensibles)
  const esAdmin = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);
  const esDueno = tienePermiso(user, PERMISOS.PUEDE_EDITAR_PLAN); // El plan y el equipo son cosas exclusivas

  const [activeTab, setActiveTab] = useState("mi-perfil"); 

  // 🔥 Filtramos las pestañas basándonos en roles y permisos
  const todasLasPestanas = [
    { id: "mi-perfil", label: "Mi Perfil", icon: UserCircle, show: true }, // Todos
    { id: "perfil", label: "Perfil de Agencia", icon: Building2, show: esAdmin }, 
    { id: "plantillas", label: "Plantillas", icon: MessageSquare, show: esAdmin },
    { id: "notificaciones", label: "Notificaciones", icon: Bell, show: esAdmin },
    { id: "equipo", label: "Equipo", icon: Users, show: esDueno }, // Solo dueño administra a la gente
    { id: "suscripcion", label: "Suscripción", icon: CreditCard, show: esDueno }, // Solo dueño paga
    { id: "seguridad", label: "Seguridad y Datos", icon: Shield, show: true }, // Todos pueden cambiar su contraseña
  ];

  const tabs = todasLasPestanas.filter(tab => tab.show);

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
        {esAdmin && activeTab === "perfil" && <PerfilSettings />}
        {esAdmin && activeTab === "plantillas" && <PlantillasSettings />}
        {esAdmin && activeTab === "notificaciones" && <NotificacionesSettings />}
        {esDueno && activeTab === "equipo" && <EquipoSettings />}
        {esDueno && activeTab === "suscripcion" && <SuscripcionSettings />} 
        {activeTab === "seguridad" && <SeguridadSettings />} 
      </div>
    </div>
  );
}