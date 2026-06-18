"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Trash2, Shield, Loader2, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import AlertModal from "@/components/ui/AlertModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function EquipoSettings() {
  const user = useAuthStore((state: any) => state.user);
  
  const [equipo, setEquipo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para agregar un nuevo miembro
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: "", email: "", password: "", role: "VIEWER" });

  // Estados de Modales
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: "", message: "" });
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, idToDelete: null as number | null });

  // Calcular límites
  const plan = user?.plan || "GRATUITO";
  const limiteUsuarios = plan === "GRATUITO" || plan === "BASICO" ? 1 : plan === "PROFESIONAL" ? 3 : "Ilimitado";
  const cantidadActual = equipo.length + 1; // El dueño + los empleados
  const reachedLimit = limiteUsuarios !== "Ilimitado" && cantidadActual >= (limiteUsuarios as number);

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
    fetchEquipo();
  }, []);

  const handleAgregarMiembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reachedLimit) {
      setAlertConfig({
        isOpen: true,
        title: "Límite alcanzado",
        message: "Llegaste al límite de usuarios de tu plan actual. Por favor, mejorá tu plan para sumar más miembros al equipo."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/equipo', {
        method: 'POST',
        body: JSON.stringify(nuevoMiembro)
      });
      const data = await res.json();

      if (res.ok) {
        setAlertConfig({ isOpen: true, title: "¡Éxito!", message: "El usuario fue agregado correctamente a tu equipo." });
        setNuevoMiembro({ nombre: "", email: "", password: "", role: "VIEWER" });
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
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Gestión de Equipo</h2>
        <p className="text-sm text-gray-500 mt-1">Administrá los accesos de tus vendedores y empleados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Formulario y Estado del Plan */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">Usuarios en tu plan</span>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md uppercase tracking-wider">
                {plan}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-3xl font-black text-gray-900">{cantidadActual}</span>
              <span className="text-gray-500 font-medium">/ {limiteUsuarios}</span>
            </div>
            {reachedLimit && (
              <div className="mt-3 flex items-start gap-2 text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                Límite alcanzado. Actualizá tu plan para sumar más equipo.
              </div>
            )}
          </div>

          <form onSubmit={handleAgregarMiembro} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="text-green-600" size={20} />
              <h3 className="font-bold text-gray-900">Agregar Miembro</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre y Apellido</label>
                <input 
                  type="text" required
                  value={nuevoMiembro.nombre} onChange={(e) => setNuevoMiembro({...nuevoMiembro, nombre: e.target.value})}
                  className="w-full text-sm border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500" 
                  placeholder="Ej: Juan Pérez"
                  disabled={reachedLimit || isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico</label>
                <input 
                  type="email" required
                  value={nuevoMiembro.email} onChange={(e) => setNuevoMiembro({...nuevoMiembro, email: e.target.value})}
                  className="w-full text-sm border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500" 
                  placeholder="juan@agencia.com"
                  disabled={reachedLimit || isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contraseña Temporal</label>
                <input 
                  type="password" required
                  value={nuevoMiembro.password} onChange={(e) => setNuevoMiembro({...nuevoMiembro, password: e.target.value})}
                  className="w-full text-sm border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500" 
                  placeholder="Mínimo 6 caracteres"
                  disabled={reachedLimit || isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rol en el Sistema</label>
                <select 
                  value={nuevoMiembro.role} onChange={(e) => setNuevoMiembro({...nuevoMiembro, role: e.target.value})}
                  className="w-full text-sm border-gray-200 rounded-xl focus:ring-green-500 focus:border-green-500"
                  disabled={reachedLimit || isSubmitting}
                >
                  <option value="VIEWER">Vendedor (Solo lectura)</option>
                  <option value="PRODUCTOR">Administrador Secundario</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={reachedLimit || isSubmitting}
                className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Crear Usuario"}
              </button>
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: Tabla del Equipo */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Users className="text-gray-500" size={20} />
              <h3 className="font-bold text-gray-900">Miembros Actuales</h3>
            </div>

            <div className="p-0 overflow-x-auto">
              {isLoading ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-green-600" /></div>
              ) : equipo.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Aún no tenés otros miembros en tu equipo. <br/>Añadí vendedores usando el formulario.
                </div>
              ) : (
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Nombre</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Rol</th>
                      <th className="px-6 py-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipo.map((miembro) => (
                      <tr key={miembro.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">{miembro.nombre}</td>
                        <td className="px-6 py-4 text-gray-600">{miembro.email}</td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-md w-fit">
                            <Shield size={12} />
                            {miembro.role === "VIEWER" ? "Vendedor" : "Administrador"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setConfirmConfig({ isOpen: true, idToDelete: miembro.id })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>

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
        title="Eliminar miembro del equipo"
        message="¿Estás seguro de que querés eliminar a este usuario? Perderá el acceso inmediatamente al sistema."
        confirmText="Eliminar usuario"
        isLoading={isSubmitting}
      />
    </div>
  );
}