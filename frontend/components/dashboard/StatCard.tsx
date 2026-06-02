"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  href?: string; 
}

export default function StatCard({ title, value, description, icon: Icon, trend = "neutral", href }: StatCardProps) {
  const CardContent = (
    // 🔥 Ajuste: p-4 y gap-3 en móviles. p-6 y gap-4 en PC.
    <div className={`bg-white p-4 lg:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 lg:gap-4 transition-all h-full
      ${href ? 'hover:shadow-md hover:border-green-300 hover:-translate-y-1 cursor-pointer' : ''}
    `}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs lg:text-sm font-medium text-gray-500">{title}</h3>
        {/* 🔥 Ajuste: Ícono un poquito más chico en el celu */}
        <div className="p-1.5 lg:p-2 bg-green-50 rounded-lg">
          <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-green-700" />
        </div>
      </div>
      
      <div>
        {/* 🔥 Ajuste: Número en text-2xl para móviles y 3xl para PC */}
        <span className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</span>
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-xs lg:text-sm font-medium ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
          }`}>
            {description}
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus:ring-2 focus:ring-green-600 rounded-xl">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}