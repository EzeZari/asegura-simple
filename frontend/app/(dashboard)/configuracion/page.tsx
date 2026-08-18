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
import { PERMISOS, tienePermiso } from "@/utils/roles"; 

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  
  const esAdmin = tienePermiso(user, PERMISOS.PUEDE_MODIFICAR_DATOS);
  const esDueno = tienePermiso(user, PERMISOS.PUEDE_EDITAR_PLAN); 

  const [activeTab, setActiveTab] = useState("mi-perfil"); 

  const todasLasPestanas = [
    { id: "mi-perfil", label: "Mi Perfil", icon: UserCircle, show: true }, 
    { id: "perfil", label: "Perfil de Agencia", icon: Building2, show: esAdmin }, 
    { id: "plantillas", label: "Plantillas", icon: MessageSquare, show: esAdmin },
    { id: "notificaciones", label: "Notificaciones", icon: Bell, show: esAdmin },
    { id: "equipo", label: "Equipo", icon: Users, show: esDueno }, 
    { id: "suscripcion", label: "Suscripción", icon: CreditCard, show: esDueno }, 
    { id: "seguridad", label: "Seguridad y Datos", icon: Shield, show: true }, 
  ];

  const tabs = todasLasPestanas.filter(tab => tab.show);

  return (
    // 🔥 Quitamos bg-white para que herede del layout
    <div className="flex flex-col p-4 lg:p-8 w-full gap-4 lg:gap-6 min-h-screen overflow-x-hidden transition-colors duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Configuración</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1 transition-colors">Administrá los ajustes de tu plataforma y automatizaciones.</p>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mt-2 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              // 🔥 Colores de pestañas adaptados al modo oscuro
              className={`flex items-center gap-2 py-3 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 mb-[-1px] whitespace-nowrap ${
                isActive 
                  ? "border-green-600 dark:border-green-500 text-green-700 dark:text-green-400" 
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
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