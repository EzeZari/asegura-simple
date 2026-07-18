import { Mail, Phone, Trash2 } from "lucide-react";

interface TablaAgenciasProps {
  agenciasFiltradas: any[];
  planesOptions: any[];
  onModificarPlan: (agencia: any) => void;
  onEliminarCuenta: (agencia: any) => void;
}

export default function TablaAgencias({ agenciasFiltradas, planesOptions, onModificarPlan, onEliminarCuenta }: TablaAgenciasProps) {
  return (
    <div className="bg-transparent md:bg-gray-900 md:border border-gray-800 rounded-3xl md:shadow-2xl md:overflow-hidden">
      <div className="w-full">
        <table className="w-full text-left border-collapse block md:table">
          <thead className="hidden lg:table-header-group">
            <tr className="bg-gray-950/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-5 font-bold border-b border-gray-800">ID</th>
              <th className="p-5 font-bold border-b border-gray-800">Usuario y Jerarquía</th>
              <th className="p-5 font-bold border-b border-gray-800">Contacto</th>
              <th className="p-5 font-bold border-b border-gray-800">Plan Actual</th>
              <th className="p-5 font-bold border-b border-gray-800 text-right">Acciones</th>
            </tr>
          </thead>
          
          <tbody className="block md:table-row-group space-y-4 md:space-y-0 md:divide-y md:divide-gray-800/50">
            {agenciasFiltradas.length === 0 ? (
              <tr className="block md:table-row bg-gray-900 rounded-2xl border border-gray-800">
                <td colSpan={5} className="block md:table-cell p-10 text-center text-gray-500 font-medium">
                  No se encontraron usuarios con esos filtros.
                </td>
              </tr>
            ) : (
              agenciasFiltradas.map((agencia) => {
                const planInfo = planesOptions.find(p => p.id === (agencia.plan || "GRATUITO"));
                
                const renderRolBadge = (usuario: any) => {
                  let rol = (usuario.rol || usuario.role || "").toUpperCase();
                  if (!rol && !usuario.jefeId) rol = "ADMIN";
                  else if (!rol) rol = "SIN ROL";

                  if (rol.includes('ADMIN') || rol.includes('DUEÑO')) {
                    return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-500/20">Dueño / Admin</span>;
                  }
                  if (rol.includes('PRODUCTOR')) {
                    return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Productor</span>;
                  }
                  if (rol.includes('LECTOR')) {
                    return <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">Lector</span>;
                  }
                  return <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">{rol}</span>;
                };

                return (
                  <tr key={agencia.id} className="block md:table-row bg-gray-900 md:bg-transparent rounded-2xl md:rounded-none border border-gray-800 md:border-0 hover:bg-gray-800/20 transition-colors p-4 md:p-0">
                    <td className="block md:table-cell p-2 md:p-5 text-sm font-mono border-b border-gray-800/50 md:border-0 flex justify-between items-center md:items-start md:justify-start">
                      <span className="lg:hidden text-xs text-gray-500 font-bold uppercase">ID</span>
                      <span className="text-gray-400">#{agencia.id}</span>
                    </td>
                    
                    <td className="block md:table-cell p-2 md:p-5 border-b border-gray-800/50 md:border-0 pt-3 md:pt-5">
                      <span className="lg:hidden text-xs text-gray-500 font-bold uppercase block mb-2">Usuario y Jerarquía</span>
                      <div className="font-bold text-white flex items-center gap-2 mb-1.5">
                        {agencia.nombre}
                        {agencia.isVerified && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Email Confirmado"></span>}
                      </div>
                      <div className="flex items-center gap-2 mb-1">{renderRolBadge(agencia)}</div>
                      {agencia.jefe && (
                        <div className="text-[11px] text-gray-400 mt-1 bg-gray-800/50 inline-block px-2 py-1 rounded-md">
                          Equipo de: <span className="font-bold text-gray-300">{agencia.jefe.nombre}</span>
                        </div>
                      )}
                    </td>
                    
                    <td className="block md:table-cell p-2 md:p-5 border-b border-gray-800/50 md:border-0 pt-3 md:pt-5">
                      <span className="lg:hidden text-xs text-gray-500 font-bold uppercase block mb-2">Contacto</span>
                      <div className="flex flex-col gap-2 md:gap-1.5">
                        <span className="flex items-center gap-2 text-sm text-gray-300"><Mail size={14} className="text-gray-500 shrink-0"/> <span className="break-all">{agencia.email}</span></span>
                        {agencia.telefono && <span className="flex items-center gap-2 text-xs text-gray-500"><Phone size={12} className="shrink-0"/> {agencia.telefono}</span>}
                      </div>
                    </td>
                    
                    <td className="block md:table-cell p-2 md:p-5 border-b border-gray-800/50 md:border-0 pt-3 md:pt-5 flex justify-between items-center md:items-start md:justify-start">
                      <span className="lg:hidden text-xs text-gray-500 font-bold uppercase">Plan Actual</span>
                      {agencia.jefeId ? (
                         <span className="text-xs font-medium text-gray-500 italic">Heredado del Dueño</span>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 ${planInfo?.bg} ${planInfo?.color} border ${planInfo?.border} px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide`}>
                          {planInfo?.icon} {planInfo?.nombre}
                        </div>
                      )}
                    </td>
                    
                    <td className="block md:table-cell p-2 md:p-5 pt-4 md:pt-5">
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full">
                        {agencia.jefeId ? (
                          <span className="text-xs font-bold text-gray-600 hidden md:block">No aplica plan</span>
                        ) : (
                          <button 
                            onClick={() => onModificarPlan(agencia)}
                            className="text-xs md:text-sm font-bold text-green-500 hover:text-green-400 transition-colors px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl flex-1 md:flex-none"
                          >
                            Modificar Plan
                          </button>
                        )}
                        <button 
                          onClick={() => onEliminarCuenta(agencia)}
                          title="Eliminar Cuenta"
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 bg-gray-800 md:bg-transparent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}