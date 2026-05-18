"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  polizaAEditar?: any; 
  isRenovacion?: boolean; 
}

const ESTADO_INICIAL = {
  nroPoliza: "",
  tipoPoliza: "Automotor",
  fechaInicio: "",
  fechaVencimiento: "",
  estado: "Vigente",
  cobertura: "",
  aseguradoId: "", 
  companiaId: "", 
  patente: "", 
  marca: "",   
  modelo: "",  
  ubicacionRiesgo: "",
  cantidadEmpleados: "",
};

export default function NuevaPolizaModal({ isOpen, onClose, onSuccess, polizaAEditar, isRenovacion = false }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [clientes, setClientes] = useState<any[]>([]); 
  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:3001/api/asegurados")
        .then((res) => res.json())
        .then((data) => setClientes(data.filter((c: any) => c.activo)))
        .catch((err) => console.error("Error al cargar clientes:", err));
      
      fetch("http://localhost:3001/api/companias")
        .then((res) => res.json())
        .then((data) => setCompanias(data))
        .catch((err) => console.error("Error al cargar compañías:", err));

      if (polizaAEditar) {
        if (isRenovacion) {
          // LÓGICA DE RENOVACIÓN
          const fechaInicioNueva = polizaAEditar.fechaVencimiento.split('T')[0];
          const vDate = new Date(polizaAEditar.fechaVencimiento);
          vDate.setMonth(vDate.getMonth() + 6);
          const fechaVencimientoNueva = vDate.toISOString().split('T')[0];

          setFormData({
            ...polizaAEditar,
            nroPoliza: "", 
            fechaInicio: fechaInicioNueva,
            fechaVencimiento: fechaVencimientoNueva,
            estado: "Vigente", 
            aseguradoId: polizaAEditar.aseguradoId.toString(),
            companiaId: polizaAEditar.companiaId?.toString() || "",
          });
        } else {
          // LÓGICA DE EDICIÓN NORMAL
          setFormData({
            ...polizaAEditar,
            fechaInicio: polizaAEditar.fechaInicio.split('T')[0],
            fechaVencimiento: polizaAEditar.fechaVencimiento.split('T')[0],
            aseguradoId: polizaAEditar.aseguradoId.toString(),
            companiaId: polizaAEditar.companiaId?.toString() || "",
          });
        }
      } else {
        setFormData(ESTADO_INICIAL);
      }
      setError("");
    }
  }, [isOpen, polizaAEditar, isRenovacion]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aseguradoId || !formData.companiaId) {
      setError("Por favor, seleccioná un Asegurado y una Compañía.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isEditMode = polizaAEditar && !isRenovacion;
      const url = isEditMode 
        ? `http://localhost:3001/api/polizas/${polizaAEditar.id}`
        : "http://localhost:3001/api/polizas";
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar la póliza");

      if (isRenovacion && polizaAEditar) {
        await fetch(`http://localhost:3001/api/polizas/${polizaAEditar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...polizaAEditar, estado: "Renovada" })
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          {isRenovacion ? (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Proceso de Renovación</span>
          ) : polizaAEditar ? "Editar Póliza" : "Nueva Póliza"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Asignación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asegurado Titular *</label>
                <select 
                  required name="aseguradoId" value={formData.aseguradoId} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white"
                  disabled={isRenovacion} 
                >
                  <option value="" disabled>-- Seleccioná un cliente --</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre} {cliente.apellido || ""} - {cliente.dni}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compañía Aseguradora *</label>
                <select 
                  required name="companiaId" value={formData.companiaId} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white"
                >
                  <option value="" disabled>-- Seleccioná una compañía --</option>
                  {companias.map((compania) => (
                    <option key={compania.id} value={compania.id}>{compania.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Datos de la Póliza</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Póliza *</label>
                <input required type="text" name="nroPoliza" value={formData.nroPoliza} onChange={handleChange} placeholder="Ej: 12345678" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rama / Tipo</label>
                <select name="tipoPoliza" value={formData.tipoPoliza} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white">
                  <option value="Automotor">Automotor</option>
                  <option value="Motovehículo">Motovehículo</option>
                  <option value="Combinado Familiar">Combinado Familiar</option>
                  <option value="Vida">Vida</option>
                  <option value="ART">ART</option>
                  <option value="Integral de Comercio">Integral de Comercio</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia Desde *</label>
                <input required type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia Hasta *</label>
                <input required type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-gray-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none bg-white">
                  <option value="Vigente">Vigente</option>
                  <option value="Pendiente de Pago">Pendiente de Pago</option>
                  <option value="Anulada">Anulada</option>
                  <option value="Renovada">Renovada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cobertura</label>
                <input type="text" name="cobertura" value={formData.cobertura} onChange={handleChange} placeholder="Ej: Terceros Completo" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
              </div>
            </div>

            {/* ---> MAGIA CONDICIONAL SEGÚN EL TIPO DE PÓLIZA <--- */}
            
            {/* BLOQUE 1: VEHÍCULOS */}
            {(formData.tipoPoliza === "Automotor" || formData.tipoPoliza === "Motovehículo") && (
              <div className="space-y-4 pt-4 border-t border-gray-100 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  Datos del Vehículo <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full normal-case">Opcional</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
                    <input type="text" name="patente" value={formData.patente || ""} onChange={handleChange} placeholder="Ej: AB123CD" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                    <input type="text" name="marca" value={formData.marca || ""} onChange={handleChange} placeholder="Ej: Toyota" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                    <input type="text" name="modelo" value={formData.modelo || ""} onChange={handleChange} placeholder="Ej: Corolla 2023" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE 2: HOGAR Y COMERCIO */}
            {(formData.tipoPoliza === "Combinado Familiar" || formData.tipoPoliza === "Integral de Comercio") && (
              <div className="space-y-4 pt-4 border-t border-gray-100 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  Ubicación del Riesgo <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full normal-case">Opcional</span>
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Asegurada</label>
                  <input type="text" name="ubicacionRiesgo" value={formData.ubicacionRiesgo || ""} onChange={handleChange} placeholder="Ej: Av. San Martín 1234" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                </div>
              </div>
            )}

            {/* BLOQUE 3: ART */}
            {formData.tipoPoliza === "ART" && (
              <div className="space-y-4 pt-4 border-t border-gray-100 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  Datos Laborales <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full normal-case">Opcional</span>
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Empleados</label>
                  <input type="number" name="cantidadEmpleados" value={formData.cantidadEmpleados || ""} onChange={handleChange} placeholder="Ej: 15" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 outline-none" />
                </div>
              </div>
            )}

          </div>

          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {isLoading ? "Guardando..." : (isRenovacion ? "Crear Renovación" : polizaAEditar ? "Actualizar Póliza" : "Guardar Póliza")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}