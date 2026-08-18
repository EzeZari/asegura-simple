"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Crown, Mail, Shield, UserPlus, Trash2, AlertCircle, Loader2, X, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/services/api";
import { ROLES, PERMISOS, tienePermiso } from "@/utils/roles"; 
import AlertModal from "@/components/ui/AlertModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast from "@/components/ui/Toast";

export default function EquipoSettings() {
  const user = useAuthStore((state: any) => state.user);
  const router = useRouter();

  const puedeGestionarEquipo = tienePermiso(user, PERMISOS.PUEDE_GESTIONAR_EQUIPO);

  const [equipo, setEquipo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: "", email: "", password: "", role: ROLES.VIEWER });
  
  const [showToast, setShowToast] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "", message: "" });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, idToDelete: null as number | null });

  const planReal = user?.plan || "GRATUITO";
  const planActual = planReal === "PROFESIONAL" || planReal === "AGENCIA" ? "PRO" : "BASICO"; 
  
  const limiteUsuarios = planReal === "GRATUITO" || planReal === "BASICO" ? 1 : planReal === "PROFESIONAL" ? 3 : "Ilimitado";
  const cantidadActual = equipo.length + 1; 
  const reachedLimit = limiteUsuarios !== "Ilimitado" && cantidadActual >= (limiteUsuarios as number);

  const isNombreValid = nuevoMiembro.nombre.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoMiembro.email);
  const isPasswordValid = nuevoMiembro.password.length >= 6;
  const isFormValid = isNombreValid && isEmailValid && isPasswordValid;

  useEffect(() => {
    if (user && !puedeGestionarEquipo) {
      router.push('/'); 
    }
  }, [user, puedeGestionarEquipo, router]);

  const fetchEquipo = async () => {
    try {
      const res = await apiFetch('/api/equipo');
      if (res.ok) {
        const data = await res.json();
        setEquipo(data);
      }
    } catch (error) {
      console.error("Error al cargar equipo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (puedeGestionarEquipo) {
      fetchEquipo();
    }
  }, [puedeGestionarEquipo]);

  if (!puedeGestionarEquipo) return null;

  const listaMiembros = [
    { 
      id: 'dueno', 
      nombre: user?.nombre || "Usuario Principal", 
      email: user?.email || "tu@email.com", 
      rolId: ROLES.DUENO,
      rolLabel: "Dueño", 
      estado: "Activo" 
    },
    ...equipo.map(m => ({
      id: m.id,
      nombre: m.nombre,
      email: m.email,
      rolId: m.role,
      rolLabel: m.role === ROLES.VIEWER ? "Vendedor" : "Administrador",
      estado: "Activo"
    }))
  ];

  const intentarInvitar = () => {
    if (planActual !== "PRO") return;
    
    if (reachedLimit) {
      setAlertConfig({
        isOpen: true,
        title: "Límite alcanzado",
        message: `Tu plan actual te permite tener hasta ${limiteUsuarios} usuarios en total. Mejorá a Plan Agencia para tener usuarios ilimitados.`
      });
      return;
    }
    
    setNuevoMiembro({ nombre: "", email: "", password: "", role: ROLES.VIEWER });
    setShowInviteModal(true);
  };

  const handleAgregarMiembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; 

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/equipo', {
        method: 'POST',
        body: JSON.stringify(nuevoMiembro)
      });
      const data = await res.json();

      if (res.ok) {
        setShowToast(true);
        setNuevoMiembro({ nombre: "", email: "", password: "", role: ROLES.VIEWER });
        setShowInviteModal(false);
        fetchEquipo();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setAlertConfig({ isOpen: true, title: "Atención", message: error.message || "Ocurrió un error al invitar al usuario." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!confirmConfig.idToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/equipo/${confirmConfig.idToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setEquipo(equipo.filter(m => m.id !== confirmConfig.idToDelete));
        setConfirmConfig({ isOpen: false, idToDelete: null });
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      setAlertConfig({ isOpen: true, title: "Error", message: error.message });
      setConfirmConfig({ isOpen: false, idToDelete: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 md:gap-6 animate-in fade-in duration-300 pb-10">
      
      {planActual === "BASICO" && (
        <div className="bg-gradient-to-r from-amber-50 dark:from-amber-900/30 to-orange-50 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800/30 p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4 transition-colors">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2.5 sm:p-3 rounded-full text-amber-600 dark:text-amber-500 shrink-0 transition-colors">
              <Crown size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 transition-colors">Tu plan actual no permite invitar a otros miembros.</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5 transition-colors">Mejorá a un Plan Profesional para agregar socios, productores o asistentes a tu agencia.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/planes?email=${user?.email}`)}
            className="w-full sm:w-auto flex justify-center bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            Mejorar Plan
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-5 md:gap-6 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-50 dark:border-gray-700 pb-4 gap-4 transition-colors">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Miembros del Equipo</h3>
            
            {planActual === "PRO" && (
               <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-full transition-colors">
                 {cantidadActual} / {limiteUsuarios}
               </span>
            )}
          </div>
          
          <button 
            onClick={intentarInvitar}
            disabled={planActual === "BASICO"}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:cursor-not-allowed text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm border border-transparent"
          >
            {planActual === "BASICO" ? <Crown size={16} /> : <UserPlus size={16} />}
            Invitar Miembro
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin text-green-600" size={24} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-400 dark:text-gray-500 tracking-wider transition-colors">
                  <th className="pb-3 font-semibold whitespace-nowrap px-1 sm:px-0">Usuario</th>
                  <th className="pb-3 font-semibold whitespace-nowrap px-1 sm:px-0">Rol / Permisos</th>
                  <th className="pb-3 font-semibold whitespace-nowrap px-1 sm:px-0">Estado</th>
                  <th className="pb-3 font-semibold text-right whitespace-nowrap px-1 sm:px-0">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaMiembros.map((miembro) => (
                  <tr key={miembro.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/50 hover:dark:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-1 sm:px-0 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          miembro.rolId === ROLES.DUENO ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-500' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500'
                        }`}>
                          {miembro.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{miembro.nombre}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 transition-colors">
                            <Mail size={12} /> {miembro.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-1 sm:px-0 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                        miembro.rolId === ROLES.DUENO ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800/30' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800/30'
                      }`}>
                        <Shield size={12} /> {miembro.rolLabel}
                      </span>
                    </td>
                    <td className="py-4 px-1 sm:px-0 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {miembro.estado}
                      </span>
                    </td>
                    <td className="py-4 px-1 sm:px-0 text-right whitespace-nowrap">
                      {miembro.rolId === ROLES.DUENO ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic font-medium transition-colors">Intocable</span>
                      ) : (
                        <button 
                          onClick={() => setConfirmConfig({ isOpen: true, idToDelete: miembro.id as number })}
                          className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30" 
                          title="Eliminar miembro"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 md:p-4 rounded-xl flex items-start gap-3 mt-2 border border-gray-100 dark:border-gray-700 transition-colors">
          <AlertCircle size={18} className="text-gray-500 dark:text-gray-400 mt-0.5 shrink-0 transition-colors" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Sobre los roles (Próximamente)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
              Los <strong>Vendedores</strong> solo podrán ver y gestionar las pólizas que ellos mismos hayan cargado. Los <strong>Administradores</strong> tendrán acceso a toda la cartera para carga de datos, pero no podrán ver estadísticas financieras ni eliminar registros.
            </p>
          </div>
        </div>
      </div>
      
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 transition-colors">
          <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 transition-colors">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-xl transition-colors">
                  <UserPlus size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Invitar Miembro</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAgregarMiembro} className="space-y-4 pt-2">
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 transition-colors">Nombre y Apellido</label>
                <input 
                  type="text" required
                  value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({...nuevoMiembro, nombre: e.target.value})}
                  className={`w-full text-sm border rounded-xl px-4 py-2.5 outline-none transition-colors dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    nuevoMiembro.nombre.length > 0 && !isNombreValid 
                      ? "border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20" 
                      : "border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 dark:bg-gray-700/50 focus:bg-white focus:dark:bg-gray-800"
                  }`} 
                  placeholder="Ej: Juan Pérez"
                />
                {nuevoMiembro.nombre.length > 0 && !isNombreValid && (
                  <span className="text-[10px] text-red-500 mt-1 block font-medium">Debe tener al menos 3 caracteres.</span>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 transition-colors">Correo Electrónico</label>
                <div className="relative">
                  <input 
                    type="email" required
                    value={nuevoMiembro.email} onChange={(e) => setNuevoMiembro({...nuevoMiembro, email: e.target.value})}
                    className={`w-full text-sm border rounded-xl px-4 py-2.5 outline-none transition-colors dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                      nuevoMiembro.email.length > 0 && !isEmailValid 
                        ? "border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20" 
                        : isEmailValid 
                        ? "border-green-300 dark:border-green-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 dark:bg-gray-700/50 focus:bg-white focus:dark:bg-gray-800"
                    }`} 
                    placeholder="juan@agencia.com"
                  />
                  {isEmailValid && <CheckCircle2 size={16} className="absolute right-3 top-3 text-green-500" />}
                </div>
                {nuevoMiembro.email.length > 0 && !isEmailValid && (
                  <span className="text-[10px] text-red-500 mt-1 block font-medium">Ingresá un correo electrónico válido.</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 transition-colors">Contraseña Temporal</label>
                <input 
                  type="password" required minLength={6}
                  value={nuevoMiembro.password} onChange={(e) => setNuevoMiembro({...nuevoMiembro, password: e.target.value})}
                  className={`w-full text-sm border rounded-xl px-4 py-2.5 outline-none transition-colors dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    nuevoMiembro.password.length > 0 && !isPasswordValid 
                      ? "border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20" 
                      : "border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 dark:bg-gray-700/50 focus:bg-white focus:dark:bg-gray-800"
                  }`} 
                  placeholder="Mínimo 6 caracteres"
                />
                {nuevoMiembro.password.length > 0 && !isPasswordValid && (
                  <span className="text-[10px] text-red-500 mt-1 block font-medium">La contraseña es muy corta.</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 transition-colors">Rol en el Sistema</label>
                <select 
                  value={nuevoMiembro.role} onChange={(e) => setNuevoMiembro({...nuevoMiembro, role: e.target.value})}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 dark:bg-gray-700/50 focus:bg-white focus:dark:bg-gray-800 dark:text-white transition-colors cursor-pointer"
                >
                  <option value={ROLES.VIEWER} className="dark:bg-gray-800">Vendedor (Solo lectura)</option>
                  <option value={ROLES.PRODUCTOR} className="dark:bg-gray-800">Administrador Secundario</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 transition-colors">
                <button 
                  type="button" onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={isSubmitting || !isFormValid}
                  className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:shadow-none min-w-[140px]"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Invitar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, idToDelete: null })}
        onConfirm={confirmarEliminacion}
        title="Eliminar miembro"
        message="¿Estás seguro de que querés eliminar a este usuario? Perderá el acceso inmediatamente al sistema y todos sus datos cargados quedarán en tu agencia."
        confirmText="Sí, eliminar"
        isLoading={isSubmitting}
      />

      <Toast message="Invitación enviada correctamente." isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}