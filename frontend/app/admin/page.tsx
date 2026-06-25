"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Users, Mail, Phone, CreditCard, Crown, Star, X, Check, Loader2 } from "lucide-react";
import Toast from "@/components/ui/Toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Cambio de Plan
  const [modalOpen, setModalOpen] = useState(false);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<any>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<string>("GRATUITO");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Estado para notificaciones (corregido para TypeScript)
  const [toast, setToast] = useState({ show: false, msg: "" });

  const fetchAgencias = async () => {
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch("http://localhost:3001/api/admin/agencias", {
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

  const abrirModalPlan = (agencia: any) => {
    setAgenciaSeleccionada(agencia);
    setPlanSeleccionado(agencia.plan || "GRATUITO");
    setModalOpen(true);
  };

  const confirmarCambioPlan = async () => {
    if (!agenciaSeleccionada) return;
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`http://localhost:3001/api/admin/agencias/${agenciaSeleccionada.id}/plan`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ nuevoPlan: planSeleccionado })
      });

      if (!res.ok) throw new Error("Error al actualizar el plan");

      // Actualizamos la tabla localmente para no hacer otra recarga completa
      setAgencias(prev => prev.map(a => a.id === agenciaSeleccionada.id ? { ...a, plan: planSeleccionado } : a));
      
      setToast({ show: true, msg: "Plan actualizado con éxito" });
      setModalOpen(false);
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al actualizar el plan" });
    } finally {
      setIsUpdating(false);
    }
  };

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

  // --- COMPONENTES VISUALES PARA LOS PLANES ---
  const planesOptions = [
    { id: "GRATUITO", nombre: "Gratuito", icon: <CreditCard size={20} />, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
    { id: "PROFESIONAL", nombre: "Profesional", icon: <Star size={20} />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { id: "AGENCIA", nombre: "Agencia Elite", icon: <Crown size={20} />, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-green-500/30 font-sans relative">
      {/* HEADER */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-2.5 rounded-xl border border-green-500/20 text-green-500 shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Backoffice</h1>
              <p className="text-xs text-green-500 font-bold tracking-wider uppercase">Nivel: Super Administrador</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-400 bg-gray-800/50 hover:bg-red-500/10 px-4 py-2.5 rounded-xl transition-all border border-transparent hover:border-red-500/20">
            <LogOut size={16} /> Salir del Panel
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="text-gray-500" /> Cuentas Registradas</h2>
            <p className="text-gray-400 mt-1">Radiografía completa de usuarios, roles y suscripciones del sistema.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <span className="text-sm font-medium text-gray-400">Total Usuarios:</span>
            <span className="text-lg font-black text-green-500">{agencias.length}</span>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-bold border-b border-gray-800">ID</th>
                  <th className="p-5 font-bold border-b border-gray-800">Usuario y Jerarquía</th>
                  <th className="p-5 font-bold border-b border-gray-800">Contacto</th>
                  <th className="p-5 font-bold border-b border-gray-800">Plan Actual</th>
                  <th className="p-5 font-bold border-b border-gray-800 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {agencias.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500 font-medium">No hay cuentas registradas.</td>
                  </tr>
                ) : (
                  agencias.map((agencia) => {
                    const planInfo = planesOptions.find(p => p.id === (agencia.plan || "GRATUITO"));
                    
                    // Función inteligente para darle color según el Rol
                    const renderRolBadge = (usuario: any) => {
                      let rol = (usuario.rol || usuario.role || "").toUpperCase();

                      // Si está vacío y no tiene jefe, es el Dueño por defecto
                      if (!rol && !usuario.jefeId) {
                        rol = "ADMIN";
                      } else if (!rol) {
                        rol = "SIN ROL";
                      }

                      // Dueño: Verde de la marca
                      if (rol.includes('ADMIN') || rol.includes('DUEÑO')) {
                        return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-500/20">Dueño / Admin</span>;
                      }
                      // Productor: Esmeralda para diferenciarlo sutilmente
                      if (rol.includes('PRODUCTOR')) {
                        return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Productor</span>;
                      }
                      // Lector: Gris
                      if (rol.includes('LECTOR')) {
                        return <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">Lector</span>;
                      }
                      
                      return <span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">{rol}</span>;
                    };

                    return (
                      <tr key={agencia.id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="p-5 text-sm text-gray-500 font-mono">#{agencia.id}</td>
                        <td className="p-5">
                          <div className="font-bold text-white flex items-center gap-2 mb-1.5">
                            {agencia.nombre}
                            {agencia.isVerified && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Email Confirmado"></span>}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-1">
                            {renderRolBadge(agencia)}
                          </div>

                          {/* Si tiene jefe, mostramos a qué cuenta pertenece */}
                          {agencia.jefe && (
                            <div className="text-[11px] text-gray-400 mt-1 bg-gray-800/50 inline-block px-2 py-1 rounded-md">
                              Equipo de: <span className="font-bold text-gray-300">{agencia.jefe.nombre}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1.5">
                            <span className="flex items-center gap-2 text-sm text-gray-300"><Mail size={14} className="text-gray-500"/> {agencia.email}</span>
                            {agencia.telefono && <span className="flex items-center gap-2 text-xs text-gray-500"><Phone size={12}/> {agencia.telefono}</span>}
                          </div>
                        </td>
                        <td className="p-5">
                          {/* Si es empleado, el plan lo hereda del dueño */}
                          {agencia.jefeId ? (
                             <span className="text-xs font-medium text-gray-500 italic">Heredado del Dueño</span>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 ${planInfo?.bg} ${planInfo?.color} border ${planInfo?.border} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                              {planInfo?.icon} {planInfo?.nombre}
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          {/* Ocultamos el botón de cambiar plan si es un empleado */}
                          {agencia.jefeId ? (
                            <span className="text-xs font-bold text-gray-600">No aplica</span>
                          ) : (
                            <button 
                              onClick={() => abrirModalPlan(agencia)}
                              className="text-sm font-bold text-green-500 hover:text-green-400 transition-colors px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl"
                            >
                              Modificar Plan
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🔥 MODAL PROFESIONAL DE CAMBIO DE PLAN */}
      {modalOpen && agenciaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-lg font-bold text-white">Gestionar Suscripción</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-400">Seleccioná el nuevo nivel de acceso para:</p>
                <p className="text-lg font-black text-white mt-1">{agenciaSeleccionada.nombre}</p>
                <p className="text-xs text-gray-500">{agenciaSeleccionada.email}</p>
              </div>

              {/* Radio Cards */}
              <div className="flex flex-col gap-3">
                {planesOptions.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setPlanSeleccionado(plan.id)}
                    className={`relative w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                      planSeleccionado === plan.id 
                        ? "bg-gray-800 border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.15)]" 
                        : "bg-gray-950 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${plan.bg} ${plan.color} p-3 rounded-xl border ${plan.border}`}>
                        {plan.icon}
                      </div>
                      <div>
                        <span className="block font-bold text-white text-base">{plan.nombre}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">Nivel de acceso al sistema</span>
                      </div>
                    </div>
                    {planSeleccionado === plan.id && (
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-950/50 flex justify-end gap-3">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarCambioPlan}
                disabled={isUpdating}
                className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Aplicar Nuevo Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPONENTE TOAST CORREGIDO */}
      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}