"use client";

import { Plus } from "lucide-react";

interface Props {
  titulo: string;
  descripcion?: string;
  textoBoton?: string;
  onNuevo?: () => void;
}

export default function PageHeader({ titulo, descripcion, textoBoton, onNuevo }: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <div className="w-full">
        {/* 🔥 Adaptamos el título a dark:text-white */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
          {titulo}
        </h1>
        {/* 🔥 Adaptamos la descripción a dark:text-gray-400 */}
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 transition-colors">
          {descripcion}
        </p>
      </div>
      <button 
        onClick={onNuevo}
        className="flex items-center justify-center w-full sm:w-auto gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium shadow-sm transition-colors whitespace-nowrap"
      >
        <Plus size={20} /> {textoBoton}
      </button>
    </div>
  );
}