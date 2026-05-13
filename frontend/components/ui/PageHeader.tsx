"use client";

import { Plus } from "lucide-react";

interface Props {
  titulo: string;
  descripcion: string;
  textoBoton: string;
  onNuevo: () => void;
}

// IMPORTANTE: Tiene que decir "export default function"
export default function PageHeader({ titulo, descripcion, textoBoton, onNuevo }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{titulo}</h1>
        <p className="text-gray-500 mt-1">{descripcion}</p>
      </div>
      <button 
        onClick={onNuevo}
        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
      >
        <Plus size={20} /> {textoBoton}
      </button>
    </div>
  );
}