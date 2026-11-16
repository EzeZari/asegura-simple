"use client";

import { ReactNode } from "react";

export interface TableColumn {
  label: string | ReactNode; 
  align?: "left" | "center" | "right";
  isStickyLeft?: boolean;
  isStickyRight?: boolean;
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm w-full min-w-0 transition-colors duration-300">
      
      {/* 
        Le sacamos el pb-10 excesivo que tenías y dejamos que el contenedor 
        maneje el scroll horizontal de forma limpia. 
      */}
      <div className="overflow-x-auto w-full min-h-[300px]">
        <table className="w-full text-left text-sm border-collapse relative">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-4 lg:px-6 py-4 font-semibold whitespace-nowrap 
                    ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}
                    ${col.isStickyLeft ? "sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-[1px_0_0_0_rgba(243,244,246,1)] dark:shadow-[1px_0_0_0_rgba(55,65,81,1)]" : ""}
                    ${col.isStickyRight ? "sticky right-0 z-10 bg-gray-50 dark:bg-gray-900 shadow-[-1px_0_0_0_rgba(243,244,246,1)] dark:shadow-[-1px_0_0_0_rgba(55,65,81,1)]" : ""}
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Cargando datos...
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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