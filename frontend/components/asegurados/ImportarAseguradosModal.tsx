"use client";

import { useState, useRef, useEffect } from "react";
import { X, UploadCloud, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { descargarTemplateAsegurados } from "@/utils/excelTemplates";

// Subcomponentes modulares
import PasoUploadAsegurados from "./importar/PasoUploadAsegurados";
import PasoMappingAsegurados from "./importar/PasoMappingAsegurados";
import PasoPreviewAsegurados from "./importar/PasoPreviewAsegurados";
import PasoResultAsegurados from "./importar/PasoResultAsegurados";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

const CONDICIONES_IVA = ["Consumidor Final", "Monotributo", "Responsable Inscripto", "Exento"];
const TIPOS_PERMITIDOS = ["Individuo", "Empresa"];

export default function ImportarAseguradosModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "result">("upload");
  const [asegurados, setAsegurados] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [dnisExistentesDB, setDnisExistentesDB] = useState<string[]>([]);
  const [condicionesDesconocidas, setCondicionesDesconocidas] = useState<string[]>([]);
  const [tiposDesconocidos, setTiposDesconocidos] = useState<string[]>([]);

  const [mapeosCondicionIva, setMapeosCondicionIva] = useState<Record<string, string>>({});
  const [mapeosTipos, setMapeosTipos] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const setShowUpgradeModal = useAuthStore((state) => state.setShowUpgradeModal);

  useEffect(() => {
    if (isOpen) {
      apiFetch('/api/asegurados')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDnisExistentesDB(data.map((a: any) => String(a.dni).trim().replace(/[^0-9]/g, '')));
          }
        })
        .catch(err => console.error("Error al cargar asegurados:", err));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const estandarizados = jsonData.map((cRaw: any) => {
        const getVal = (keywords: string[]) => {
          const key = Object.keys(cRaw).find(k => {
            const lower = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            return keywords.some(kw => lower.includes(kw));
          });
          return key ? cRaw[key] : "";
        };

        const dniLimpio = String(getVal(['dni', 'cuit', 'cuil', 'doc'])).trim().replace(/[^0-9]/g, '');
        let tipoInferido = "Individuo";
        const tipoOriginal = String(getVal(['tipo'])).trim();
        if (tipoOriginal.toLowerCase().includes('empresa') || dniLimpio.length === 11) {
          tipoInferido = "Empresa";
        } else if (tipoOriginal) {
          tipoInferido = tipoOriginal;
        }

        return {
          nombre: String(getVal(['nombre', 'razonsocial', 'cliente'])).trim(),
          apellido: String(getVal(['apellido'])).trim(),
          dni: dniLimpio,
          tipo: tipoInferido,
          condicionIva: String(getVal(['condicioniva', 'iva'])).trim() || "Consumidor Final",
          telefono: String(getVal(['telefono', 'celular', 'tel'])).trim(),
          email: String(getVal(['email', 'correo', 'mail'])).trim(),
          direccion: String(getVal(['direccion', 'domicilio', 'calle'])).trim(),
          codigoPostal: String(getVal(['codigopostal', 'cp'])).trim(),
          fechaNacimiento: getVal(['nacimiento', 'fechanac'])
        };
      });

      const ivassUnicas = new Set<string>();
      const tiposUnicos = new Set<string>();

      estandarizados.forEach((c) => {
        if (c.condicionIva && !CONDICIONES_IVA.some(ci => ci.toLowerCase() === c.condicionIva.toLowerCase())) {
          ivassUnicas.add(c.condicionIva);
        }
        if (c.tipo && !TIPOS_PERMITIDOS.some(tp => tp.toLowerCase() === c.tipo.toLowerCase())) {
          tiposUnicos.add(c.tipo);
        }
      });

      const arrayIva = Array.from(ivassUnicas);
      const arrayTipos = Array.from(tiposUnicos);

      const mapIvaInit: Record<string, string> = {};
      arrayIva.forEach(iv => mapIvaInit[iv] = "Consumidor Final");

      const mapTiposInit: Record<string, string> = {};
      arrayTipos.forEach(tp => mapTiposInit[tp] = "Individuo");

      setAsegurados(estandarizados);
      setCondicionesDesconocidas(arrayIva);
      setTiposDesconocidos(arrayTipos);
      setMapeosCondicionIva(mapIvaInit);
      setMapeosTipos(mapTiposInit);
      setCurrentPage(1);

      if (arrayIva.length > 0 || arrayTipos.length > 0) {
        setStep("mapping");
      } else {
        setStep("preview");
      }
    };
    reader.readAsBinaryString(file);
  };

  const aplicarMapeo = () => {
    const actualizados = asegurados.map(c => {
      const copia = { ...c };
      if (mapeosCondicionIva[copia.condicionIva]) {
        copia.condicionIva = mapeosCondicionIva[copia.condicionIva];
      }
      if (mapeosTipos[copia.tipo]) {
        copia.tipo = mapeosTipos[copia.tipo];
      }
      return copia;
    });

    setAsegurados(actualizados);
    setStep("preview");
    setCurrentPage(1);
  };

  const handleImportar = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/asegurados/importar", {
        method: "POST",
        body: JSON.stringify(asegurados),
      });
      const data = await res.json();

      if (res.status === 403 && data.codigo === "LIMITE_EXCEDIDO") {
        setShowUpgradeModal(true, data.error);
        setIsLoading(false);
        handleClose();
        return;
      }

      if (!res.ok) throw new Error(data.error || "Error al importar clientes");

      setResultado(data);
      setStep("result");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("upload");
    setAsegurados([]);
    setResultado(null);
    setIsCopied(false);
    setCurrentPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleSuccess = () => {
    onSuccess(`Se importaron ${resultado?.creados || 0} asegurados correctamente.`);
    handleClose();
  };

  const copiarReporte = () => {
    if (!resultado?.reporte) return;
    let texto = "📋 REPORTE DE IMPORTACIÓN - AseguraSimple (Asegurados)\n";
    texto += `Fecha: ${new Date().toLocaleString("es-AR")}\n\n`;
    const exitos = resultado.reporte.filter((r: any) => r.estado === "exito");
    const errores = resultado.reporte.filter((r: any) => r.estado === "error");

    texto += `✅ IMPORTADOS CON ÉXITO: ${exitos.length}\n`;
    exitos.forEach((r: any) => { texto += `- Fila ${r.fila} | ${r.cliente} (DNI: ${r.dni})\n`; });

    texto += `\n❌ SALTEADOS O CON ERRORES: ${errores.length}\n`;
    errores.forEach((r: any) => { texto += `- Fila ${r.fila} | ${r.cliente} -> ERROR: ${r.motivo}\n`; });

    navigator.clipboard.writeText(texto);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const descargarExcelErrores = () => {
    if (!resultado?.reporte) return;
    const errores = resultado.reporte.filter((r: any) => r.estado === "error");
    if (errores.length === 0) return;

    const dataExcel = errores.map((err: any) => {
      const clienteFila = asegurados[err.fila - 2] || {};
      return {
        Fila_Original: err.fila,
        Nombre: clienteFila.nombre || "",
        Apellido: clienteFila.apellido || "",
        DNI_CUIT: clienteFila.dni || "",
        Email: clienteFila.email || "",
        Telefono: clienteFila.telefono || "",
        Motivo_Rechazo: err.motivo
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 45 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rechazados");
    XLSX.writeFile(wb, `asegurados_rechazados_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const StepIndicator = ({ number, title, isActive, isDone }: any) => (
    <div className={`flex items-center gap-2 ${isActive ? 'opacity-100' : isDone ? 'opacity-80' : 'opacity-40'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
        isActive 
          ? 'bg-emerald-600 text-white' 
          : isDone 
          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {isDone ? <Check size={12} /> : number}
      </div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 hidden sm:block">{title}</span>
    </div>
  );

  if (!isOpen) return null;

  const totalPages = Math.ceil(asegurados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAsegurados = asegurados.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">

        {/* Header con Stepper */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3 sm:gap-6">
            <StepIndicator number={1} title="Subir" isActive={step === "upload"} isDone={step !== "upload"} />
            <span className="text-gray-300 dark:text-gray-700 hidden sm:block">›</span>
            <StepIndicator number={2} title="Ajustar" isActive={step === "mapping"} isDone={step === "preview" || step === "result"} />
            <span className="text-gray-300 dark:text-gray-700 hidden sm:block">›</span>
            <StepIndicator number={3} title="Revisar" isActive={step === "preview"} isDone={step === "result"} />
            <span className="text-gray-300 dark:text-gray-700 hidden sm:block">›</span>
            <StepIndicator number={4} title="Resultado" isActive={step === "result"} isDone={false} />
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        {/* Contenedor dinámico de pasos */}
        <div className="flex-1 overflow-auto p-5 custom-scrollbar">
          {step === "upload" && (
            <PasoUploadAsegurados 
              fileInputRef={fileInputRef} 
              onFileChange={handleFileChange} 
              onDescargarTemplate={descargarTemplateAsegurados} 
            />
          )}

          {step === "mapping" && (
            <PasoMappingAsegurados
              condicionesDesconocidas={condicionesDesconocidas}
              tiposDesconocidos={tiposDesconocidos}
              mapeosCondicionIva={mapeosCondicionIva}
              setMapeosCondicionIva={setMapeosCondicionIva}
              mapeosTipos={mapeosTipos}
              setMapeosTipos={setMapeosTipos}
            />
          )}

          {step === "preview" && (
            <PasoPreviewAsegurados
              asegurados={asegurados}
              currentAsegurados={currentAsegurados}
              dnisExistentesDB={dnisExistentesDB}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              startIndex={startIndex}
              itemsPerPage={itemsPerPage}
            />
          )}

          {step === "result" && (
            <PasoResultAsegurados
              resultado={resultado}
              isCopied={isCopied}
              onCopiarReporte={copiarReporte}
              onDescargarErrores={descargarExcelErrores}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            {step === "preview" && (
              <button 
                type="button" 
                onClick={() => setStep("upload")} 
                className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2"
              >
                ← Volver
              </button>
            )}
            {step === "mapping" && (
              <button 
                type="button" 
                onClick={aplicarMapeo} 
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                Confirmar y Continuar
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {step === "upload" && (
              <button 
                type="button" 
                onClick={handleClose} 
                className="px-5 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cerrar
              </button>
            )}
            {step === "preview" && (
              <button
                type="button"
                onClick={handleImportar}
                disabled={isLoading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                <UploadCloud size={16} />
                {isLoading ? "Procesando Excel..." : `Importar ${asegurados.length} clientes`}
              </button>
            )}
            {step === "result" && (
              <button 
                type="button" 
                onClick={handleSuccess} 
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                Finalizar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}