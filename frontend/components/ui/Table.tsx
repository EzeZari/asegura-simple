"use client";

import { ReactNode } from "react";

export interface TableColumn {
  label: string | ReactNode; 
  align?: "left" | "center" | "right";
}

interface TableProps {
  columns: TableColumn[];
  children: ReactNode; 
  isLoading: boolean;
  isEmpty: boolean;
  emptyContent: ReactNode; 
}

export default function Table({ columns, children, isLoading, isEmpty, emptyContent }: TableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full">
      {/* 🔥 AJUSTE VITAL: overflow-x-auto permite hacer scroll horizontal en celulares */}
      <div className="overflow-x-auto w-full min-h-[300px] pb-10 rounded-xl">
        <table className="w-full text-left text-sm border-collapse relative">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  // 🔥 Mantenemos el texto en una sola línea (whitespace-nowrap)
                  className={`px-4 lg:px-6 py-4 font-semibold whitespace-nowrap ${
                    col.align === "center" ? "text-center" : 
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  Cargando datos...
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  {emptyContent}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}