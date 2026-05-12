"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Users, FileText, AlertCircle, Building } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    fetch("http://localhost:3001/api/dashboard/stats")
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
    { 
      title: "Total Asegurados", 
      value: isLoading ? "..." : dashboardData?.totalAsegurados.toString(), 
      description: "Clientes activos", 
      icon: Users, 
      trend: "neutral" as const, 
      href: "/asegurados" 
    },
    { 
      title: "Pólizas Activas", 
      value: isLoading ? "..." : dashboardData?.polizasActivas.toString(), 
      description: "Coberturas vigentes", 
      icon: FileText, 
      trend: "neutral" as const, 
      href: "/polizas" 
    },
    { 
      title: "Vencimientos (30 días)", 
      value: isLoading ? "..." : dashboardData?.vencimientos.toString(), 
      description: "Requieren atención", 
      icon: AlertCircle, 
      trend: dashboardData?.vencimientos > 0 ? "down" : "up" as const, 
      href: "/alertas" 
    },
    { 
      title: "Aseguradoras", 
      value: isLoading ? "..." : dashboardData?.totalCompanias.toString(), 
      description: "Compañías conectadas", 
      icon: Building, 
      trend: "neutral" as const,
      href: "/companias"
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-8 w-full gap-8 bg-white min-h-screen">
      <div className="pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Bienvenido de nuevo, {mounted ? user?.nombre : "Productor"}
        </h1>
        <p className="text-gray-500 mt-1">
          Acá tenés el resumen en tiempo real de tu cartera de negocios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsReales.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-4 pb-10">
        <RecentActivity data={isLoading ? [] : dashboardData?.actividadReciente} />
        {isLoading && (
          <div className="text-center text-gray-400 mt-4 animate-pulse text-sm">
            Cargando actividad reciente...
          </div>
        )}
      </div>
    </div>
  );
}