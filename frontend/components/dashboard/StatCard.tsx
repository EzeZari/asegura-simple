import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  href?: string; // ¡Agregamos la ruta de destino!
}

export default function StatCard({ title, value, description, icon: Icon, trend = "neutral", href }: StatCardProps) {
  // Separamos el contenido visual para no repetir código
  const CardContent = (
    <div className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 transition-all h-full
      ${href ? 'hover:shadow-md hover:border-green-300 hover:-translate-y-1 cursor-pointer' : ''}
    `}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-green-50 rounded-lg">
          <Icon size={20} className="text-green-700" />
        </div>
      </div>
      
      <div>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-sm font-medium ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
          }`}>
            {description}
          </span>
        </div>
      </div>
    </div>
  );

  // Si nos pasan un enlace, envolvemos la tarjeta para que sea cliqueable
  if (href) {
    return (
      <Link href={href} className="block outline-none focus:ring-2 focus:ring-green-600 rounded-xl">
        {CardContent}
      </Link>
    );
  }

  // Si no hay enlace, mostramos la tarjeta normal
  return CardContent;
}