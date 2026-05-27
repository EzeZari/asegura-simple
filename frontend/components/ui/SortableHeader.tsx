"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface Props {
  label: string;
  sortKey: string;
  currentSort: any; // 🔥 ACÁ ESTÁ LA MAGIA: Le pusimos "any" para destrabar el error
  requestSort: (key: any) => void;
  className?: string;
}

export default function SortableHeader({ label, sortKey, currentSort, requestSort, className = "" }: Props) {
  const isActive = currentSort?.key === sortKey;

  return (
    <div 
      onClick={() => requestSort(sortKey)}
      className={`flex items-center gap-2 cursor-pointer hover:text-green-700 transition-colors group select-none ${className}`}
      title={`Ordenar por ${label}`}
    >
      <span>{label}</span>
      <span className="text-gray-400 flex items-center justify-center w-4">
        {!isActive && <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        {isActive && currentSort.direction === 'asc' && <ArrowUp size={14} className="text-green-700" />}
        {isActive && currentSort.direction === 'desc' && <ArrowDown size={14} className="text-green-700" />}
      </span>
    </div>
  );
}