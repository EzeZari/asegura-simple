"use client";

import { useState } from "react";
import { Building2, MessageSquare, Bell, Users, Shield } from "lucide-react";

// Importaremos los sub-componentes (iremos creando uno por uno)
import PerfilSettings from "@/components/configuracion/PerfilSettings";
import PlantillasSettings from "@/components/configuracion/PlantillasSettings";
// import NotificacionesSettings from "@/components/configuracion/NotificacionesSettings";
// import EquipoSettings from "@/components/configuracion/EquipoSettings";
// import SeguridadSettings from "@/components/configuracion/SeguridadSettings";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("perfil");

  const tabs = [
    { id: "perfil", label: "Perfil de Agencia", icon: Building2 },
    { id: "plantillas", label: "Plantillas", icon: MessageSquare },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "equipo", label: "Equipo", icon: Users },
    { id: "seguridad", label: "Seguridad y Datos", icon: Shield },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-6 bg-white min-h-screen overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
        <p className="text-gray-500 mt-1">Administrá los ajustes de tu plataforma y automatizaciones.</p>
      </div>

      {/* BARRA DE NAVEGACIÓN (TABS) */}
      <div className="flex border-b border-gray-200 mt-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors border-b-2 mb-[-1px] whitespace-nowrap ${
                isActive ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENEDOR DINÁMICO */}
      <div className="mt-4 max-w-4xl">
        {activeTab === "perfil" && <PerfilSettings />},
        {activeTab === "plantillas" && <PlantillasSettings />}
        {/* {activeTab === "notificaciones" && <NotificacionesSettings />} */}
        {/* {activeTab === "equipo" && <EquipoSettings />} */}
        {/* {activeTab === "seguridad" && <SeguridadSettings />} */}
      </div>
    </div>
  );
}