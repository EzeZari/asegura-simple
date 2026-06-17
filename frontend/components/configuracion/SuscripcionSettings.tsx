"use client";

import { useAuthStore } from "@/store/authStore";
// 🔥 Agregamos el icono FileText para la tabla
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Zap, ExternalLink, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

import ConfirmModal from "@/components/ui/ConfirmModal";
import AlertModal from "@/components/ui/AlertModal";

export default function SuscripcionSettings() {
  const user = useAuthStore((state: any) => state.user);
  const setUser = useAuthStore((state: any) => state.setUser);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // 🔥 Nuevo estado para guardar los pagos
  const [pagos, setPagos] = useState<any[]>([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "", message: "" });

  const fetchLatestData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Buscamos el estado del usuario
      const res = await apiFetch(`/api/auth/refresh`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.accessToken) {
          document.cookie = `next_auth_token=${data.accessToken}; path=/; max-age=86400; secure; samesite=strict`;
        }
      }

      // 🔥 2. Buscamos el historial de pagos
      const resPagos = await apiFetch(`/api/pagos/historial`);
      if (resPagos.ok) {
        const dataPagos = await resPagos.json();
        setPagos(dataPagos);
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

  const ejecutarCancelacion = async () => {
    setIsCancelling(true);
    try {
      const res = await apiFetch(`/api/pagos/cancelar`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setShowConfirm(false);
        setAlertConfig({
          isOpen: true,
          title: "Suscripción cancelada",
          message: "Tu suscripción ha sido dada de baja. Ya no se te realizarán cobros automáticos, pero podrás seguir usando la plataforma hasta que finalice el ciclo actual."
        });
        fetchLatestData();
      } else {
        throw new Error(data.error || "No se pudo cancelar la suscripción.");
      }
    } catch (error: any) {
      setShowConfirm(false);
      setAlertConfig({
        isOpen: true,
        title: "Atención",
        message: error.message || "Ocurrió un error al intentar cancelar."
      });
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
              {esGratis ? "Mejorar Plan" : estaCancelado ? "Reactivar Plan" : "Cambiar Plan"}
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
                onClick={() => setShowConfirm(true)}
                disabled={estaCancelado || isCancelling}
                className="text-gray-400 hover:text-red-600 text-xs font-medium underline transition-colors disabled:opacity-50 disabled:no-underline mt-2"
              >
                {estaCancelado ? "Suscripción cancelada" : "Cancelar suscripción"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 SECCIÓN NUEVA: Historial de Pagos */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Historial de Pagos</h3>
            <p className="text-xs text-gray-500">Últimos cobros procesados por Mercado Pago</p>
          </div>
        </div>

        {pagos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Aún no tenés pagos registrados en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-3 font-bold rounded-tl-lg">Fecha</th>
                  <th className="px-4 py-3 font-bold">Monto</th>
                  <th className="px-4 py-3 font-bold">Método</th>
                  <th className="px-4 py-3 font-bold text-right rounded-tr-lg">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago: any) => (
                  <tr key={pago.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {new Date(pago.fechaPago).toLocaleDateString("es-AR", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-medium">
                      ${pago.monto.toLocaleString("es-AR")} <span className="text-[10px] text-gray-400">{pago.moneda}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 capitalize">
                      {pago.metodoPago.replace("_", " ")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {pago.estado === "approved" ? (
                        <span className="bg-green-100 text-green-700 py-1 px-3 rounded-md text-xs font-bold uppercase tracking-wider">
                          Aprobado
                        </span>
                      ) : pago.estado === "rejected" ? (
                        <span className="bg-red-100 text-red-700 py-1 px-3 rounded-md text-xs font-bold uppercase tracking-wider">
                          Rechazado
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-md text-xs font-bold uppercase tracking-wider">
                          {pago.estado}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={ejecutarCancelacion}
        title="Cancelar Suscripción"
        message="¿Estás seguro de que querés cancelar? Podrás seguir usando AseguraSimple con tu plan actual hasta que termine el ciclo de facturación de este mes."
        confirmText="Sí, cancelar"
        isLoading={isCancelling}
      />

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
      />

    </div>
  );
}