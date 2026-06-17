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

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("mi-perfil"); 

  const tabs = [
    { id: "mi-perfil", label: "Mi Perfil", icon: UserCircle }, 
    { id: "perfil", label: "Perfil de Agencia", icon: Building2 },
    { id: "plantillas", label: "Plantillas", icon: MessageSquare },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "equipo", label: "Equipo", icon: Users }, 
    { id: "suscripcion", label: "Suscripción", icon: CreditCard }, 
    { id: "seguridad", label: "Seguridad y Datos", icon: Shield },
  ];

  return (
    <div className="flex flex-col p-4 lg:p-8 w-full gap-4 lg:gap-6 bg-white min-h-screen overflow-x-hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Administrá los ajustes de tu plataforma y automatizaciones.</p>
      </div>

      {/* 🔥 ARREGLO DEL SCROLL: Le sacamos el ocultamiento de scrollbar y agregamos pb-2 */}
      <div className="flex overflow-x-auto border-b border-gray-200 mt-2 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              // 🔥 Agregamos shrink-0 para que los botones no se aplasten al achicar la pantalla
              className={`flex shrink-0 items-center gap-2 py-3 px-4 md:px-6 font-medium text-sm transition-colors border-b-2 mb-[-5px] whitespace-nowrap ${
                isActive ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 max-w-4xl">
        {activeTab === "mi-perfil" && <MiPerfilSettings />}
        {activeTab === "perfil" && <PerfilSettings />}
        {activeTab === "plantillas" && <PlantillasSettings />}
        {activeTab === "notificaciones" && <NotificacionesSettings />}
        {activeTab === "equipo" && <EquipoSettings />}
        {activeTab === "suscripcion" && <SuscripcionSettings />} 
        {activeTab === "seguridad" && <SeguridadSettings />} 
      </div>
    </div>
  );
}