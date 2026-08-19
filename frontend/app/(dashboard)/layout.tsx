"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { Menu } from "lucide-react"; 
import { apiFetch } from "@/services/api"; 
import UpgradeModal from "@/components/ui/UpgradeModal";
import GracePeriodBanner from "@/components/layout/GracePeriodBanner"; 
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import ComunicadosGlobales from "@/components/layout/ComunicadosGlobales";
import Script from "next/script";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state: any) => state.setUser); 
  const user = useAuthStore((state: any) => state.user); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Rehidratamos la sesión
        const resSession = await apiFetch(`/api/auth/refresh`, { method: "POST" });
        if (resSession.ok) {
          const data = await resSession.json();
          setUser(data.user || data); 
          
          if (data.accessToken) {
            document.cookie = `next_auth_token=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-x-hidden transition-colors duration-300">
      
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

        {/* 🔥 INYECTAMOS EL COMPONENTE LIMPIO */}
        <ComunicadosGlobales />
        <GracePeriodBanner />

        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>

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