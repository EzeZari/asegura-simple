"use client";

import { useState, useRef, useEffect } from "react";
import { X, UploadCloud, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/services/api";
import { descargarTemplatePolizas } from "@/utils/excelTemplates";

// Subcomponentes modulares
import PasoUpload from "./importar/PasoUpload";
import PasoMapping from "./importar/PasoMapping";
import PasoPreview from "./importar/PasoPreview";
import PasoResult from "./importar/PasoResult";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

const RAMAS_PERMITIDAS = [
  "Accidentes personales", "ART", "Automotor", "Cascos", "Caución", 
  "Combinado familiar", "Ecomovilidad", "Incendio", "Integral para comercio", 
  "Motovehículo", "Responsabilidad civil", "Robo", "Seguro técnico", 
  "Transporte", "Vida colectivo", "Vida individual", "Vida simple"
];

export default function ImportarPolizasModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "result">("upload");
  const [polizas, setPolizas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [companiasDB, setCompaniasDB] = useState<any[]>([]);
  const [aseguradosDB, setAseguradosDB] = useState<any[]>([]);

  const [companiasDesconocidas, setCompaniasDesconocidas] = useState<string[]>([]);
  const [ramasDesconocidas, setRamasDesconocidas] = useState<string[]>([]);
  const [dnisDesconocidosFilas, setDnisDesconocidosFilas] = useState<any[]>([]);

  const [mapeosCompanias, setMapeosCompanias] = useState<Record<string, string>>({});
  const [mapeosRamas, setMapeosRamas] = useState<Record<string, string>>({});
  const [mapeosAsegurados, setMapeosAsegurados] = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        apiFetch('/api/companias').then(r => r.json()),
        apiFetch('/api/asegurados').then(r => r.json())
      ]).then(([comps, asegs]) => {
        if (Array.isArray(comps)) setCompaniasDB(comps);
        if (Array.isArray(asegs)) setAseguradosDB(asegs);
      }).catch(err => console.error("Error al cargar datos:", err));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const estandarizadas = jsonData.map((pRaw: any) => {
        const getVal = (keywords: string[]) => {
          const key = Object.keys(pRaw).find(k => {
            const lower = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            return keywords.some(kw => lower.includes(kw));
          });
          return key ? pRaw[key] : "";
        };

        return {
          nropoliza: String(getVal(['poliza', 'nro', 'numero', 'certif'])).trim(),
          dnicuit: String(getVal(['dni', 'cuit', 'cuil', 'doc'])).replace(/[^0-9]/g, ''),
          compania: String(getVal(['compania', 'aseguradora', 'cia', 'seguro'])).trim(),
          ramariesgo: String(getVal(['rama', 'riesgo', 'ramo', 'tipo'])).trim(),
          cobertura: String(getVal(['cobertura', 'plan'])).trim(),
          formapago: String(getVal(['pago', 'forma', 'metodo'])).trim(),
          patente: String(getVal(['patente', 'dominio', 'chapa'])).replace(/[\s-]/g, '').toUpperCase(),
          marca: String(getVal(['marca'])).trim(),
          modelo: String(getVal(['modelo'])).trim(),
          ubicacionriesgo: String(getVal(['ubicacion', 'direccion', 'domicilio'])).trim(),
          cantidadempleados: String(getVal(['empleado', 'personal', 'capita'])).trim(),
          vigenciadesde: getVal(['desde', 'inicio', 'vigenciadesde']),
          vigenciahasta: getVal(['hasta', 'vencimiento', 'fin', 'vigenciahasta'])
        };
      });

      const ciasUnicas = new Set<string>();
      const ramasUnicas = new Set<string>();
      const dnisConflictivos: any[] = [];
      const mapeosInicialesAseg: Record<number, string> = {};

      estandarizadas.forEach((p: any, index: number) => {
        const existeCia = companiasDB.some(c => c.nombre.toLowerCase().trim() === p.compania.toLowerCase());
        if (!existeCia || p.compania === "") ciasUnicas.add(p.compania || "Vacía");

        const existeRama = RAMAS_PERMITIDAS.some(r => r.toLowerCase() === p.ramariesgo.toLowerCase());
        if (!existeRama || p.ramariesgo === "") ramasUnicas.add(p.ramariesgo || "Vacía");

        const existeDni = aseguradosDB.some(a => String(a.dni).replace(/[^0-9]/g, '') === p.dnicuit);
        if (!existeDni || p.dnicuit === "") {
          dnisConflictivos.push({
            index,
            filaExcel: index + 2,
            poliza: p.nropoliza || "Sin Nro",
            dniOriginal: p.dnicuit || "Vacío"
          });
          mapeosInicialesAseg[index] = "IGNORAR";
        }
      });

      const arrayCias = Array.from(ciasUnicas);
      const arrayRamas = Array.from(ramasUnicas);

      const mapeosInicialesCia: Record<string, string> = {};
      arrayCias.forEach(c => mapeosInicialesCia[c] = "IGNORAR");

      const mapeosInicialesRama: Record<string, string> = {};
      arrayRamas.forEach(r => mapeosInicialesRama[r] = "IGNORAR");

      setPolizas(estandarizadas);
      setCompaniasDesconocidas(arrayCias);
      setRamasDesconocidas(arrayRamas);
      setDnisDesconocidosFilas(dnisConflictivos);

      setMapeosCompanias(mapeosInicialesCia);
      setMapeosRamas(mapeosInicialesRama);
      setMapeosAsegurados(mapeosInicialesAseg);

      setCurrentPage(1);

      if (arrayCias.length > 0 || arrayRamas.length > 0 || dnisConflictivos.length > 0) {
        setStep("mapping");
      } else {
        setStep("preview");
      }
    };
    reader.readAsBinaryString(file);
  };

  const aplicarMapeo = () => {
    const polizasActualizadas = polizas.map((p, idx) => {
      const copia = { ...p };
      const ciaKey = copia.compania || "Vacía";
      if (mapeosCompanias[ciaKey]) {
        copia.compania = mapeosCompanias[ciaKey] !== "IGNORAR" ? mapeosCompanias[ciaKey] : "";
      }

      const ramaKey = copia.ramariesgo || "Vacía";
      if (mapeosRamas[ramaKey]) {
        copia.ramariesgo = mapeosRamas[ramaKey] !== "IGNORAR" ? mapeosRamas[ramaKey] : "";
      }

      if (mapeosAsegurados[idx] !== undefined) {
        copia.dnicuit = mapeosAsegurados[idx] !== "IGNORAR" ? mapeosAsegurados[idx] : "";
      }

      return copia;
    });

    setPolizas(polizasActualizadas);
    setStep("preview");
    setCurrentPage(1);
  };

  const handleImportar = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/polizas/importar", {
        method: "POST",
        body: JSON.stringify(polizas),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");

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
    setPolizas([]);
    setResultado(null);
    setIsCopied(false);
    setCurrentPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleSuccess = () => {
    onSuccess(`Se importaron ${resultado?.creados || 0} pólizas correctamente.`);
    handleClose();
  };

  const copiarReporte = () => {
    if (!resultado?.reporte) return;
    let texto = "📋 REPORTE DE IMPORTACIÓN - AseguraSimple\n";
    texto += `Fecha: ${new Date().toLocaleString("es-AR")}\n\n`;
    const exitos = resultado.reporte.filter((r: any) => r.estado === "exito");
    const errores = resultado.reporte.filter((r: any) => r.estado === "error");

    texto += `✅ IMPORTADAS CON ÉXITO: ${exitos.length}\n`;
    exitos.forEach((r: any) => { texto += `- Fila ${r.fila} | Póliza #${r.poliza}\n`; });

    texto += `\n❌ SALTEADAS O CON ERRORES: ${errores.length}\n`;
    errores.forEach((r: any) => { texto += `- Fila ${r.fila} | Póliza #${r.poliza} -> ERROR: ${r.motivo}\n`; });

    navigator.clipboard.writeText(texto);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const descargarExcelErrores = () => {
    if (!resultado?.reporte) return;
    const errores = resultado.reporte.filter((r: any) => r.estado === "error");
    if (errores.length === 0) return;

    const dataExcel = errores.map((err: any) => {
      const polizaFila = polizas[err.fila - 2] || {};
      return {
        Fila_Original: err.fila,
        NroPoliza: err.poliza,
        DNI_CUIT: polizaFila.dnicuit || "",
        Compania: polizaFila.compania || "",
        Rama_Riesgo: polizaFila.ramariesgo || "",
        Patente: polizaFila.patente || "",
        Motivo_Rechazo: err.motivo
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 45 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rechazadas");
    XLSX.writeFile(wb, `polizas_rechazadas_${new Date().toISOString().split("T")[0]}.xlsx`);
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

  const totalPages = Math.ceil(polizas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPolizas = polizas.slice(startIndex, startIndex + itemsPerPage);

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

        {/* Contenedor dinámico según el paso */}
        <div className="flex-1 overflow-auto p-5 custom-scrollbar">
          {step === "upload" && (
            <PasoUpload 
              fileInputRef={fileInputRef} 
              onFileChange={handleFileChange} 
              onDescargarTemplate={descargarTemplatePolizas} 
            />
          )}

          {step === "mapping" && (
            <PasoMapping
              companiasDesconocidas={companiasDesconocidas}
              ramasDesconocidas={ramasDesconocidas}
              dnisDesconocidosFilas={dnisDesconocidosFilas}
              companiasDB={companiasDB}
              aseguradosDB={aseguradosDB}
              ramasPermitidas={RAMAS_PERMITIDAS}
              mapeosCompanias={mapeosCompanias}
              setMapeosCompanias={setMapeosCompanias}
              mapeosRamas={mapeosRamas}
              setMapeosRamas={setMapeosRamas}
              mapeosAsegurados={mapeosAsegurados}
              setMapeosAsegurados={setMapeosAsegurados}
            />
          )}

          {step === "preview" && (
            <PasoPreview
              polizas={polizas}
              currentPolizas={currentPolizas}
              aseguradosDB={aseguradosDB}
              companiasDB={companiasDB}
              ramasPermitidas={RAMAS_PERMITIDAS}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              startIndex={startIndex}
              itemsPerPage={itemsPerPage}
            />
          )}

          {step === "result" && (
            <PasoResult
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
                ← Volver a subir
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
                {isLoading ? "Procesando Excel..." : `Importar ${polizas.length} pólizas`}
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