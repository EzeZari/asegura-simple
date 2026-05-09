"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal, Shield, Building2, User } from "lucide-react";
// Importamos el nuevo componente del Modal
import NuevoAseguradoModal from "@/components/asegurados/NuevoAseguradoModal";

// MOCK DATA actualizado con Fecha de Inicio
const MOCK_ASEGURADOS = [
  { id: "1", nombre: "Marcelo Gallardo", dni: "20.123.456", email: "muneco@email.com", telefono: "341 123-4567", polizas: 3, estado: "Activo", fechaInicio: "15/01/2024", tipo: "Individuo" },
  { id: "2", nombre: "River Plate S.A.", dni: "30-12345678-9", email: "admin@riverplate.com", telefono: "011 4123-4567", polizas: 12, estado: "Activo", fechaInicio: "02/03/2023", tipo: "Empresa" },
  { id: "3", nombre: "Leonardo Ponzio", dni: "25.987.654", email: "capitan@email.com", telefono: "341 345-6789", polizas: 0, estado: "Inactivo", fechaInicio: "10/04/2024", tipo: "Individuo" },
  { id: "4", nombre: "Logística Ortega SRL", dni: "30-98765432-1", email: "flota@ortegasrl.com", telefono: "341 456-7890", polizas: 5, estado: "Activo", fechaInicio: "20/04/2023", tipo: "Empresa" },
  { id: "5", nombre: "Enzo Francescoli", dni: "14.567.890", email: "principe@email.com", telefono: "341 567-8901", polizas: 2, estado: "Activo", fechaInicio: "05/05/2022", tipo: "Individuo" },
];

export default function AseguradosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const aseguradosFiltrados = MOCK_ASEGURADOS.filter((cliente) => {
    const busqueda = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(busqueda) || 
      cliente.dni.includes(busqueda)
    );
  });

  return (
    // FORZAMOS W-FULL: Eliminamos cualquier limitación de ancho máximo
    <div className="flex flex-col p-8 w-full gap-8 bg-white min-h-screen overflow-x-hidden">
      
      {/* Encabezado expandido */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Asegurados</h1>
          <p className="text-gray-500 mt-1">Gestioná tu cartera de clientes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={20} />
          Nuevo Asegurado
        </button>
      </div>

      {/* Barra de herramientas que ocupa el ancho total */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o CUIT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
          />
        </div>
      </div>

      {/* Tabla ensanchada al 100% */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden pb-10 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre / Razón Social</th>
                <th className="px-6 py-4 font-semibold">DNI / CUIT</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Fecha de Inicio</th>
                <th className="px-6 py-4 font-semibold text-center">Pólizas</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {aseguradosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron resultados para "{searchTerm}"
                  </td>
                </tr>
              ) : (
                aseguradosFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{cliente.dni}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{cliente.telefono}</span>
                        <span className="text-gray-400 text-xs">{cliente.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        {cliente.tipo === "Empresa" ? <Building2 size={16} className="text-blue-500"/> : <User size={16} className="text-gray-400"/>}
                        <span>{cliente.tipo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic">{cliente.fechaInicio}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold gap-1.5 border border-green-100">
                        <Shield size={14} />
                        {cliente.polizas}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        cliente.estado === "Activo" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-300 group-hover:text-green-600 transition-colors p-1 rounded-md hover:bg-green-50">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderizamos el Modal separado */}
      <NuevoAseguradoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
    </div>
  );
}