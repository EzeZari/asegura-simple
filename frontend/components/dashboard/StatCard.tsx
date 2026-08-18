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
    // 🔥 Tarjetas con fondo dark:bg-gray-800 y bordes oscuros
    <div className={`bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3 lg:gap-4 transition-all h-full
      ${href ? 'hover:shadow-md hover:border-green-300 dark:hover:border-green-500 hover:-translate-y-1 cursor-pointer' : ''}
    `}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{title}</h3>
        {/* 🔥 Ícono y su círculo de fondo suavizados */}
        <div className="p-1.5 lg:p-2 bg-green-50 dark:bg-green-900/30 rounded-lg transition-colors">
          <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-green-700 dark:text-green-500 transition-colors" />
        </div>
      </div>
      
      <div>
        <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white transition-colors">{value}</span>
        <div className="mt-1 flex items-center gap-2">
          {/* 🔥 Colores de las tendencias (up/down/neutral) adaptados */}
          <span className={`text-xs lg:text-sm font-medium transition-colors ${
            trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
          }`}>
            {description}
          </span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500 rounded-xl transition-all">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}