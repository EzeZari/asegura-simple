import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface ModalEliminarCuentaProps {
  isOpen: boolean;
  onClose: () => void;
  agencia: any;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function ModalEliminarCuenta({ isOpen, onClose, agencia, onConfirm, isDeleting }: ModalEliminarCuentaProps) {
  if (!isOpen || !agencia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-red-900/50 w-full max-w-md rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-5 md:mb-6 border border-red-500/20 shadow-inner">
            <AlertTriangle size={28} className="md:w-8 md:h-8" />
          </div>
          <h3 className="text-lg md:text-xl font-black text-white mb-2">¿Eliminar esta cuenta?</h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
            Estás a punto de eliminar el acceso para <strong className="text-white">{agencia.nombre}</strong>. Esta acción es irreversible.
          </p>
          <div className="flex flex-col-reverse sm:flex-row w-full gap-3 mt-2">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}