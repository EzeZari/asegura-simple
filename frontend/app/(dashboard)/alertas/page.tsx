"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, XOctagon } from "lucide-react";
import AlertaSection from "@/components/alertas/AlertaSection";

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<{ vencidas: any[], criticas: any[], proximas: any[] }>({ vencidas: [], criticas: [], proximas: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/alertas")
      .then(res => res.json())
      .then(data => {
        setAlertas(data);
        setIsLoading(false);
      })
      .catch(err => console.error("Error al cargar alertas", err));
  }, []);

  if (isLoading) return <div className="p-8 text-gray-500 animate-pulse">Buscando vencimientos...</div>;

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-gray-50/50 min-h-screen">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro de Alertas</h1>
        <p className="text-gray-500 mt-1">Monitoreá los vencimientos para no perder ninguna renovación.</p>
      </div>

      <AlertaSection 
        titulo="Vencidas (Sin cobertura)" 
        Icono={XOctagon} 
        nivel="vencida" 
        alertas={alertas.vencidas} 
        mensajeVacio="Excelente, no tenés pólizas vencidas sin gestionar." 
      />

      <AlertaSection 
        titulo="Críticas (0 a 7 días)" 
        Icono={AlertTriangle} 
        nivel="critica" 
        alertas={alertas.criticas} 
        mensajeVacio="No hay vencimientos críticos." 
      />

      <AlertaSection 
        titulo="Próximas (8 a 30 días)" 
        Icono={Clock} 
        nivel="proxima" 
        alertas={alertas.proximas} 
        mensajeVacio="No hay vencimientos próximos." 
      />

    </div>
  );
}