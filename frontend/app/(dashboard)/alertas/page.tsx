"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XOctagon } from "lucide-react";
import AlertaSection from "@/components/alertas/AlertaSection";

export default function AlertasPage() {
  // Extendemos el estado para guardar la configuración que viene del backend
  const [data, setData] = useState<{
    vencidas: any[];
    criticas: any[];
    proximas: any[];
    config: { diasCritica: number; diasMax: number };
  }>({
    vencidas: [],
    criticas: [],
    proximas: [],
    config: { diasCritica: 7, diasMax: 30 } // Valores iniciales por si tarda el fetch
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/alertas")
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      })
      .catch(err => console.error("Error al cargar alertas", err));
  }, []);

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Buscando vencimientos...</div>;

  const { diasCritica, diasMax } = data.config;

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-gray-50/50 min-h-screen">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro de Alertas</h1>
        <p className="text-gray-500 mt-1">Monitoreá los vencimientos para no perder ninguna renovación.</p>
      </div>

      {/* Sección Vencidas */}
      <AlertaSection 
        titulo="Vencidas (Sin cobertura)" 
        Icono={XOctagon} 
        nivel="vencida" 
        alertas={data.vencidas} 
        mensajeVacio="Excelente, no tenés pólizas vencidas sin gestionar." 
      />

      {/* Sección Críticas: Título Dinámico */}
      <AlertaSection 
        titulo={`Críticas (0 a ${diasCritica} días)`} 
        Icono={AlertTriangle} 
        nivel="critica" 
        alertas={data.criticas} 
        mensajeVacio="No hay vencimientos críticos." 
      />

      {/* Sección Próximas: Título Dinámico */}
      <AlertaSection 
        titulo={`Próximas (${diasCritica + 1} a ${diasMax} días)`} 
        Icono={Clock} 
        nivel="proxima" 
        alertas={data.proximas} 
        mensajeVacio="No hay vencimientos próximos." 
      />

    </div>
  );
}