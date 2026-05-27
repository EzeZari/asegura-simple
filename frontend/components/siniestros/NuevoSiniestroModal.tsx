"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siniestroAEditar?: any;
}

const ESTADO_INICIAL = {
  nroSiniestro: "",
  fechaHecho: "",
  descripcionInicial: "",
  estadoSiniestro: "Denuncia Pendiente",
  polizaId: "",
};

export default function NuevoSiniestroModal({ isOpen, onClose, onSuccess, siniestroAEditar }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // 🔥 CORREGIDO (Backtick al final)
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/polizas`)
        .then((res) => res.json())
        .then((data) => setPolizas(data.filter((p: any) => p.estado === "Vigente" || p.estado === "Renovada")))
        .catch((err) => console.error("Error al cargar pólizas:", err));

      if (siniestroAEditar) {
        setFormData({
          ...siniestroAEditar,
          fechaHecho: siniestroAEditar.fechaHecho.split('T')[0], // Formato para el input date
          polizaId: siniestroAEditar.polizaId.toString(),
        });
      } else {
        setFormData(ESTADO_INICIAL);
      }
      setError("");
    }
  }, [isOpen, siniestroAEditar]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.polizaId) return setError("Debes seleccionar una póliza afectada.");

    setIsLoading(true);
    setError("");

    try {
      // 🔥 CORREGIDO (Backtick al final del POST)
      const url = siniestroAEditar 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/${siniestroAEditar.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/siniestros`;
      
      const method = siniestroAEditar ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar el siniestro");

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" />
          {siniestroAEditar ? "Actualizar Siniestro" : "Reportar Nuevo Siniestro"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Póliza Afectada *</label>
            <select 
              required name="polizaId" value={formData.polizaId} onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none bg-white"
              disabled={!!siniestroAEditar} 
            >
              <option value="" disabled>-- Buscá al cliente o patente --</option>
              {polizas.map((poliza) => (
                <option key={poliza.id} value={poliza.id}>
                  {poliza.asegurado?.nombre} {poliza.asegurado?.apellido} | Patente: {poliza.patente || "N/A"} | Pol: {poliza.nroPoliza}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nro Reclamo (Compañía)</label>
              <input type="text" name="nroSiniestro" value={formData.nroSiniestro} onChange={handleChange} placeholder="Ej: 99887766" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none" />
              <p className="text-[10px] text-gray-400 mt-1">Dejar vacío si aún no lo tenés</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Hecho *</label>
              <input required type="date" name="fechaHecho" value={formData.fechaHecho} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none text-gray-600" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Trámite</label>
            <select name="estadoSiniestro" value={formData.estadoSiniestro} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none bg-white font-medium text-gray-700">
              <option value="Denuncia Pendiente">Denuncia Pendiente</option>
              <option value="En Análisis">En Análisis (Cía de Seguros)</option>
              <option value="Aprobado">Aprobado / Esperando Pago</option>
              <option value="Pagado">Pagado / Resuelto</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Cerrado">Cerrado Administrativamente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de lo ocurrido *</label>
            <textarea 
              required name="descripcionInicial" value={formData.descripcionInicial} onChange={handleChange} 
              placeholder="Ej: Choque en cadena en Av. San Martín. El tercero cruzó en rojo..."
              rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-600 outline-none resize-none" 
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              <Save size={16} /> {isLoading ? "Guardando..." : "Guardar Siniestro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}