"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface Props {
  label: string;
  sortKey: string;
  currentSort: any; 
  requestSort: (key: any) => void;
  className?: string;
}

export default function SortableHeader({ label, sortKey, currentSort, requestSort, className = "" }: Props) {
  const isActive = currentSort?.key === sortKey;

  return (
    <div 
      onClick={() => requestSort(sortKey)}
      // 🔥 Agregamos dark:hover:text-green-400 para que resalte en fondos oscuros
      className={`flex items-center gap-2 cursor-pointer hover:text-green-700 dark:hover:text-green-400 transition-colors group select-none ${className}`}
      title={`Ordenar por ${label}`}
    >
      <span>{label}</span>
      {/* 🔥 Flechas base adaptadas */}
      <span className="text-gray-400 dark:text-gray-500 flex items-center justify-center w-4 transition-colors">
        {!isActive && <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        {/* 🔥 Flechas activas adaptadas */}
        {isActive && currentSort.direction === 'asc' && <ArrowUp size={14} className="text-green-700 dark:text-green-400" />}
        {isActive && currentSort.direction === 'desc' && <ArrowDown size={14} className="text-green-700 dark:text-green-400" />}
      </span>
    </div>
  );
}