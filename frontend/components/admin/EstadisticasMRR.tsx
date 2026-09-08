import { Activity, TrendingUp, DollarSign } from "lucide-react";

interface EstadisticasProps {
  stats: {
    totalAgenciasActivas: number;
    usuariosPagos: number;
    usuariosTrial: number;
    mrr: number;
  };
}

export default function EstadisticasMRR({ stats }: EstadisticasProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
          <Activity size={28} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Agencias Activas</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.totalAgenciasActivas}</span>
            <span className="text-sm font-medium text-gray-500">dueños</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0">
          <TrendingUp size={28} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Salud de Cartera</p>
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5" title="Usuarios que están pagando">
              <span className="text-2xl font-black text-green-400">{stats.usuariosPagos}</span>
              <span className="text-xs font-bold text-gray-500 uppercase">Pagos</span>
            </div>
            <div className="w-px h-6 bg-gray-800"></div>
            <div className="flex items-baseline gap-1.5" title="Usuarios en período de prueba gratuito">
              <span className="text-2xl font-black text-cyan-400">{stats.usuariosTrial}</span>
              <span className="text-xs font-bold text-gray-500 uppercase">En Trial</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-green-500/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(22,163,74,0.05)] flex items-center gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-green-500/5 to-transparent pointer-events-none"></div>
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500 shrink-0 relative z-10">
          <DollarSign size={28} />
        </div>
        <div className="relative z-10">
          <p className="text-sm font-bold text-green-500/80 uppercase tracking-wider mb-1">Ingreso Mensual (MRR)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-green-500">$</span>
            <span className="text-4xl font-black text-white tracking-tight">
              {stats.mrr.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}