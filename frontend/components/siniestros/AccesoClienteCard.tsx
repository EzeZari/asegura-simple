"use client";
import { useState } from "react";
import { ShieldCheck, MessageCircle } from "lucide-react";

export default function AccesoClienteCard({ siniestroId, linkExistente, onGenerado }: any) {
  const [link, setLink] = useState(linkExistente?.url || "");
  const [isGenerando, setIsGenerando] = useState(false);

  const handleGenerar = async () => {
    setIsGenerando(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${siniestroId}/generar-link`, { method: "POST" });
    const data = await res.json();
    setLink(data.urlPublica);
    onGenerado();
    setIsGenerando(false);
  };

  return (
    <div className="p-6 border border-gray-100 rounded-3xl bg-gray-900 text-white shadow-lg flex flex-col gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><ShieldCheck size={80} /></div>
      <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest border-b border-gray-700 pb-2">Acceso Cliente</h3>
      
      {!link ? (
        <button onClick={handleGenerar} disabled={isGenerando} className="mt-2 w-full bg-white text-gray-900 hover:bg-gray-100 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
          {isGenerando ? "Generando..." : "Crear Link de Seguimiento"}
        </button>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          <input type="text" readOnly value={link} className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-xs p-3 rounded-xl outline-none truncate font-mono" />
          <button onClick={() => window.open(`https://wa.me/?text=${link}`, '_blank')} className="w-full bg-green-500 hover:bg-green-400 text-gray-900 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5">
            <MessageCircle size={14} /> Compartir por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}