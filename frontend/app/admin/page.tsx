"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, CreditCard, Crown, Star, Zap } from "lucide-react";
import Toast from "@/components/ui/Toast";
import AdminHeader from "@/components/admin/AdminHeader";
import FiltrosAgencias from "@/components/admin/FiltrosAgencias";
import TablaAgencias from "@/components/admin/TablaAgencias";
import EstadisticasMRR from "@/components/admin/EstadisticasMRR";
import GestorComunicados from "@/components/admin/GestorComunicados";
import ModalEditarSuscripcion from "@/components/admin/ModalEditarSuscripcion";
import ModalCambiarPlan from "@/components/admin/ModalCambiarPlan";
import ModalEliminarCuenta from "@/components/admin/ModalEliminarCuenta";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const router = useRouter();
  
  // ESTADOS PRINCIPALES
  const [loading, setLoading] = useState(true);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAgenciasActivas: 0, usuariosPagos: 0, usuariosTrial: 0, mrr: 0 });
  const [comunicado, setComunicado] = useState({ 
    mensajeBanner: "", activoBanner: false, tipoBanner: "blue",
    mensajeModal: "", activoModal: false, tipoModal: "blue"
  });
  
  // ESTADOS DE FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("TODOS");

  // ESTADOS DE MODALES Y ACCIONES
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubModalOpen, setEditSubModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<any>(null);
  const [agenciaAEliminar, setAgenciaAEliminar] = useState<any>(null);
  
  const [planSeleccionado, setPlanSeleccionado] = useState<string>("GRATUITO");
  const [subData, setSubData] = useState({ estado: "pendiente", fechaVencimiento: "" });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingSub, setIsUpdatingSub] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingComunicado, setIsSavingComunicado] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const planesOptions = [
    { id: "GRATUITO", nombre: "Gratuito", icon: <CreditCard size={20} />, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
    { id: "BASICO", nombre: "Básico", icon: <Zap size={20} />, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
    { id: "PROFESIONAL", nombre: "Profesional", icon: <Star size={20} />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { id: "AGENCIA", nombre: "Agencia Elite", icon: <Crown size={20} />, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" }
  ];

  // FETCH INICIAL
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const [resAgencias, resComunicado, resStats] = await Promise.all([
        fetch(`${API_URL}/api/admin/agencias`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/comunicado`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/estadisticas`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!resAgencias.ok) throw new Error("Error al obtener cuentas");
      setAgencias(await resAgencias.json());

      if (resStats.ok) setStats(await resStats.json());

      if (resComunicado.ok) {
        const data = await resComunicado.json();
        if (data) setComunicado({
          mensajeBanner: data.mensajeBanner || "", activoBanner: data.activoBanner || false, tipoBanner: data.tipoBanner || "blue",
          mensajeModal: data.mensajeModal || "", activoModal: data.activoModal || false, tipoModal: data.tipoModal || "blue"
        });
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem("asegurasimple_admin_token");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("asegurasimple_admin_token")) {
      router.push("/admin/login");
    } else {
      fetchData();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("asegurasimple_admin_token");
    router.push("/admin/login");
  };

  // FUNCIONES DE API
  const guardarComunicado = async () => {
    setIsSavingComunicado(true);
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/comunicado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(comunicado)
      });
      if (!res.ok) throw new Error("Error al guardar comunicado");
      setToast({ show: true, msg: "¡Anuncios globales actualizados!" });
    } catch (error) {
      setToast({ show: true, msg: "Error al actualizar los anuncios." });
    } finally {
      setIsSavingComunicado(false);
    }
  };

  const handleImpersonate = async (agencia: any) => {
    try {
      setToast({ show: true, msg: `Generando acceso seguro para ${agencia.nombre}...` });
      const adminToken = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/agencias/${agencia.id}/impersonate`, { method: "POST", headers: { "Authorization": `Bearer ${adminToken}` } });
      if (!res.ok) throw new Error("Error al intentar acceder a la cuenta");

      const data = await res.json();
      document.cookie = `next_auth_token=${data.token}; path=/; max-age=7200; SameSite=Lax`;
      
      localStorage.setItem("auth-storage", JSON.stringify({
        state: { user: data.usuario, accessToken: data.token, showUpgradeModal: false, upgradeMessage: "", sessionExpired: false },
        version: 0
      }));
      
      setToast({ show: true, msg: "¡Acceso concedido! Abriendo panel..." });
      setTimeout(() => window.open("/inicio", "_blank"), 1000);
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al generar la sesión." });
    }
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
      await fetchData();
      setToast({ show: true, msg: "Plan actualizado con éxito" });
      setModalOpen(false);
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al actualizar el plan" });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmarEdicionSuscripcion = async () => {
    if (!agenciaSeleccionada) return;
    setIsUpdatingSub(true);
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/agencias/${agenciaSeleccionada.id}/suscripcion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(subData)
      });
      if (!res.ok) throw new Error("Error al actualizar la suscripción");
      await fetchData(); 
      setToast({ show: true, msg: "Suscripción actualizada correctamente" });
      setEditSubModalOpen(false);
    } catch (error) {
      setToast({ show: true, msg: "Hubo un error al actualizar la suscripción" });
    } finally {
      setIsUpdatingSub(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!agenciaAEliminar) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${API_URL}/api/admin/agencias/${agenciaAEliminar.id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).error || "Error al eliminar la cuenta");
      await fetchData();
      setToast({ show: true, msg: "Cuenta eliminada permanentemente del sistema" });
      setDeleteModalOpen(false);
    } catch (error: any) {
      setToast({ show: true, msg: error.message || "Error al eliminar la cuenta" });
    } finally {
      setIsDeleting(false);
    }
  };

  const agenciasFiltradas = agencias.filter((agencia) => {
    const matchSearch = agencia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || agencia.email?.toLowerCase().includes(searchTerm.toLowerCase()) || agencia.id.toString() === searchTerm;
    const matchPlan = filtroPlan === "TODOS" || (agencia.plan || "GRATUITO") === filtroPlan;
    return matchSearch && matchPlan;
  });

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

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col gap-10">
        <EstadisticasMRR stats={stats} />
        
        <GestorComunicados 
          comunicado={comunicado} 
          setComunicado={setComunicado} 
          onGuardar={guardarComunicado} 
          isSaving={isSavingComunicado} 
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Users className="text-gray-500 w-5 h-5 md:w-6 md:h-6" /> Cuentas Registradas
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

          <FiltrosAgencias searchTerm={searchTerm} setSearchTerm={setSearchTerm} filtroPlan={filtroPlan} setFiltroPlan={setFiltroPlan} />

          <TablaAgencias 
            agenciasFiltradas={agenciasFiltradas} 
            planesOptions={planesOptions}
            onImpersonate={handleImpersonate}
            onModificarPlan={(a) => { setAgenciaSeleccionada(a); setPlanSeleccionado(a.plan || "GRATUITO"); setModalOpen(true); }}
            onEditarSuscripcion={(a) => {
              setAgenciaSeleccionada(a);
              setSubData({ estado: a.suscripcion?.estado || "pendiente", fechaVencimiento: a.suscripcion?.fechaVencimiento ? new Date(a.suscripcion.fechaVencimiento).toISOString().split('T')[0] : "" });
              setEditSubModalOpen(true);
            }}
            onEliminarCuenta={(a) => { setAgenciaAEliminar(a); setDeleteModalOpen(true); }}
          />
        </div>
      </main>

      <ModalEditarSuscripcion 
        isOpen={editSubModalOpen} onClose={() => setEditSubModalOpen(false)} 
        agencia={agenciaSeleccionada} subData={subData} setSubData={setSubData} 
        onConfirm={confirmarEdicionSuscripcion} isUpdating={isUpdatingSub} 
      />

      <ModalCambiarPlan 
        isOpen={modalOpen} onClose={() => setModalOpen(false)} 
        agencia={agenciaSeleccionada} planesOptions={planesOptions} 
        planSeleccionado={planSeleccionado} setPlanSeleccionado={setPlanSeleccionado} 
        onConfirm={confirmarCambioPlan} isUpdating={isUpdating} 
      />

      <ModalEliminarCuenta 
        isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} 
        agencia={agenciaAEliminar} onConfirm={confirmarEliminacion} isDeleting={isDeleting} 
      />

      <Toast message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}