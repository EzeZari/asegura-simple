"use client";

import { useAuthStore } from "@/store/authStore";
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Zap, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

export default function SuscripcionSettings() {
  const user = useAuthStore((state: any) => state.user);
  const setUser = useAuthStore((state: any) => state.setUser);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // 🔥 1. FUNCIÓN DE REFRESH: Va al back y actualiza la cookie sin cerrar sesión
  const fetchLatestData = async () => {
    setIsRefreshing(true);
    try {
      const res = await apiFetch(`/api/auth/refresh`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user); // Actualizamos memoria
        
        // Guardamos el nuevo carnet
        if (data.accessToken) {
          document.cookie = `next_auth_token=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
        }
      }
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  if (!user) return null;

  const plan = user.plan || "GRATUITO";
  const esGratis = plan.toUpperCase() === "GRATUITO";
  
  const suscripcion = user.suscripcion;
  const estaActivo = suscripcion?.estado === "autorizado";
  const estaCancelado = suscripcion?.estado === "cancelled" || suscripcion?.estado === "paused";
  
  const fechaVencimiento = suscripcion?.fechaVencimiento 
    ? new Date(suscripcion.fechaVencimiento).toLocaleDateString("es-AR", { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  // 🔥 2. FUNCIÓN DE CANCELAR: Da de baja el débito en MP de verdad
  const handleCancelar = async () => {
    const confirmar = window.confirm("¿Estás seguro de que querés cancelar tu suscripción? Podrás seguir usando la plataforma con tu plan actual hasta que termine el ciclo de facturación.");
    
    if (!confirmar) return;

    setIsCancelling(true);
    try {
      const res = await apiFetch(`/api/pagos/cancelar`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert("Suscripción cancelada con éxito. Ya no se te realizarán cobros automáticos.");
        fetchLatestData(); // Refrescamos para que la UI se pinte de rojo/cancelada
      } else {
        throw new Error(data.error || "No se pudo cancelar la suscripción.");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mi Suscripción</h2>
          <p className="text-sm text-gray-500 mt-1">Gestioná tu plan actual y tus métodos de pago.</p>
        </div>
        
        <button 
          onClick={fetchLatestData} 
          disabled={isRefreshing || isCancelling}
          className="px-3 py-2 bg-white text-gray-600 hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-semibold border border-gray-200 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin text-green-600" : ""} />
          {isRefreshing ? "Sincronizando..." : "Sincronizar estado"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Plan Actual */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-green-50 text-green-700 rounded-xl">
                <Zap size={24} />
              </div>
              {esGratis ? (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Básico</span>
              ) : estaActivo ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 size={14} /> Al día
                </span>
              ) : estaCancelado ? (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  Cancelada
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                  <AlertTriangle size={14} /> Pago pendiente
                </span>
              )}
            </div>
            
            <h3 className="text-gray-500 text-sm font-medium mb-1">Plan Actual</h3>
            <p className="text-2xl font-black text-gray-900 capitalize">{plan.toLowerCase()}</p>
            
            {!esGratis && fechaVencimiento && (
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  {estaCancelado ? "Tu acceso termina el:" : "Próximo cobro:"} <strong className="text-gray-900">{fechaVencimiento}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <Link 
              href={`/planes?email=${user.email}`}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-center text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              {esGratis ? "Mejorar Plan" : "Cambiar Plan"}
            </Link>
          </div>
        </div>

        {/* Tarjeta de Gestión de Pago */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="text-gray-400" size={24} />
              <h3 className="font-bold text-gray-900">Método de Pago</h3>
            </div>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Tus pagos se procesan de forma segura a través de <strong>Mercado Pago</strong>. Las renovaciones se realizan automáticamente de forma mensual.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-5 mt-auto">
            <a 
              href="https://www.mercadopago.com.ar/subscriptions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Gestionar en Mercado Pago <ExternalLink size={14} />
            </a>
            
            {!esGratis && (
              <button 
                onClick={handleCancelar}
                disabled={estaCancelado || isCancelling}
                className="text-gray-400 hover:text-red-600 text-xs font-medium underline transition-colors disabled:opacity-50 disabled:no-underline mt-2"
              >
                {isCancelling ? "Procesando..." : estaCancelado ? "Suscripción cancelada" : "Cancelar suscripción"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}