"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, CreditCard, Crown, Star, X, Check, Loader2, Trash2, AlertTriangle } from "lucide-react";
import Toast from "@/components/ui/Toast";
import FiltrosAgencias from "@/components/admin/FiltrosAgencias";
import AdminHeader from "@/components/admin/AdminHeader";
import TablaAgencias from "@/components/admin/TablaAgencias";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("TODOS");

  const [modalOpen, setModalOpen] = useState(false);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<any>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<string>("GRATUITO");
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agenciaAEliminar, setAgenciaAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [toast, setToast] = useState({ show: false, msg: "" });

  const fetchAgencias = async () => {
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/agencias`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al obtener cuentas");
      const data = await res.json();
      setAgencias(data);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("asegurasimple_admin_token");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("asegurasimple_admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchAgencias();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("asegurasimple_admin_token");
    router.push("/admin/login");
  };

  const confirmarCambioPlan = async () => {
    if (!agenciaSeleccionada) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/agencias/${agenciaSeleccionada.id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nuevoPlan: planSeleccionado })
      });
      if (!res.ok) throw new Error("Error al actualizar el plan");
      setAgencias(prev => prev.map(a => a.id === agenciaSeleccionada.id ? { ...a, plan: planSeleccionado } : a));
      setToast({ show: true, msg: "Plan actualizado con éxito" });
      setModalOpen(false);
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al actualizar el plan" });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!agenciaAEliminar) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/agencias/${agenciaAEliminar.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar la cuenta");
      
      setAgencias(prev => prev.filter(a => a.id !== agenciaAEliminar.id));
      setToast({ show: true, msg: "Cuenta eliminada permanentemente del sistema" });
      setDeleteModalOpen(false);
    } catch (error: any) {
      setToast({ show: true, msg: error.message || "Error al eliminar la cuenta" });
    } finally {
      setIsDeleting(false);
    }
  };

  const agenciasFiltradas = agencias.filter((agencia) => {
    const matchSearch = 
      agencia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agencia.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agencia.id.toString() === searchTerm;

    const planUsuario = agencia.plan || "GRATUITO";
    const matchPlan = filtroPlan === "TODOS" || planUsuario === filtroPlan;

    return matchSearch && matchPlan;
  });

  const planesOptions = [
    { id: "GRATUITO", nombre: "Gratuito", icon: <CreditCard size={20} />, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
    { id: "PROFESIONAL", nombre: "Profesional", icon: <Star size={20} />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { id: "AGENCIA", nombre: "Agencia Elite", icon: <Crown size={20} />, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <ShieldCheck size={48} className="text-green-500 opacity-50" />
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Cargando Sistema Maestro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-green-500/30 font-sans relative pb-10">
      
      <AdminHeader onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="text-gray-500 w-5 h-5 md:w-6 md:h-6" /> 
              Cuentas Registradas
            </h2>
            <p className="text-sm md:text-base text-gray-400 mt-1">Radiografía completa de usuarios y suscripciones.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 px-4 py-3 md:py-2 rounded-xl flex flex-col md:flex-row md:items-center gap-1 md:gap-3 shadow-lg w-full md:w-auto">
            <span className="text-sm font-medium text-gray-400 text-center md:text-left">Usuarios Mostrados:</span>
            <span className="text-lg font-black text-green-500 text-center md:text-left">
              {agenciasFiltradas.length} <span className="text-sm font-normal text-gray-500">de {agencias.length}</span>
            </span>
          </div>
        </div>

        <FiltrosAgencias 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          filtroPlan={filtroPlan} 
          setFiltroPlan={setFiltroPlan} 
        />

        <TablaAgencias 
          agenciasFiltradas={agenciasFiltradas} 
          planesOptions={planesOptions}
          onModificarPlan={(agencia) => {
            setAgenciaSeleccionada(agencia);
            setPlanSeleccionado(agencia.plan || "GRATUITO");
            setModalOpen(true);
          }}
          onEliminarCuenta={(agencia) => {
            setAgenciaAEliminar(agencia);
            setDeleteModalOpen(true);
          }}
        />
      </main>

      {/* MODAL CAMBIAR PLAN */}
      {modalOpen && agenciaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 shrink-0">
              <h3 className="text-base md:text-lg font-bold text-white">Gestionar Suscripción</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 md:p-6 overflow-y-auto">
              <div className="mb-6">
                <p className="text-xs md:text-sm text-gray-400">Seleccioná el nuevo nivel de acceso para:</p>
                <p className="text-base md:text-lg font-black text-white mt-1 break-words">{agenciaSeleccionada.nombre}</p>
                <p className="text-xs text-gray-500 break-words">{agenciaSeleccionada.email}</p>
              </div>
              <div className="flex flex-col gap-3">
                {planesOptions.map((plan) => (
                  <button key={plan.id} onClick={() => setPlanSeleccionado(plan.id)}
                    className={`relative w-full flex items-center justify-between p-3 md:p-4 rounded-2xl border-2 text-left transition-all ${planSeleccionado === plan.id ? "bg-gray-800 border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.15)]" : "bg-gray-950 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50"}`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`${plan.bg} ${plan.color} p-2.5 md:p-3 rounded-xl border ${plan.border}`}>{plan.icon}</div>
                      <div>
                        <span className="block font-bold text-white text-sm md:text-base">{plan.nombre}</span>
                        <span className="block text-[10px] md:text-xs text-gray-500 mt-0.5">Nivel de acceso al sistema</span>
                      </div>
                    </div>
                    {planSeleccionado === plan.id && (
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 md:px-6 py-4 border-t border-gray-800 bg-gray-950/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <button onClick={() => setModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors bg-gray-800 sm:bg-transparent rounded-xl" disabled={isUpdating}>Cancelar</button>
              <button onClick={confirmarCambioPlan} disabled={isUpdating} className="w-full sm:w-auto justify-center px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 disabled:opacity-50">
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {deleteModalOpen && agenciaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-red-900/50 w-full max-w-md rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-5 md:mb-6 border border-red-500/20 shadow-inner">
                <AlertTriangle size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-white mb-2">¿Eliminar esta cuenta?</h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
                Estás a punto de eliminar el acceso para <strong className="text-white">{agenciaAEliminar.nombre}</strong>. Esta acción es irreversible.
              </p>
              <div className="flex flex-col-reverse sm:flex-row w-full gap-3 mt-2">
                <button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={confirmarEliminacion} disabled={isDeleting} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}