"use client";

import { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export default function ZoomableImage({ src, alt, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Bloquear el scroll de la página cuando la imagen está abierta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Extraemos si tiene redondeo para aplicarlo al overlay del hover
  const isRounded2xl = className?.includes('rounded-2xl');

  return (
    <>
      {/* Imagen base (Clickable) */}
      <div 
        className="relative group cursor-pointer w-full h-full"
        onClick={() => setIsOpen(true)}
      >
        <img src={src} alt={alt} className={className} />
        
        {/* Overlay hover para PC */}
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center ${isRounded2xl ? 'rounded-2xl' : ''}`}>
          <div className="bg-white text-gray-900 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 shadow-xl hidden md:block">
            <ZoomIn size={24} />
          </div>
        </div>
      </div>

      {/* Modal a pantalla completa */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 md:p-8 cursor-zoom-out"
            onClick={() => setIsOpen(false)}
          >
            <button 
              className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-[210]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <X size={28} />
            </button>
            
            <motion.img 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={src} 
              alt={alt} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()} // Evita cerrar si hacen clic sobre la imagen
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}