import { useState, useEffect } from "react";
import { Tag, Plus, Edit2, Trash2, Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function GestorDescuentos() {
  const [descuentos, setDescuentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 🔥 ESTADO PARA COLAPSAR/EXPANDIR
  const [isExpanded, setIsExpanded] = useState(true);

  // Estado para el formulario (Crear o Editar)
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ codigo: "", porcentaje: "20", activo: true });

  useEffect(() => {
    fetchDescuentos();
  }, []);

  const fetchDescuentos = async () => {
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/descuentos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDescuentos(data);
      }
    } catch (err) {
      console.error("Error cargando descuentos", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.codigo || !formData.porcentaje) {
      setError("Completá todos los campos.");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/descuentos/${currentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/descuentos`;
        
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          codigo: formData.codigo,
          porcentaje: (Number(formData.porcentaje) / 100).toFixed(2),
          activo: formData.activo
        })
      });

      if (res.ok) {
        setSuccess(isEditing ? "Descuento actualizado." : "Descuento creado.");
        resetForm();
        fetchDescuentos();
      } else {
        const data = await res.json();
        setError(data.error || "Ocurrió un error al guardar.");
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleEdit = (desc: any) => {
    setIsEditing(true);
    setCurrentId(desc.id);
    setFormData({
      codigo: desc.codigo,
      porcentaje: String(desc.porcentaje * 100),
      activo: desc.activo
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;
    
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/descuentos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchDescuentos();
    } catch (err) {
      console.error("Error eliminando descuento", err);
    }
  };

  const toggleEstado = async (desc: any) => {
    try {
      const token = localStorage.getItem("asegurasimple_admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/descuentos/${desc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...desc, activo: !desc.activo })
      });
      fetchDescuentos();
    } catch (err) {
      console.error("Error cambiando estado", err);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ codigo: "", porcentaje: "20", activo: true });
    setError("");
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-300">
      <div 
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none ${isExpanded ? 'mb-8 border-b border-gray-800 pb-6' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Tag className="text-emerald-500 w-6 h-6" /> Códigos de Descuento
          </h2>
          <p className="text-sm text-gray-400">Gestioná los cupones promocionales para las suscripciones.</p>
        </div>
        <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-full transition-colors shrink-0 self-end md:self-auto">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* COLUMNA 1: FORMULARIO */}
          <div className="xl:col-span-1 bg-gray-950 border border-gray-800 rounded-2xl p-5 h-fit">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              {isEditing ? <Edit2 size={16} className="text-blue-400"/> : <Plus size={16} className="text-emerald-400"/>} 
              {isEditing ? "Editar Cupón" : "Nuevo Cupón"}
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Código Promocional</label>
                <input 
                  type="text" 
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value.toUpperCase()})}
                  placeholder="Ej: ASEGURA20"
                  className="w-full mt-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white uppercase focus:border-emerald-500 outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Descuento (%)</label>
                <div className="relative mt-1">
                  <input 
                    type="number" 
                    min="1" max="100"
                    value={formData.porcentaje}
                    onChange={(e) => setFormData({...formData, porcentaje: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-gray-500 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-xl mt-2">
                <span className="text-sm font-semibold text-gray-300">Activo</span>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, activo: !formData.activo })} 
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${formData.activo ? 'bg-emerald-600' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.activo ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              {error && <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg mt-2">{error}</p>}
              {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg mt-2 flex items-center gap-1"><Check size={14}/> {success}</p>}

              <div className="flex gap-2 mt-4">
                {isEditing && (
                  <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm rounded-xl transition-colors">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={saving} className={`flex-[2] py-2.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 ${isEditing ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? "Actualizar" : "Guardar")}
                </button>
              </div>
            </form>
          </div>

          {/* COLUMNA 2: LISTADO DE CUPONES */}
          <div className="xl:col-span-2">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-500" /></div>
            ) : descuentos.length === 0 ? (
              <div className="bg-gray-950/50 border border-gray-800 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                <Tag size={40} className="text-gray-700 mb-4" />
                <p className="text-gray-400 font-medium">Aún no creaste ningún código de descuento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {descuentos.map((desc) => (
                  <div key={desc.id} className={`p-4 rounded-2xl border transition-all ${desc.activo ? 'bg-gray-950 border-gray-800 hover:border-gray-700' : 'bg-gray-950/30 border-gray-900 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="font-black text-lg text-white tracking-widest uppercase">{desc.codigo}</span>
                        <span className="text-xs text-gray-500 font-medium mt-0.5">Descuento del {desc.porcentaje * 100}%</span>
                      </div>
                      <button 
                        onClick={() => toggleEstado(desc)}
                        title={desc.activo ? "Desactivar" : "Activar"}
                        className={`p-1.5 rounded-full ${desc.activo ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-800 text-gray-500 hover:text-white'}`}
                      >
                        {desc.activo ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                      </button>
                    </div>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-800/50">
                      <button onClick={() => handleEdit(desc)} className="flex-1 py-1.5 text-xs font-bold text-gray-400 hover:text-blue-400 bg-gray-900 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Edit2 size={12} /> Editar
                      </button>
                      <button onClick={() => handleDelete(desc.id)} className="flex-1 py-1.5 text-xs font-bold text-gray-500 hover:text-red-400 bg-gray-900 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}