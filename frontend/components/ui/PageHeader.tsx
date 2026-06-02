"use client";

import { Plus } from "lucide-react";

interface Props {
  titulo: string;
  descripcion: string;
  textoBoton: string;
  onNuevo: () => void;
}

export default function PageHeader({ titulo, descripcion, textoBoton, onNuevo }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <div className="w-full">
        {/* 🔥 Ajuste: text-2xl en móvil, text-3xl en PC */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{titulo}</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">{descripcion}</p>
      </div>
      <button 
        onClick={onNuevo}
        // 🔥 Ajuste: w-full en celulares, w-auto en PC, y contenido centrado
        className="flex items-center justify-center w-full sm:w-auto gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
      >
        <Plus size={20} /> {textoBoton}
      </button>
    </div>
  );
}