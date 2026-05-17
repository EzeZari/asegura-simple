"use client";

import { AlertTriangle, X } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function AlertModal({ isOpen, onClose, title, message }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full md:w-auto px-8 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}