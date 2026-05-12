"use client";

import { X, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string; // <-- Le agregamos esto
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Eliminar" 
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500 text-sm mt-1">{message}</p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {/* Usamos el texto dinámico, y si no le pasamos nada, dice "Eliminar" por defecto */}
              {isLoading ? "Procesando..." : confirmText} 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}