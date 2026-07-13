"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { Menu } from "lucide-react"; 
import { apiFetch } from "@/services/api"; 
import UpgradeModal from "@/components/ui/UpgradeModal";
import GracePeriodBanner from "@/components/layout/GracePeriodBanner"; 
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import Script from "next/script"; // 🔥 IMPORTAMOS EL COMPONENTE SCRIPT

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state: any) => state.setUser); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const rehidratarSesion = async () => {
      try {
        const res = await apiFetch(`/api/auth/refresh`, { method: "POST" });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data); 
          
          // 🔥 CLAVE: Guardamos el token fresco en las cookies por si el usuario recarga la página con F5
          if (data.accessToken) {
            document.cookie = `next_auth_token=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
          }
        }
      } catch (error) {
        console.error("Error al rehidratar sesión:", error);
      }
    };

    rehidratarSesion();
  }, [setUser]);

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-64 transition-all duration-300">
        
        <div className="lg:hidden flex items-center justify-between bg-green-700 text-white p-4 shadow-md sticky top-0 z-30">
          <span className="font-bold text-xl tracking-wide">AseguraSimple</span>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-1.5 hover:bg-green-600 rounded-md transition-colors"
          >
            <Menu size={26} />
          </button>
        </div>

        {/* 🔥 Bánner de período de gracia */}
        <GracePeriodBanner />

        <main className="flex-1 flex flex-col w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* MODALES GLOBALES DE LA APLICACIÓN */}
      <UpgradeModal />
      <SessionExpiredModal />

      {/* 🔥 WIDGET DE SOPORTE (CRISP CHAT) */}
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