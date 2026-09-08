import { X, Check, Loader2 } from "lucide-react";

interface ModalCambiarPlanProps {
  isOpen: boolean;
  onClose: () => void;
  agencia: any;
  planesOptions: any[];
  planSeleccionado: string;
  setPlanSeleccionado: (plan: string) => void;
  onConfirm: () => void;
  isUpdating: boolean;
}

export default function ModalCambiarPlan({ isOpen, onClose, agencia, planesOptions, planSeleccionado, setPlanSeleccionado, onConfirm, isUpdating }: ModalCambiarPlanProps) {
  if (!isOpen || !agencia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-5 md:px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 shrink-0">
          <h3 className="text-base md:text-lg font-bold text-white">Gestionar Suscripción</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 md:p-6 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs md:text-sm text-gray-400">Seleccioná el nuevo nivel de acceso para:</p>
            <p className="text-base md:text-lg font-black text-white mt-1 break-words">{agencia.nombre}</p>
            <p className="text-xs text-gray-500 break-words">{agencia.email}</p>
          </div>
          <div className="flex flex-col gap-3">
            {planesOptions.map((plan) => (
              <button key={plan.id} onClick={() => setPlanSeleccionado(plan.id)}
                className={`relative w-full flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 text-left transition-all ${planSeleccionado === plan.id ? "bg-gray-800 border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.15)]" : "bg-gray-950 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50"}`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`${plan.bg} ${plan.color} p-2.5 md:p-3 rounded-xl border ${plan.border}`}>{plan.icon}</div>
                  <div>
                    <span className="block font-bold text-white text-sm md:text-base">{plan.nombre}</span>
                    <span className="block text-[10px] md:text-xs text-gray-500 mt-0.5">Nivel de acceso al sistema</span>
                  </div>
                </div>
                {planSeleccionado === plan.id && (
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 md:px-6 py-4 border-t border-gray-800 bg-gray-950/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors bg-gray-800 sm:bg-transparent rounded-xl" disabled={isUpdating}>Cancelar</button>
          <button onClick={onConfirm} disabled={isUpdating} className="w-full sm:w-auto justify-center px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 disabled:opacity-50">
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}