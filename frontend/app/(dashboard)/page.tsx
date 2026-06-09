"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Users, FileText, AlertCircle, Building } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { apiFetch } from "@/services/api"; // ← NUEVO

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    apiFetch('/api/dashboard/stats') // ← CAMBIO
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar el dashboard:", error);
        setIsLoading(false);
      });
  }, []);

  const statsReales = [
    { title: "Total Asegurados", value: isLoading ? "..." : dashboardData?.totalAsegurados?.toString() || "0", description: "Clientes activos", icon: Users, trend: "neutral" as const, href: "/asegurados" },
    { title: "Pólizas Activas", value: isLoading ? "..." : dashboardData?.polizasActivas?.toString() || "0", description: "Coberturas vigentes", icon: FileText, trend: "neutral" as const, href: "/polizas" },
    { title: "Vencimientos (30 días)", value: isLoading ? "..." : dashboardData?.vencimientos?.toString() || "0", description: "Requieren atención", icon: AlertCircle, trend: dashboardData?.vencimientos > 0 ? "down" : "up", href: "/alertas" },
    { title: "Aseguradoras", value: isLoading ? "..." : dashboardData?.totalCompanias?.toString() || "0", description: "Compañías conectadas", icon: Building, trend: "neutral" as const, href: "/companias" },
  ];

  const actividadSegura = dashboardData?.actividadReciente?.map((item: any) => ({
    ...item,
    type: item.type || item.tipo || item.accion || "",
    tipo: item.tipo || item.type || item.accion || ""
  })) || [];

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 w-full gap-5 lg:gap-8 bg-white min-h-screen">
      <div className="pb-2 lg:pb-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          Bienvenido de nuevo, {mounted ? user?.nombre : "Productor"}
        </h1>
        <p className="text-sm lg:text-base text-gray-500 mt-1">
          Acá tenés el resumen en tiempo real de tu cartera de negocios.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {statsReales.map((stat, index) => (
          <StatCard key={index} {...stat} trend={stat.trend as any} />
        ))}
      </div>

      <div className="mt-2 lg:mt-4 pb-10">
        <RecentActivity data={isLoading ? [] : actividadSegura} />
        {isLoading && (
          <div className="text-center text-gray-400 mt-4 animate-pulse text-sm">
            Cargando actividad reciente...
          </div>
        )}
      </div>
    </div>
  );
}