"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { Menu, Megaphone } from "lucide-react"; 
import { apiFetch } from "@/services/api"; 
import UpgradeModal from "@/components/ui/UpgradeModal";
import GracePeriodBanner from "@/components/layout/GracePeriodBanner"; 
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import Script from "next/script";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state: any) => state.setUser); 
  const user = useAuthStore((state: any) => state.user); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 🔥 ESTADOS DE LOS ANUNCIOS
  const [comunicado, setComunicado] = useState<any>(null); 
  const [showModalAnnouncement, setShowModalAnnouncement] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        let currentUser = user;
        
        // 1. Rehidratamos la sesión
        const resSession = await apiFetch(`/api/auth/refresh`, { method: "POST" });
        if (resSession.ok) {
          const data = await resSession.json();
          currentUser = data.user || data;
          setUser(currentUser); 
          
          if (data.accessToken) {
            document.cookie = `next_auth_token=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
          }
        }

        // 2. Buscamos si hay anuncios activos
        const resCom = await apiFetch(`/api/dashboard/comunicado`);
        if (resCom.ok) {
          const dataCom = await resCom.json();
          
          if (dataCom) {
            setComunicado(dataCom);
            
            // 🔥 LÓGICA INTELIGENTE: Si el Modal está activo y tiene texto
            if (dataCom.activoModal && dataCom.mensajeModal && currentUser?.id) {
              // Comparamos directamente contra el texto exacto del modal
              const modalLeido = localStorage.getItem(`modal_leido_${currentUser.id}`);
              
              if (modalLeido !== dataCom.mensajeModal) {
                setShowModalAnnouncement(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error inicializando la app:", error);
      }
    };

    initApp();
  }, [setUser]);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const crisp = (window as any).$crisp;
      if (crisp) {
        crisp.push(["set", "user:email", [user.email]]);
        crisp.push(["set", "user:nickname", [`${user.nombre} ${user.apellido || ""}`.trim()]]);
      }
    }
  }, [user]);

  // Función para cerrar el modal y guardar el texto como constancia de lectura
  const handleDismissModal = () => {
    if (user?.id && comunicado?.mensajeModal) {
      localStorage.setItem(`modal_leido_${user.id}`, comunicado.mensajeModal);
    }
    setShowModalAnnouncement(false);
  };

  // Colores dinámicos
  const getBannerColor = (tipo: string) => {
    switch(tipo) {
      case 'red': return 'bg-red-600';
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen w-full transition-all duration-300">
        
        <div className="lg:hidden flex items-center justify-between bg-green-700 text-white p-4 shadow-md sticky top-0 z-30">
          <span className="font-bold text-xl tracking-wide">AseguraSimple</span>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-1.5 hover:bg-green-600 rounded-md transition-colors"
          >
            <Menu size={26} />
          </button>
        </div>

        {/* 🔥 BANNER SUPERIOR (No bloqueante) */}
        {comunicado?.activoBanner && comunicado?.mensajeBanner && (
          <div className={`${getBannerColor(comunicado.tipoBanner)} text-white px-4 py-3 text-center text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2`}>
            {comunicado.mensajeBanner}
          </div>
        )}

        <GracePeriodBanner />

        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* 🔥 MODAL BLOQUEANTE (Pop-up de lectura obligatoria) */}
      {showModalAnnouncement && comunicado?.activoModal && comunicado?.mensajeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`h-2 w-full ${getBannerColor(comunicado.tipoModal)}`}></div>
            <div className="p-6 md:p-8 flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full mb-5 flex items-center justify-center ${getBannerColor(comunicado.tipoModal)} text-white shadow-lg`}>
                <Megaphone size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">Nuevo Anuncio</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8 whitespace-pre-wrap">
                {comunicado.mensajeModal}
              </p>
              <button 
                onClick={handleDismissModal}
                className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all ${getBannerColor(comunicado.tipoModal)} hover:opacity-90 active:scale-[0.98]`}
              >
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal />
      <SessionExpiredModal />

      <Script id="crisp-widget" strategy="afterInteractive">
        {`
          window.$crisp=[];
          window.CRISP_WEBSITE_ID="2f806907-e4f4-41c4-a37b-e8601b2a4f9e";
          (function(){
            d=document;s=d.createElement("script");
            s.src="https://client.crisp.chat/l.js";
            s.async=1;d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `}
      </Script>
    </div>
  );
}