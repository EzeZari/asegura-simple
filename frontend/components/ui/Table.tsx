"use client";

import { ReactNode } from "react";

export interface TableColumn {
  // 🔥 ESTE ES EL CAMBIO: Ahora acepta strings O componentes de React
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-visible pb-10 w-full">
      <div className="overflow-visible w-full min-h-[300px]">
        <table className="w-full text-left text-sm border-collapse relative">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-4 font-semibold ${
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