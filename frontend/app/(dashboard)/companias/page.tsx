"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, Building } from "lucide-react";
import NuevaCompaniaModal from "@/components/companias/NuevaCompaniaModal";
import Table, { TableColumn } from "@/components/ui/Table";
import Toast from "@/components/ui/Toast";

export default function CompaniasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companiaAEditar, setCompaniaAEditar] = useState<any>(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState<number | null>(null);
  
  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const fetchCompanias = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/companias");
      const data = await res.json();
      setCompanias(data);
    } catch (error) {
      console.error("Error al cargar compañías:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCompanias(); }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setCompaniaAEditar(null);
    fetchCompanias();
    setShowToast(true);
  };

  const abrirParaEditar = (compania: any) => {
    setCompaniaAEditar(compania);
    setMenuAbiertoId(null);
    setIsModalOpen(true);
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

  const estadoVacio = (
    <div className="flex flex-col items-center justify-center text-gray-500">
      <Building size={32} className="text-gray-300 mb-3" />
      <p className="font-medium text-gray-900">No hay compañías registradas</p>
      <p className="text-sm mt-1">Hacé clic en "Nueva Compañía" para empezar.</p>
    </div>
  );

  return (
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Compañías</h1>
          <p className="text-gray-500 mt-1">Gestioná las aseguradoras con las que operás.</p>
        </div>
        <button 
          onClick={() => { setCompaniaAEditar(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} /> Nueva Compañía
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
          />
        </div>
      </div>

      <Table 
        columns={columnas} 
        isLoading={isLoading} 
        isEmpty={companiasFiltradas.length === 0} 
        emptyContent={estadoVacio}
      >
        {companiasFiltradas.map((compania) => (
          <tr key={compania.id} className="hover:bg-gray-50/50 transition-colors group">
            <td className="px-6 py-4 font-medium text-gray-900">{compania.nombre}</td>
            <td className="px-6 py-4 text-gray-600 font-mono text-sm">{compania.cuit || "-"}</td>
            <td className="px-6 py-4 text-gray-900">{compania.telefonoSiniestros || "-"}</td>
            <td className="px-6 py-4 text-gray-600">{compania.email || "-"}</td>
            <td className="px-6 py-4 text-right relative">
              <button 
                onClick={() => setMenuAbiertoId(menuAbiertoId === compania.id ? null : compania.id)}
                className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg"
              >
                <MoreHorizontal size={20} />
              </button>
              {menuAbiertoId === compania.id && (
                <div className="absolute right-8 top-10 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden py-1">
                  <button onClick={() => abrirParaEditar(compania)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Editar</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <NuevaCompaniaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} companiaAEditar={companiaAEditar} />
      <Toast message="Compañía guardada con éxito" isVisible={showToast} onClose={() => setShowToast(false)} />
      
    </div>
  );
}