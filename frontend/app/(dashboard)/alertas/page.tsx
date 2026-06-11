"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XOctagon } from "lucide-react";
import AlertaSection from "@/components/alertas/AlertaSection";
import { apiFetch } from "@/services/api"; 

export default function AlertasPage() {
  const [data, setData] = useState<{
    vencidas: any[];
    criticas: any[];
    proximas: any[];
    config: { diasCritica: number; diasMax: number };
  }>({
    vencidas: [],
    criticas: [],
    proximas: [],
    config: { diasCritica: 7, diasMax: 30 }
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/alertas') 
      .then(res => res.json())
      .then(resData => {
        // 🔥 PROTECCIÓN ANTI-CRASH: Verificamos que la estructura venga bien armada del backend
        if (resData && Array.isArray(resData.vencidas)) {
          setData(resData);
        } else {
          console.error("El backend no devolvió las alertas correctamente:", resData);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar alertas", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Buscando vencimientos...</div>;

  const { diasCritica, diasMax } = data.config;

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-gray-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro de Alertas</h1>
        <p className="text-gray-500 mt-1">Monitoreá los vencimientos para no perder ninguna renovación.</p>
      </div>
      <AlertaSection titulo="Vencidas (Sin cobertura)" Icono={XOctagon} nivel="vencida" alertas={data.vencidas} mensajeVacio="Excelente, no tenés pólizas vencidas sin gestionar." />
      <AlertaSection titulo={`Críticas (0 a ${diasCritica} días)`} Icono={AlertTriangle} nivel="critica" alertas={data.criticas} mensajeVacio="No hay vencimientos críticos." />
      <AlertaSection titulo={`Próximas (${diasCritica + 1} a ${diasMax} días)`} Icono={Clock} nivel="proxima" alertas={data.proximas} mensajeVacio="No hay vencimientos próximos." />
    </div>
  );
}