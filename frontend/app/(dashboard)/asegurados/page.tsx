"use client";

import { Search, Plus, MoreHorizontal } from "lucide-react";

// MOCK DATA: Datos falsos para maquetar la tabla
const MOCK_ASEGURADOS = [
  { id: "1", nombre: "Marcelo Gallardo", dni: "20.123.456", email: "muneco@email.com", telefono: "341 123-4567", estado: "Activo" },
  { id: "2", nombre: "Ariel Ortega", dni: "22.345.678", email: "burrito@email.com", telefono: "341 234-5678", estado: "Activo" },
  { id: "3", nombre: "Leonardo Ponzio", dni: "25.987.654", email: "capitan@email.com", telefono: "341 345-6789", estado: "Inactivo" },
  { id: "4", nombre: "Juan Fernando Quintero", dni: "94.123.852", email: "juanfer@email.com", telefono: "341 456-7890", estado: "Activo" },
  { id: "5", nombre: "Enzo Francescoli", dni: "14.567.890", email: "principe@email.com", telefono: "341 567-8901", estado: "Activo" },
];

export default function AseguradosPage() {
  return (
    <div className="flex-1 flex flex-col p-8 w-full max-w-7xl mx-auto gap-8 bg-white min-h-screen">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Asegurados</h1>
          <p className="text-gray-500 mt-1">Gestioná tu cartera de clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          Nuevo Asegurado
        </button>
      </div>

      {/* Barra de herramientas (Buscador preparado para los filtros) */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o DNI..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
        {/* Próximamente: Acá vamos a agregar los botones de filtrado extra */}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden pb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">DNI</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Teléfono</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ASEGURADOS.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.dni}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.email}</td>
                  <td className="px-6 py-4 text-gray-600">{cliente.telefono}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cliente.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Botón de tres puntitos para editar/eliminar a futuro */}
                    <button className="text-gray-400 hover:text-green-700 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}