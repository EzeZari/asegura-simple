"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Building, Trash2, Edit } from "lucide-react"; // Sumamos Trash2 y Edit
import NuevaCompaniaModal from "@/components/companias/NuevaCompaniaModal";
import Table, { TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal"; // Importamos el modal de confirmación

export default function CompaniasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companiaAEditar, setCompaniaAEditar] = useState<any>(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  
  // Estados para eliminación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [companiaAEliminar, setCompaniaAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const fetchCompanias = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/companias");
      const data = await res.json();
      setCompanias(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCompanias(); }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setCompaniaAEditar(null);
    fetchCompanias();
    setMensajeToast("Operación realizada con éxito");
    setShowToast(true);
  };

  const abrirParaEditar = (compania: any) => {
    setCompaniaAEditar(compania);
    setMenuAbiertoId(null);
    setIsModalOpen(true);
  };

  // NUEVO: Función para confirmar eliminación
  const confirmarEliminacion = (compania: any) => {
    setCompaniaAEliminar(compania);
    setMenuAbiertoId(null);
    setIsConfirmOpen(true);
  };

  // NUEVO: Función que ejecuta la eliminación real
  const ejecutarEliminacion = async () => {
    if (!companiaAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:3001/api/companias/${companiaAEliminar.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      setMensajeToast("Compañía eliminada correctamente");
      setShowToast(true);
      fetchCompanias();
      setIsConfirmOpen(false);
    } catch (error: any) {
      alert(error.message); // Avisamos si tiene pólizas asociadas
    } finally {
      setIsDeleting(false);
      setCompaniaAEliminar(null);
    }
  };

  const companiasFiltradas = companias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnas: TableColumn[] = [
    { label: "Nombre" },
    { label: "CUIT" },
    { label: "Teléfono Siniestros" },
    { label: "Email Contacto" },
    { label: "Acciones", align: "right" },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Compañías</h1>
          <p className="text-gray-500 mt-1">Gestioná las aseguradoras con las que operás.</p>
        </div>
        <button 
          onClick={() => { setCompaniaAEditar(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus size={20} /> Nueva Compañía
        </button>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-600 transition-all"
        />
      </div>

      <Table 
        columns={columnas} 
        isLoading={isLoading} 
        isEmpty={companiasFiltradas.length === 0} 
        emptyContent={<div className="text-gray-500">No hay compañías registradas</div>}
      >
        {companiasFiltradas.map((compania) => (
          <tr key={compania.id} className="hover:bg-gray-50 transition-colors group border-b border-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">{compania.nombre}</td>
            <td className="px-6 py-4 text-gray-600 font-mono text-sm">{compania.cuit || "-"}</td>
            <td className="px-6 py-4 text-gray-900">{compania.telefonoSiniestros || "-"}</td>
            <td className="px-6 py-4 text-gray-600">{compania.email || "-"}</td>
            <td className="px-6 py-4 text-right relative">
              <button 
                onClick={() => setMenuAbiertoId(menuAbiertoId === compania.id ? null : compania.id)}
                className="text-gray-400 hover:text-green-600 p-2 rounded-lg"
              >
                <MoreHorizontal size={20} />
              </button>
              
              {menuAbiertoId === compania.id && (
                <div className="absolute right-8 top-10 mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                  <button 
                    onClick={() => abrirParaEditar(compania)} 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => confirmarEliminacion(compania)} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <NuevaCompaniaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} companiaAEditar={companiaAEditar} />
      
      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={ejecutarEliminacion}
        isLoading={isDeleting}
        title="¿Eliminar compañía?"
        message={`Esta acción eliminará a "${companiaAEliminar?.nombre}" de forma permanente. No se puede deshacer.`}
      />

      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}