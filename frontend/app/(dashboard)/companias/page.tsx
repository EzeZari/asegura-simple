"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash2 } from "lucide-react"; 
import NuevaCompaniaModal from "@/components/companias/NuevaCompaniaModal";
import Table, { TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal"; 
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";

// IMPORTAMOS NUESTRAS PIEZAS DE LEGO NUEVAS:
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import { ActionMenu, ActionMenuItem } from "@/components/ui/ActionMenu";

export default function CompaniasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companiaAEditar, setCompaniaAEditar] = useState<any>(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [companiaAEliminar, setCompaniaAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  // RESTAURAMOS LA LÓGICA DE BÚSQUEDA AL BACKEND
  const fetchCompanias = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/companias");
      const data = await res.json();
      setCompanias(data);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
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

  const confirmarEliminacion = (compania: any) => {
    setCompaniaAEliminar(compania);
    setMenuAbiertoId(null);
    setIsConfirmOpen(true);
  };

  // RESTAURAMOS LA LÓGICA DE ELIMINACIÓN AL BACKEND
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
      alert(error.message); 
    } finally {
      setIsDeleting(false);
      setCompaniaAEliminar(null);
    }
  };

  const companiasFiltradas = companias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { items: companiasOrdenadas, requestSort, sortConfig } = useTableSort(companiasFiltradas);

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nombre" sortKey="nombre" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="CUIT" sortKey="cuit" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="Teléfono Siniestros" sortKey="telefonoSiniestros" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: <SortableHeader label="Email Contacto" sortKey="email" currentSort={sortConfig} requestSort={requestSort} /> },
    { label: "Acciones", align: "right" },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      {/* 1. USAMOS EL ENCABEZADO LIMPIO */}
      <PageHeader 
        titulo="Compañías" 
        descripcion="Gestioná las aseguradoras con las que operás." 
        textoBoton="Nueva Compañía" 
        onNuevo={() => { setCompaniaAEditar(null); setIsModalOpen(true); }} 
      />

      {/* 2. USAMOS EL BUSCADOR LIMPIO */}
      <SearchBar valor={searchTerm} onChange={setSearchTerm} placeholder="Buscar compañía por nombre..." />

      <Table columns={columnas} isLoading={isLoading} isEmpty={companiasOrdenadas.length === 0} emptyContent={<div className="text-gray-500 py-6"><p>No hay compañías registradas</p></div>}>
        {companiasOrdenadas.map((compania) => (
          <tr key={compania.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">{compania.nombre}</td>
            <td className="px-6 py-4 text-gray-600 font-mono text-sm">{compania.cuit || "-"}</td>
            <td className="px-6 py-4 text-gray-900">{compania.telefonoSiniestros || "-"}</td>
            <td className="px-6 py-4 text-gray-600">{compania.email || "-"}</td>
            
            <td className="px-6 py-4 text-right">
              {/* 3. USAMOS EL MENÚ DE ACCIONES LIMPIO */}
              <ActionMenu isOpen={menuAbiertoId === compania.id} onToggle={() => setMenuAbiertoId(menuAbiertoId === compania.id ? null : compania.id)}>
                <ActionMenuItem icon={Edit} label="Editar" onClick={() => abrirParaEditar(compania)} />
                <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => confirmarEliminacion(compania)} />
              </ActionMenu>
            </td>
          </tr>
        ))}
      </Table>

      <NuevaCompaniaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} companiaAEditar={companiaAEditar} />
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar compañía?" message={`Esta acción eliminará a "${companiaAEliminar?.nombre}".`} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}