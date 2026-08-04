"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { Menu } from "lucide-react"; 
import { apiFetch } from "@/services/api"; 
import UpgradeModal from "@/components/ui/UpgradeModal";
import GracePeriodBanner from "@/components/layout/GracePeriodBanner"; 
import SessionExpiredModal from "@/components/ui/SessionExpiredModal";
import Script from "next/script";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state: any) => state.setUser); 
  const user = useAuthStore((state: any) => state.user); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [comunicado, setComunicado] = useState<any>(null); // 🔥 ESTADO DEL BANNER

  useEffect(() => {
    const rehidratarSesion = async () => {
      try {
        const res = await apiFetch(`/api/auth/refresh`, { method: "POST" });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data); 
          
          if (data.accessToken) {
            document.cookie = `next_auth_token=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
          }
        }
      } catch (error) {
        console.error("Error al rehidratar sesión:", error);
      }
    };

    // 🔥 Agregamos la consulta del comunicado acá mismo al cargar la página
    const buscarComunicado = async () => {
      try {
        const res = await apiFetch(`/api/dashboard/comunicado`);
        if (res.ok) {
          const data = await res.json();
          if (data?.activo && data?.mensaje) {
            setComunicado(data);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    rehidratarSesion();
    buscarComunicado();
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

  // 🔥 Calculador de color del banner
  const bgBannerClass = 
    comunicado?.tipo === 'red' ? 'bg-red-600' :
    comunicado?.tipo === 'green' ? 'bg-green-600' :
    comunicado?.tipo === 'yellow' ? 'bg-amber-600' : 
    'bg-blue-600';

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

        {/* 🔥 BANNER GLOBAL (Si está activo) */}
        {comunicado && (
          <div className={`${bgBannerClass} text-white px-4 py-3 text-center text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2`}>
            {comunicado.mensaje}
          </div>
        )}

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