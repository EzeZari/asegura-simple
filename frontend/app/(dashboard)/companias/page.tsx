"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Download, UploadCloud } from "lucide-react"; 
import NuevaCompaniaModal from "@/components/companias/NuevaCompaniaModal";
import ImportarCompaniasModal from "@/components/companias/ImportarCompaniasModal"; 
import ExportarExcelModal from "@/components/ui/ExportarExcelModal"; 
import Table, { TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal"; 
import { useTableSort } from "@/hooks/useTableSort";
import SortableHeader from "@/components/ui/SortableHeader";
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import { ActionMenu, ActionMenuItem } from "@/components/ui/ActionMenu";
import SelectOrdenamiento from "@/components/ui/SelectOrdenamiento"; 
import { apiFetch } from "@/services/api"; // ← NUEVO

const OPCIONES_ORDEN = [
  { value: "mas_recientes", label: "Últimas agregadas" },
  { value: "alfabetico", label: "A-Z (Nombre)" },
  { value: "alfabetico_inverso", label: "Z-A (Nombre)" },
];

export default function CompaniasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ordenActual, setOrdenActual] = useState("mas_recientes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); 
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); 
  const [companiaAEditar, setCompaniaAEditar] = useState<any>(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [companiaAEliminar, setCompaniaAEliminar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");

  const fetchCompanias = async () => {
    try {
      const res = await apiFetch('/api/companias'); // ← CAMBIO
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

  const confirmarEliminacion = (compania: any) => {
    setCompaniaAEliminar(compania);
    setMenuAbiertoId(null);
    setIsConfirmOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!companiaAEliminar) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/companias/${companiaAEliminar.id}`, { method: 'DELETE' }); // ← CAMBIO
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setMensajeToast("Compañía eliminada correctamente");
      setShowToast(true);
      fetchCompanias();
      setIsConfirmOpen(false);
    } catch (error: any) { alert(error.message); } finally { setIsDeleting(false); setCompaniaAEliminar(null); }
  };

  let companiasFiltradas = companias.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  companiasFiltradas = companiasFiltradas.sort((a, b) => {
    switch (ordenActual) {
      case "mas_recientes": return b.id - a.id;
      case "alfabetico": return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
      case "alfabetico_inverso": return b.nombre.toLowerCase().localeCompare(a.nombre.toLowerCase());
      default: return 0;
    }
  });

  const { items: companiasOrdenadas, requestSort, sortConfig } = useTableSort(companiasFiltradas);

  const prepararDatosParaExcel = () => {
    return companiasOrdenadas.map((c) => ({
      "Nombre de la Compañía": c.nombre,
      "CUIT": c.cuit || "-",
      "Teléfono (Siniestros)": c.telefonoSiniestros || "-",
      "Email de Contacto": c.email || "-",
      "Cantidad de Pólizas": c._count?.polizas || 0,
    }));
  };

  const columnas: TableColumn[] = [
    { label: <SortableHeader label="Nombre" sortKey="nombre" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: <SortableHeader label="CUIT" sortKey="cuit" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: <SortableHeader label="Teléfono Siniestros" sortKey="telefonoSiniestros" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: <SortableHeader label="Email Contacto" sortKey="email" currentSort={sortConfig} requestSort={(key) => requestSort(key as any)} /> },
    { label: "Acciones", align: "right" },
  ];

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      <PageHeader 
        titulo="Compañías" 
        descripcion="Gestioná las aseguradoras con las que operás." 
        textoBoton="Nueva Compañía" 
        onNuevo={() => { setCompaniaAEditar(null); setIsModalOpen(true); }} 
      />

      <div className="w-full">
        <SearchBar valor={searchTerm} onChange={setSearchTerm} placeholder="Buscar compañía por nombre..." />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full -mb-4">
        <div className="w-full md:w-auto">
          <SelectOrdenamiento opciones={OPCIONES_ORDEN} valorActual={ordenActual} onChange={setOrdenActual} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            <UploadCloud size={16} /> Importar Excel
          </button>
          <button onClick={() => { if(companiasOrdenadas.length === 0) return alert("No hay datos para exportar."); setIsExportModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            <Download size={16} /> Exportar a Excel
          </button>
        </div>
      </div>

      <Table columns={columnas} isLoading={isLoading} isEmpty={companiasOrdenadas.length === 0} emptyContent={<div className="text-gray-500 py-6"><p>No hay compañías registradas</p></div>}>
        {companiasOrdenadas.map((compania) => (
          <tr key={compania.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">{compania.nombre}</td>
            <td className="px-6 py-4 text-gray-600 font-mono text-sm">{compania.cuit || "-"}</td>
            <td className="px-6 py-4 text-gray-900">{compania.telefonoSiniestros || "-"}</td>
            <td className="px-6 py-4 text-gray-600">{compania.email || "-"}</td>
            <td className="px-6 py-4 text-right">
              <ActionMenu isOpen={menuAbiertoId === compania.id} onToggle={() => setMenuAbiertoId(menuAbiertoId === compania.id ? null : compania.id)}>
                <ActionMenuItem icon={Edit} label="Editar" onClick={() => { setCompaniaAEditar(compania); setMenuAbiertoId(null); setIsModalOpen(true); }} />
                <ActionMenuItem icon={Trash2} label="Eliminar" color="red" onClick={() => confirmarEliminacion(compania)} />
              </ActionMenu>
            </td>
          </tr>
        ))}
      </Table>

      <NuevaCompaniaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} companiaAEditar={companiaAEditar} />
      <ImportarCompaniasModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={(mensaje) => { setIsImportModalOpen(false); fetchCompanias(); setMensajeToast(mensaje); setShowToast(true); }} />
      <ExportarExcelModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} datos={prepararDatosParaExcel()} nombreArchivo={`Reporte_Companias_${new Date().toISOString().split("T")[0]}`} />
      <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={ejecutarEliminacion} isLoading={isDeleting} title="¿Eliminar compañía?" message={`Esta acción eliminará a "${companiaAEliminar?.nombre}".`} />
      <Toast message={mensajeToast} isVisible={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}