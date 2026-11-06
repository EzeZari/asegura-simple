"use client";

import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, FileText, HelpCircle, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/services/api"; 
import { validarRequerido, validarPatente, validarNroPoliza } from "@/utils/validaciones";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  polizaAEditar?: any; 
  isRenovacion?: boolean; 
}

const ESTADO_INICIAL = {
  nroPoliza: "", tipoPoliza: "Automotor", fechaInicio: "", fechaVencimiento: "",
  estado: "Vigente", formaPago: "", cobertura: "", aseguradoId: "", companiaId: "", 
  patente: "", marca: "", modelo: "", ubicacionRiesgo: "", cantidadEmpleados: "", enviarCuponera: false, 
  motor: "", chasis: "", anio: "", color: "", sumaAsegurada: "", clausulaAjuste: "",
  tieneRefacturacion: false, frecuenciaRefacturacion: "Mensual", fechaRefacturacion: "", diaHabitualPago: ""
};

const FORMAS_PAGO = [
  "Tarjeta de Crédito",
  "Tarjeta de Débito", 
  "CBU / Débito Automático",
  "Efectivo / Cupón",
  "Transferencia"
];

export default function NuevaPolizaModal({ isOpen, onClose, onSuccess, polizaAEditar, isRenovacion = false }: Props) {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [clientes, setClientes] = useState<any[]>([]); 
  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cuponeraFile, setCuponeraFile] = useState<File | null>(null);
  const cuponeraInputRef = useRef<HTMLInputElement>(null);

  // 🔥 ESTADO PARA MOSTRAR/OCULTAR LA AYUDA DE REFACTURACIÓN
  const [showAyudaRefacturacion, setShowAyudaRefacturacion] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(ESTADO_INICIAL);
      setErrorGlobal("");
      setErrores({});
      setPdfFile(null);
      setCuponeraFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cuponeraInputRef.current) cuponeraInputRef.current.value = '';
      setShowAyudaRefacturacion(false);
      return;
    }

    apiFetch('/api/asegurados')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data.filter((c: any) => c.activo));
      })
      .catch((err) => console.error("Error al cargar clientes:", err));
    
    apiFetch('/api/companias')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanias(data);
      })
      .catch((err) => console.error("Error al cargar compañías:", err));

    if (polizaAEditar) {
      if (isRenovacion) {
        const fechaInicioNueva = polizaAEditar.fechaVencimiento ? polizaAEditar.fechaVencimiento.split('T')[0] : new Date().toISOString().split('T')[0];
        const [año, mes, dia] = fechaInicioNueva.split('-');
        
        const vDate = new Date(Number(año), Number(mes) - 1, Number(dia));
        vDate.setMonth(vDate.getMonth() + 6);
        
        const yyyy = vDate.getFullYear();
        const mm = String(vDate.getMonth() + 1).padStart(2, '0');
        const dd = String(vDate.getDate()).padStart(2, '0');
        const fechaVencimientoNueva = `${yyyy}-${mm}-${dd}`;

        setFormData({
          ...ESTADO_INICIAL,
          ...polizaAEditar,
          nroPoliza: "", 
          fechaInicio: fechaInicioNueva,
          fechaVencimiento: fechaVencimientoNueva,
          estado: "Vigente", 
          aseguradoId: polizaAEditar.aseguradoId?.toString() || "",
          companiaId: polizaAEditar.companiaId?.toString() || "",
          formaPago: polizaAEditar.formaPago || "",
          enviarCuponera: polizaAEditar.enviarCuponera || false, 
          patente: polizaAEditar.patente || "",
          marca: polizaAEditar.marca || "",
          modelo: polizaAEditar.modelo || "",
          motor: polizaAEditar.motor || "",
          chasis: polizaAEditar.chasis || "",
          anio: polizaAEditar.anio || "",
          color: polizaAEditar.color || "",
          sumaAsegurada: polizaAEditar.sumaAsegurada || "",
          clausulaAjuste: polizaAEditar.clausulaAjuste || "",
          tieneRefacturacion: polizaAEditar.tieneRefacturacion || false,
          frecuenciaRefacturacion: polizaAEditar.frecuenciaRefacturacion || "Mensual",
          fechaRefacturacion: "",
          diaHabitualPago: polizaAEditar.diaHabitualPago || ""
        });
      } else {
        setFormData({
          ...ESTADO_INICIAL,
          ...polizaAEditar,
          fechaInicio: polizaAEditar.fechaInicio ? polizaAEditar.fechaInicio.split('T')[0] : "",
          fechaVencimiento: polizaAEditar.fechaVencimiento ? polizaAEditar.fechaVencimiento.split('T')[0] : "",
          aseguradoId: polizaAEditar.aseguradoId?.toString() || "",
          companiaId: polizaAEditar.companiaId?.toString() || "",
          formaPago: polizaAEditar.formaPago || "",
          enviarCuponera: polizaAEditar.enviarCuponera || false, 
          patente: polizaAEditar.patente || "",
          marca: polizaAEditar.marca || "",
          modelo: polizaAEditar.modelo || "",
          motor: polizaAEditar.motor || "",
          chasis: polizaAEditar.chasis || "",
          anio: polizaAEditar.anio || "",
          color: polizaAEditar.color || "",
          sumaAsegurada: polizaAEditar.sumaAsegurada || "",
          clausulaAjuste: polizaAEditar.clausulaAjuste || "",
          tieneRefacturacion: polizaAEditar.tieneRefacturacion || false,
          frecuenciaRefacturacion: polizaAEditar.frecuenciaRefacturacion || "Mensual",
          fechaRefacturacion: polizaAEditar.fechaRefacturacion ? polizaAEditar.fechaRefacturacion.split('T')[0] : "",
          diaHabitualPago: polizaAEditar.diaHabitualPago || ""
        });
      }
    } else {
      setFormData(ESTADO_INICIAL);
    }
    
    setErrorGlobal("");
    setErrores({});
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setCuponeraFile(null);
    if (cuponeraInputRef.current) cuponeraInputRef.current.value = '';

  }, [isOpen, polizaAEditar, isRenovacion]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
    if (errores[target.name]) {
      setErrores({ ...errores, [target.name]: "" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setErrorGlobal("El archivo de la póliza es muy pesado. Máximo 20 MB.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.type !== "application/pdf") {
        setErrorGlobal("Solo se permiten archivos en formato PDF.");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setPdfFile(file);
      setErrorGlobal(""); 
    }
  };

  const handleCuponeraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setErrorGlobal("El archivo de la cuponera es muy pesado. Máximo 5 MB.");
        if (cuponeraInputRef.current) cuponeraInputRef.current.value = '';
        return;
      }
      if (file.type !== "application/pdf") {
        setErrorGlobal("Solo se permiten archivos en formato PDF para la cuponera.");
        if (cuponeraInputRef.current) cuponeraInputRef.current.value = '';
        return;
      }
      setCuponeraFile(file);
      setErrorGlobal(""); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGlobal("");

    const nuevosErrores: Record<string, string> = {
      aseguradoId: validarRequerido(formData.aseguradoId, "Asegurado"),
      companiaId: validarRequerido(formData.companiaId, "Compañía"),
      nroPoliza: validarNroPoliza(formData.nroPoliza),
      fechaInicio: validarRequerido(formData.fechaInicio, "Vigencia Desde"),
      fechaVencimiento: validarRequerido(formData.fechaVencimiento, "Vigencia Hasta"),
    };

    if (formData.tipoPoliza === "Automotor" || formData.tipoPoliza === "Motovehículo") {
      nuevosErrores.patente = validarPatente(formData.patente, false); 
    }

    if (formData.fechaInicio && formData.fechaVencimiento) {
      const fInicio = new Date(formData.fechaInicio);
      const fVenc = new Date(formData.fechaVencimiento);
      if (fVenc <= fInicio) {
        nuevosErrores.fechaVencimiento = "El vencimiento debe ser posterior al inicio.";
      }
    }

    const erroresFiltrados = Object.fromEntries(
      Object.entries(nuevosErrores).filter(([_, v]) => v !== "")
    );

    if (Object.keys(erroresFiltrados).length > 0) {
      setErrores(erroresFiltrados);
      return;
    }

    setIsLoading(true);

    try {
      const isEditMode = polizaAEditar && !isRenovacion;
      const url = isEditMode ? `/api/polizas/${polizaAEditar.id}` : `/api/polizas`;
      const method = isEditMode ? "PUT" : "POST";

      const payloadToSave: any = { ...formData };
      delete payloadToSave.asegurado; 
      delete payloadToSave.compania;  
      delete payloadToSave.estadoCuotas; 
      
      if (!isEditMode) {
        delete payloadToSave.id; 
        delete payloadToSave.pdfUrl; 
        delete payloadToSave.cuponeraUrl; 
      }

      payloadToSave.aseguradoId = parseInt(payloadToSave.aseguradoId);
      payloadToSave.companiaId = parseInt(payloadToSave.companiaId);

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSave), 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al guardar la póliza");

      const polizaGuardadaId = isEditMode ? polizaAEditar.id : data.id;

      if (pdfFile || cuponeraFile) {
        const fileData = new FormData();
        if (pdfFile) fileData.append("pdf", pdfFile);
        if (cuponeraFile) fileData.append("cuponera", cuponeraFile);
        
        const uploadRes = await apiFetch(`/api/polizas/${polizaGuardadaId}/subir-pdf`, {
          method: "POST",
          body: fileData, 
        });

        if (!uploadRes.ok) {
          throw new Error("La póliza se guardó bien, pero hubo un error al subir los archivos PDF.");
        }
      }

      if (isRenovacion && polizaAEditar) {
        await apiFetch(`/api/polizas/${polizaAEditar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Renovada" }) 
        });
      }

      onSuccess();
    } catch (err: any) {
      setErrorGlobal(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto border border-transparent dark:border-gray-700 transition-colors custom-scrollbar">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2 transition-colors">
          {isRenovacion ? (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">Proceso de Renovación</span>
          ) : polizaAEditar ? "Editar Póliza" : "Nueva Póliza"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
          {errorGlobal && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium transition-colors">{errorGlobal}</div>}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">Asignación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Asegurado Titular *</label>
                <select 
                  name="aseguradoId" 
                  value={formData.aseguradoId} 
                  onChange={handleChange} 
                  className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white ${errores.aseguradoId ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors`}
                  disabled={isRenovacion} 
                >
                  <option value="" disabled className="dark:bg-gray-800">-- Seleccioná un cliente --</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="dark:bg-gray-800">{cliente.nombre} {cliente.apellido || ""} - {cliente.dni}</option>
                  ))}
                </select>
                {errores.aseguradoId && <p className="text-red-500 text-xs mt-1 font-medium">{errores.aseguradoId}</p>}
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Compañía Aseguradora *</label>
                <select 
                  name="companiaId" 
                  value={formData.companiaId} 
                  onChange={handleChange} 
                  className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white ${errores.companiaId ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors`}
                >
                  <option value="" disabled className="dark:bg-gray-800">-- Seleccioná una compañía --</option>
                  {companias.map((compania) => (
                    <option key={compania.id} value={compania.id} className="dark:bg-gray-800">{compania.nombre}</option>
                  ))}
                </select>
                {errores.companiaId && <p className="text-red-500 text-xs mt-1 font-medium">{errores.companiaId}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">Datos de la Póliza</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Número de Póliza *</label>
                <input 
                  type="text" 
                  name="nroPoliza" 
                  value={formData.nroPoliza} 
                  onChange={handleChange} 
                  placeholder="Ej: 12345678" 
                  className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errores.nroPoliza ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors`} 
                />
                {errores.nroPoliza && <p className="text-red-500 text-xs mt-1 font-medium">{errores.nroPoliza}</p>}
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Rama / Tipo</label>
                <select name="tipoPoliza" value={formData.tipoPoliza} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors">
                  <option value="Accidentes personales" className="dark:bg-gray-800">Accidentes personales</option>
                  <option value="ART" className="dark:bg-gray-800">ART</option>
                  <option value="Automotor" className="dark:bg-gray-800">Automotor</option>
                  <option value="Cascos" className="dark:bg-gray-800">Cascos</option>
                  <option value="Caución" className="dark:bg-gray-800">Caución</option>
                  <option value="Combinado familiar" className="dark:bg-gray-800">Combinado familiar</option>
                  <option value="Ecomovilidad" className="dark:bg-gray-800">Ecomovilidad</option>
                  <option value="Incendio" className="dark:bg-gray-800">Incendio</option>
                  <option value="Integral para comercio" className="dark:bg-gray-800">Integral para comercio</option>
                  <option value="Motovehículo" className="dark:bg-gray-800">Motovehículo</option>
                  <option value="Responsabilidad civil" className="dark:bg-gray-800">Responsabilidad civil</option>
                  <option value="Robo" className="dark:bg-gray-800">Robo</option>
                  <option value="Seguro técnico" className="dark:bg-gray-800">Seguro técnico</option>
                  <option value="Transporte" className="dark:bg-gray-800">Transporte</option>
                  <option value="Vida colectivo" className="dark:bg-gray-800">Vida colectivo</option>
                  <option value="Vida individual" className="dark:bg-gray-800">Vida individual</option>
                  <option value="Vida simple" className="dark:bg-gray-800">Vida simple</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="md:col-span-2 mb-1 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  A. Vigencia de la póliza
                </h4>
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Desde *</label>
                <input type="date" name="fechaInicio" value={formData.fechaInicio ? formData.fechaInicio.split("T")[0] : ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100" required />
                {errores.fechaInicio && <p className="text-red-500 text-xs mt-1 font-medium">{errores.fechaInicio}</p>}
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha Hasta (Renovación) *</label>
                <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento ? formData.fechaVencimiento.split("T")[0] : ""} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100" required />
                {errores.fechaVencimiento && <p className="text-red-500 text-xs mt-1 font-medium">{errores.fechaVencimiento}</p>}
              </div>
            </div>

            {/* 🔥 B. CONFIGURACIÓN DE REFACTURACIÓN */}
            <div className="flex flex-col gap-4 mt-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700 relative">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  B. Configuración de refacturación
                  <button type="button" onClick={() => setShowAyudaRefacturacion(!showAyudaRefacturacion)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 p-1 rounded-full transition-colors">
                    <HelpCircle size={16} />
                  </button>
                </h4>
                <div className="flex items-center gap-2">
                  <label htmlFor="tieneRefacturacion" className="text-xs font-semibold text-gray-500 cursor-pointer">¿Tiene refacturación?</label>
                  <input type="checkbox" id="tieneRefacturacion" name="tieneRefacturacion" checked={formData.tieneRefacturacion} onChange={handleChange} className="w-4 h-4 text-gray-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-gray-500 cursor-pointer" />
                </div>
              </div>

              {/* 🔥 MODALITO EXPLICATIVO INTERNO */}
              {showAyudaRefacturacion && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl text-sm text-blue-900 dark:text-blue-200 mb-2 relative">
                  <button type="button" onClick={() => setShowAyudaRefacturacion(false)} className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 p-1"><X size={16}/></button>
                  <p className="font-bold mb-2 flex items-center gap-1.5"><CheckCircle2 size={16}/> ¿Cómo completar estos datos?</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs opacity-90">
                    <li><strong className="font-bold">Próxima Fecha (Mes):</strong> Le dice al sistema a partir de qué mes empezar a calcular las cuotas. Si el cliente ya pagó meses anteriores, poné la fecha de la primera cuota impaga.</li>
                    <li><strong className="font-bold">Día Habitual (Día):</strong> Fuerza a que <i>todas</i> las cuotas venzan exactamente ese día (Ej: 16), evitando que se corran en meses de 31 días.</li>
                    <li><strong className="font-bold">Ejemplo:</strong> Si querés que le venza todos los 16 empezando desde Noviembre, ponés <code className="bg-white/50 px-1 rounded">Próxima Fecha: 15/11/2026</code> y <code className="bg-white/50 px-1 rounded">Día Habitual: 16</code>.</li>
                  </ul>
                </div>
              )}

              {formData.tieneRefacturacion && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col justify-end">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Frecuencia</label>
                    <select name="frecuenciaRefacturacion" value={formData.frecuenciaRefacturacion} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600">
                      <option value="Mensual">Mensual</option>
                      <option value="Bimestral">Bimestral</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                      <option value="Personalizada">Personalizada</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Próxima Fecha</label>
                    <input 
                      type="date" 
                      name="fechaRefacturacion" 
                      value={formData.fechaRefacturacion ? formData.fechaRefacturacion.split("T")[0] : ""} 
                      onChange={handleChange} 
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600" 
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Día Habitual (Opcional)</label>
                    <input 
                      type="number" 
                      name="diaHabitualPago" 
                      value={formData.diaHabitualPago} 
                      onChange={handleChange}
                      placeholder="Ej: 16" 
                      min="1" max="31"
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Estado de la Póliza</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors">
                  <option value="Vigente" className="dark:bg-gray-800">Vigente</option>
                  <option value="Pendiente de Pago" className="dark:bg-gray-800">Pendiente de Pago</option>
                  <option value="Anulada" className="dark:bg-gray-800">Anulada</option>
                  <option value="Renovada" className="dark:bg-gray-800">Renovada</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Forma de Pago</label>
                <select name="formaPago" value={formData.formaPago || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors">
                  <option value="" className="dark:bg-gray-800">-- Seleccionar --</option>
                  {FORMAS_PAGO.map(f => (
                    <option key={f} value={f} className="dark:bg-gray-800">{f}</option>
                  ))}
                  {formData.formaPago && !FORMAS_PAGO.includes(formData.formaPago) && (
                    <option value={formData.formaPago} className="dark:bg-gray-800">{formData.formaPago}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Cobertura <span className="text-[10px] text-gray-400 font-normal ml-1">Ej: Terceros Completos</span></label>
                <input type="text" name="cobertura" value={formData.cobertura} onChange={handleChange} placeholder="Detalle de cobertura" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Suma Asegurada</label>
                <input type="text" name="sumaAsegurada" value={formData.sumaAsegurada || ""} onChange={handleChange} placeholder="Ej: $ 15.000.000" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
              </div>
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Cláusula de Ajuste</label>
                <input type="text" name="clausulaAjuste" value={formData.clausulaAjuste || ""} onChange={handleChange} placeholder="Ej: 20%" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
              </div>
            </div>

            {(formData.tipoPoliza === "Automotor" || formData.tipoPoliza === "Motovehículo") && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                  Datos del Vehículo <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">Opcional</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Patente</label>
                    <input type="text" name="patente" value={formData.patente || ""} onChange={handleChange} placeholder="Ej: AB123CD" 
                      className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${errores.patente ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'} rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none uppercase transition-colors`} 
                    />
                    {errores.patente && <p className="text-red-500 text-xs mt-1 font-medium">{errores.patente}</p>}
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Marca</label>
                    <input type="text" name="marca" value={formData.marca || ""} onChange={handleChange} placeholder="Ej: Toyota" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Modelo Detallado</label>
                    <input type="text" name="modelo" value={formData.modelo || ""} onChange={handleChange} placeholder="Ej: Corolla 1.8 XEI CVT" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Año</label>
                    <input type="text" name="anio" value={formData.anio || ""} onChange={handleChange} placeholder="Ej: 2023" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Color</label>
                    <input type="text" name="color" value={formData.color || ""} onChange={handleChange} placeholder="Ej: Blanco Perla" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nro. de Motor</label>
                    <input type="text" name="motor" value={formData.motor || ""} onChange={handleChange} placeholder="Opcional" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none uppercase transition-colors" />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Nro. de Chasis</label>
                    <input type="text" name="chasis" value={formData.chasis || ""} onChange={handleChange} placeholder="Opcional" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none uppercase transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {(formData.tipoPoliza === "Combinado familiar" || formData.tipoPoliza === "Integral para comercio") && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                  Ubicación del Riesgo <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">Opcional</span>
                </h3>
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Dirección Asegurada</label>
                  <input type="text" name="ubicacionRiesgo" value={formData.ubicacionRiesgo || ""} onChange={handleChange} placeholder="Ej: Av. San Martín 1234" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
                </div>
              </div>
            )}

            {formData.tipoPoliza === "ART" && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                  Datos Laborales <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">Opcional</span>
                </h3>
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Cantidad de Empleados</label>
                  <input type="number" name="cantidadEmpleados" value={formData.cantidadEmpleados || ""} onChange={handleChange} placeholder="Ej: 15" className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors" />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 transition-colors">
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                Póliza Digital <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">Opcional</span>
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                  <UploadCloud size={18} />
                  {pdfFile ? "Cambiar archivo" : "Adjuntar PDF"}
                </button>
                {pdfFile && (
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800/30 transition-colors">
                    <FileText size={16} />
                    <span className="font-medium truncate max-w-[200px]">{pdfFile.name}</span>
                    <button type="button" onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="ml-2 text-green-600 dark:text-green-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {!pdfFile && polizaAEditar?.pdfUrl && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors">Ya tiene un PDF guardado.</span>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 transition-colors">
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 transition-colors">
                Cuponera de Pago <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full normal-case transition-colors">Opcional</span>
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input type="file" ref={cuponeraInputRef} onChange={handleCuponeraChange} accept="application/pdf" className="hidden" />
                <button type="button" onClick={() => cuponeraInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                  <UploadCloud size={18} />
                  {cuponeraFile ? "Cambiar Cuponera" : "Adjuntar Cuponera"}
                </button>
                {cuponeraFile && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/30 transition-colors">
                    <FileText size={16} />
                    <span className="font-medium truncate max-w-[200px]">{cuponeraFile.name}</span>
                    <button type="button" onClick={() => { setCuponeraFile(null); if (cuponeraInputRef.current) cuponeraInputRef.current.value = ''; }} className="ml-2 text-blue-600 dark:text-blue-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {!cuponeraFile && polizaAEditar?.cuponeraUrl && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic transition-colors">Ya tiene una cuponera guardada.</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                <input type="checkbox" id="enviarCuponera" name="enviarCuponera" checked={formData.enviarCuponera} onChange={handleChange} className="w-4 h-4 text-green-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-green-600 dark:focus:ring-green-500 transition-colors" />
                <label htmlFor="enviarCuponera" className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer leading-tight transition-colors">
                  Adjuntar automáticamente esta cuponera en el correo de aviso de vencimiento.
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 transition-colors bg-white dark:bg-gray-800 sticky bottom-0 z-10 p-2 -mx-2 -mb-2">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {isLoading && <UploadCloud size={16} className="animate-bounce" />}
              {isLoading ? "Procesando..." : (isRenovacion ? "Crear Renovación" : polizaAEditar ? "Actualizar Póliza" : "Guardar Póliza")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}