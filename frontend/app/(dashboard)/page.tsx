"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Users, FileText, AlertCircle, DollarSign } from "lucide-react"; 
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";

// DATOS FALSOS (Mock Data) para maquetar
const MOCK_STATS = [
  { title: "Total Asegurados", value: "142", description: "+5 este mes", icon: Users, trend: "up" as const, href: "/asegurados" },
  { title: "Pólizas Activas", value: "284", description: "+12 este mes", icon: FileText, trend: "up" as const, href: "/polizas" },
  { title: "Vencimientos (30 días)", value: "18", description: "Requieren atención", icon: AlertCircle, trend: "down" as const, href: "/alertas" },
  { title: "Primas Mensuales", value: "$1.2M", description: "Estable", icon: DollarSign, trend: "neutral" as const },
];

const MOCK_ACTIVITY = [
  { id: "1", type: "Alta Póliza" as const, client: "Martín Palermo", date: "Hoy, 10:30", status: "Completado" as const },
  { id: "2", type: "Nuevo Asegurado" as const, client: "Ariel Ortega", date: "Hoy, 09:15", status: "Completado" as const },
  { id: "3", type: "Renovación" as const, client: "Marcelo Gallardo", date: "Ayer", status: "Pendiente" as const },
  { id: "4", type: "Alta Póliza" as const, client: "Enzo Francescoli", date: "Ayer", status: "Completado" as const },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  return (
    // ¡ACÁ ESTÁ LA MAGIA! Se borró max-w-7xl y mx-auto
    <div className="flex-1 flex flex-col p-8 w-full gap-8 bg-white min-h-screen">
      
      {/* Saludo */}
      <div className="pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Bienvenido de nuevo, {mounted ? user?.nombre : "Productor"}
        </h1>
        <p className="text-gray-500 mt-1">
          Acá tenés el resumen de tu cartera de clientes y pólizas.
        </p>
      </div>

      {/* Grilla de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STATS.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Sección Inferior: Tabla de actividad */}
      <div className="mt-4 pb-10">
        <RecentActivity data={MOCK_ACTIVITY} />
      </div>
    </div>
  );
}