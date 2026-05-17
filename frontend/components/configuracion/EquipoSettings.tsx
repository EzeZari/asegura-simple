"use client";

import { useState } from "react";
import { Users, Crown, Mail, Shield, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Toast from "@/components/ui/Toast";

export default function EquipoSettings() {
  const user = useAuthStore((state) => state.user);
  
  // Simulador del plan. El día de mañana esto vendrá del backend (ej: user.plan === 'PRO')
  const [planActual, setPlanActual] = useState<"BASICO" | "PRO">("BASICO"); 
  
  const [showToast, setShowToast] = useState(false);

  // Lista de miembros simulada (Vos siempre sos el dueño)
  const [miembros, setMiembros] = useState([
    { 
      id: 1, 
      nombre: user?.nombre || "Usuario Principal", 
      email: user?.email || "tu@email.com", 
      rol: "Dueño", 
      estado: "Activo" 
    }
  ]);

  const intentarInvitar = () => {
    if (planActual !== "PRO") {
      // Si no es PRO, no hace nada porque el botón está deshabilitado visualmente, 
      // pero por las dudas atajamos la lógica acá.
      return;
    }
    alert("Acá se abriría el modal para mandar el mail de invitación.");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-10">
      
      {/* BANNER DE UPGRADE (Solo se muestra si es Básico) */}
      {planActual === "BASICO" && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600">
              <Crown size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Tu plan actual no permite invitar a otros miembros.</h4>
              <p className="text-xs text-amber-700 mt-0.5">Mejorá a un Plan Profesional para agregar socios, productores o asistentes a tu agencia.</p>
            </div>
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap">
            Mejorar Plan
          </button>
        </div>
      )}

      {/* PANEL PRINCIPAL */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
        
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Miembros del Equipo</h3>
          </div>
          
          <button 
            onClick={intentarInvitar}
            disabled={planActual === "BASICO"}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-transparent"
          >
            {planActual === "BASICO" ? <Crown size={16} /> : <UserPlus size={16} />}
            Invitar Miembro
          </button>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 tracking-wider">
                <th className="pb-3 font-semibold">Usuario</th>
                <th className="pb-3 font-semibold">Rol / Permisos</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {miembros.map((miembro) => (
                <tr key={miembro.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {miembro.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{miembro.nombre}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {miembro.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-md text-xs font-bold">
                      <Shield size={12} /> {miembro.rol}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {miembro.estado}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {miembro.rol === "Dueño" ? (
                      <span className="text-xs text-gray-400 italic">Intocable</span>
                    ) : (
                      <button className="text-gray-400 hover:text-red-600 transition-colors p-2" title="Eliminar miembro">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INFO ADICIONAL PARA EL DÍA DE MAÑANA */}
        <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-3 mt-2">
          <AlertCircle size={18} className="text-gray-500 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-700">Sobre los roles (Próximamente)</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Los <strong>Productores</strong> solo podrán ver y gestionar las pólizas que ellos mismos hayan cargado. Los <strong>Asistentes</strong> tendrán acceso a toda la cartera para carga de datos, pero no podrán ver estadísticas financieras ni eliminar registros.
            </p>
          </div>
        </div>

      </div>
      
      <Toast message="Invitación enviada correctamente." isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}