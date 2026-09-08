import { Calendar, X, Loader2, Save } from "lucide-react";

interface ModalEditarSuscripcionProps {
  isOpen: boolean;
  onClose: () => void;
  agencia: any;
  subData: { estado: string; fechaVencimiento: string };
  setSubData: (data: { estado: string; fechaVencimiento: string }) => void;
  onConfirm: () => void;
  isUpdating: boolean;
}

export default function ModalEditarSuscripcion({ isOpen, onClose, agencia, subData, setSubData, onConfirm, isUpdating }: ModalEditarSuscripcionProps) {
  if (!isOpen || !agencia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-5 md:px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-blue-500"/> Editar Suscripción
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 md:p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-400">Modificando acceso manual para:</p>
            <p className="text-sm font-black text-white">{agencia.nombre}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estado Actual</label>
            <select 
              value={subData.estado} 
              onChange={(e) => setSubData({...subData, estado: e.target.value})}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            >
              <option value="autorizado">Autorizado (Activo Pago)</option>
              <option value="trial">Trial (Prueba 14 días)</option>
              <option value="en_proceso">En Proceso (Pago en revisión)</option>
              <option value="pendiente">Pendiente (Pago atrasado)</option>
              <option value="cancelado">Cancelado (Sin acceso)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Fecha de Próx. Cobro / Fin Trial</label>
            <input 
              type="date" 
              value={subData.fechaVencimiento} 
              onChange={(e) => setSubData({...subData, fechaVencimiento: e.target.value})}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <p className="text-[11px] text-yellow-500/80 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
            ⚠️ Cuidado: Modificar esto sobreescribirá la información de Mercado Pago. Útil para cobros manuales o alargar períodos de prueba.
          </p>
        </div>
        
        <div className="px-5 md:px-6 py-4 border-t border-gray-800 bg-gray-950/50 flex flex-col sm:flex-row justify-end gap-3">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white bg-gray-800 sm:bg-transparent rounded-xl" disabled={isUpdating}>Cancelar</button>
          <button onClick={onConfirm} disabled={isUpdating} className="w-full sm:w-auto justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
          </button>
        </div>
      </div>
    </div>
  );
}