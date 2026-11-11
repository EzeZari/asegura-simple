"use client";

import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { apiFetch } from "@/services/api";
import { validarRequerido, validarPatente, validarNroPoliza } from "@/utils/validaciones";
import { useAuthStore } from "@/store/authStore";

import {
  PolizaFormData,
  ScanResultado,
  ESTADO_INICIAL_POLIZA,
  FORMAS_PAGO,
  RAMAS_POLIZA,
  buscarClienteLocal,
  buscarCompaniaLocal,
} from "./modal/polizaModal.types";
import PolizaScannerBanner from "./modal/PolizaScannerBanner";
import PolizaRefacturacionSection from "./modal/PolizaRefacturacionSection";
import PolizaRiesgoEspecificoSection from "./modal/PolizaRiesgoEspecificoSection";
import PolizaArchivosSection from "./modal/PolizaArchivosSection";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  polizaAEditar?: any;
  isRenovacion?: boolean;
}

export default function NuevaPolizaModal({
  isOpen,
  onClose,
  onSuccess,
  polizaAEditar,
  isRenovacion = false,
}: Props) {
  const setShowUpgradeModal = useAuthStore((state: any) => state.setShowUpgradeModal);

  const [formData, setFormData] = useState<PolizaFormData>(ESTADO_INICIAL_POLIZA);
  const [clientes, setClientes] = useState<any[]>([]);
  const [companias, setCompanias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [cuponeraFile, setCuponeraFile] = useState<File | null>(null);

  const [isScanningPdf, setIsScanningPdf] = useState(false);
  const [scanResultado, setScanResultado] = useState<ScanResultado | null>(null);
  const [errorLimitePlan, setErrorLimitePlan] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setFormData(ESTADO_INICIAL_POLIZA);
      setErrorGlobal("");
      setErrores({});
      setPdfFile(null);
      setCuponeraFile(null);
      setIsScanningPdf(false);
      setScanResultado(null);
      setErrorLimitePlan("");
      return;
    }

    apiFetch("/api/asegurados")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data.filter((c: any) => c.activo));
      })
      .catch((err) => console.error("Error al cargar clientes:", err));

    apiFetch("/api/companias")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanias(data);
      })
      .catch((err) => console.error("Error al cargar compañías:", err));

    if (polizaAEditar) {
      if (isRenovacion) {
        const fechaInicioNueva = polizaAEditar.fechaVencimiento
          ? polizaAEditar.fechaVencimiento.split("T")[0]
          : new Date().toISOString().split("T")[0];
        const [anioStr, mesStr, diaStr] = fechaInicioNueva.split("-");

        const vDate = new Date(Number(anioStr), Number(mesStr) - 1, Number(diaStr));
        vDate.setMonth(vDate.getMonth() + 6);

        const yyyy = vDate.getFullYear();
        const mm = String(vDate.getMonth() + 1).padStart(2, "0");
        const dd = String(vDate.getDate()).padStart(2, "0");
        const fechaVencimientoNueva = `${yyyy}-${mm}-${dd}`;

        setFormData({
          ...ESTADO_INICIAL_POLIZA,
          ...polizaAEditar,
          nroPoliza: "",
          fechaInicio: fechaInicioNueva,
          fechaVencimiento: fechaVencimientoNueva,
          estado: "Vigente",
          aseguradoId: polizaAEditar.aseguradoId?.toString() || "",
          companiaId: polizaAEditar.companiaId?.toString() || "",
          formaPago: polizaAEditar.formaPago || "",
          enviarCuponera: Boolean(polizaAEditar.enviarCuponera),
          patente: polizaAEditar.patente || "",
          marca: polizaAEditar.marca || "",
          modelo: polizaAEditar.modelo || "",
          motor: polizaAEditar.motor || "",
          chasis: polizaAEditar.chasis || "",
          anio: polizaAEditar.anio || "",
          color: polizaAEditar.color || "",
          sumaAsegurada: polizaAEditar.sumaAsegurada || "",
          clausulaAjuste: polizaAEditar.clausulaAjuste || "",
          tieneRefacturacion: Boolean(polizaAEditar.tieneRefacturacion),
          frecuenciaRefacturacion: polizaAEditar.frecuenciaRefacturacion || "Mensual",
          fechaRefacturacion: "",
          diaHabitualPago: polizaAEditar.diaHabitualPago?.toString() || "",
        });
      } else {
        setFormData({
          ...ESTADO_INICIAL_POLIZA,
          ...polizaAEditar,
          fechaInicio: polizaAEditar.fechaInicio ? polizaAEditar.fechaInicio.split("T")[0] : "",
          fechaVencimiento: polizaAEditar.fechaVencimiento
            ? polizaAEditar.fechaVencimiento.split("T")[0]
            : "",
          aseguradoId: polizaAEditar.aseguradoId?.toString() || "",
          companiaId: polizaAEditar.companiaId?.toString() || "",
          formaPago: polizaAEditar.formaPago || "",
          enviarCuponera: Boolean(polizaAEditar.enviarCuponera),
          patente: polizaAEditar.patente || "",
          marca: polizaAEditar.marca || "",
          modelo: polizaAEditar.modelo || "",
          motor: polizaAEditar.motor || "",
          chasis: polizaAEditar.chasis || "",
          anio: polizaAEditar.anio || "",
          color: polizaAEditar.color || "",
          sumaAsegurada: polizaAEditar.sumaAsegurada || "",
          clausulaAjuste: polizaAEditar.clausulaAjuste || "",
          tieneRefacturacion: Boolean(polizaAEditar.tieneRefacturacion),
          frecuenciaRefacturacion: polizaAEditar.frecuenciaRefacturacion || "Mensual",
          fechaRefacturacion: polizaAEditar.fechaRefacturacion
            ? polizaAEditar.fechaRefacturacion.split("T")[0]
            : "",
          diaHabitualPago: polizaAEditar.diaHabitualPago?.toString() || "",
        });
      }
    } else {
      setFormData(ESTADO_INICIAL_POLIZA);
    }

    setErrorGlobal("");
    setErrores({});
    setPdfFile(null);
    setCuponeraFile(null);
    setScanResultado(null);
    setErrorLimitePlan("");
  }, [isOpen, polizaAEditar, isRenovacion]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
    if (errores[target.name]) {
      setErrores((prev) => ({ ...prev, [target.name]: "" }));
    }
  };

  const handleScanPdfWithAI = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setErrorGlobal("El archivo de la póliza es muy pesado. Máximo 20 MB.");
      return;
    }
    if (file.type !== "application/pdf") {
      setErrorGlobal("Solo se permiten archivos en formato PDF.");
      return;
    }

    setPdfFile(file);
    setErrorGlobal("");
    setErrorLimitePlan("");
    setScanResultado(null);
    setIsScanningPdf(true);

    try {
      const formPayload = new FormData();
      formPayload.append("pdf", file);

      const res = await apiFetch("/api/polizas/escanear-pdf", {
        method: "POST",
        body: formPayload,
      });

      const data = await res.json();

      if (res.status === 403) {
        setErrorLimitePlan(
          data.error ||
            "Tu plan actual no permite realizar más lecturas automáticas de PDF este mes."
        );
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "No se pudo leer el PDF automáticamente.");
      }

      const d = data.datos || {};
      const avisosLectura: string[] = [];

      let formaPagoMapeada = d.formaPago || "";
      if (formaPagoMapeada === "Efectivo / Pago Fácil") formaPagoMapeada = "Efectivo / Cupón";
      if (formaPagoMapeada === "Transferencia Bancaria") formaPagoMapeada = "Transferencia";

      // 1. Emparejar Asegurado (del backend o buscando localmente por DNI/CUIT o Nombre/Apellido)
      let aseguradoIdFinal = formData.aseguradoId;
      if (!isRenovacion) {
        if (d.aseguradoId) {
          aseguradoIdFinal = String(d.aseguradoId);
        } else {
          const matchCliente = buscarClienteLocal(
            clientes,
            d.asegurado?.dni,
            d.asegurado?.nombre,
            d.asegurado?.apellido
          );
          if (matchCliente) {
            aseguradoIdFinal = String(matchCliente.id);
          } else if (d.asegurado?.nombre || d.asegurado?.dni) {
            const nombreDetectado =
              `${d.asegurado?.nombre || ""} ${d.asegurado?.apellido || ""}`.trim();
            const dniDetectado = String(d.asegurado?.dni || "").replace(/[^0-9]/g, "");
            avisosLectura.push(
              `Cliente detectado en PDF: ${nombreDetectado || "Sin nombre"}${
                dniDetectado ? ` (DNI/CUIT: ${dniDetectado})` : ""
              }. No figura en tu lista, seleccionalo o crealo primero.`
            );
          }
        }
      }

      // 2. Emparejar Compañía
      let companiaIdFinal = formData.companiaId;
      if (d.companiaId) {
        companiaIdFinal = String(d.companiaId);
      } else if (d.companiaNombre) {
        const matchCompania = buscarCompaniaLocal(companias, d.companiaNombre);
        if (matchCompania) {
          companiaIdFinal = String(matchCompania.id);
        } else {
          avisosLectura.push(
            `Compañía detectada en PDF: "${d.companiaNombre}". Seleccionala manualmente en el desplegable.`
          );
        }
      }

      // 3. Calcular valores de refacturación y cuotas automáticamente
      const fechaInicioLeida = d.fechaInicio ? d.fechaInicio.split("T")[0] : "";
      const fechaRefactLeida = d.fechaRefacturacion
        ? d.fechaRefacturacion.split("T")[0]
        : fechaInicioLeida;
      const diaExtraido =
        d.diaHabitualPago ||
        (fechaRefactLeida ? String(Number(fechaRefactLeida.split("-")[2])) : "");

      setFormData((prev) => ({
        ...prev,
        aseguradoId: aseguradoIdFinal || prev.aseguradoId,
        companiaId: companiaIdFinal || prev.companiaId,
        nroPoliza: d.nroPoliza || prev.nroPoliza,
        tipoPoliza: d.tipoPoliza || prev.tipoPoliza,
        fechaInicio: fechaInicioLeida || prev.fechaInicio,
        fechaVencimiento: d.fechaVencimiento
          ? d.fechaVencimiento.split("T")[0]
          : prev.fechaVencimiento,
        cobertura: d.cobertura || prev.cobertura,
        formaPago: formaPagoMapeada || prev.formaPago,
        sumaAsegurada: d.sumaAsegurada || prev.sumaAsegurada,
        clausulaAjuste: d.clausulaAjuste || prev.clausulaAjuste,
        patente: d.patente || prev.patente,
        marca: d.marca || prev.marca,
        modelo: d.modelo || prev.modelo,
        anio: d.anio || prev.anio,
        color: d.color || prev.color,
        motor: d.motor || prev.motor,
        chasis: d.chasis || prev.chasis,
        ubicacionRiesgo: d.ubicacionRiesgo || prev.ubicacionRiesgo,
        tieneRefacturacion:
          d.tieneRefacturacion !== undefined ? Boolean(d.tieneRefacturacion) : true,
        frecuenciaRefacturacion:
          d.frecuenciaRefacturacion || prev.frecuenciaRefacturacion || "Mensual",
        fechaRefacturacion: fechaRefactLeida || prev.fechaRefacturacion,
        diaHabitualPago: diaExtraido ? String(diaExtraido) : prev.diaHabitualPago,
      }));

      setErrores({});
      setScanResultado({
        mensaje: "¡Datos autocompletados con éxito desde el PDF!",
        usos: data.uso,
        avisos: avisosLectura,
      });
    } catch (err: any) {
      setErrorGlobal(err.message || "Error al procesar el PDF con IA.");
    } finally {
      setIsScanningPdf(false);
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
          throw new Error(
            "La póliza se guardó bien, pero hubo un error al subir los archivos PDF."
          );
        }
      }

      if (isRenovacion && polizaAEditar) {
        await apiFetch(`/api/polizas/${polizaAEditar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "Renovada" }),
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center gap-2 transition-colors">
          {isRenovacion ? (
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">
              Proceso de Renovación
            </span>
          ) : polizaAEditar ? (
            "Editar Póliza"
          ) : (
            "Nueva Póliza"
          )}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
          {errorGlobal && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium transition-colors">
              {errorGlobal}
            </div>
          )}

          <PolizaScannerBanner
            isScanning={isScanningPdf}
            disabled={isLoading}
            errorLimitePlan={errorLimitePlan}
            scanResultado={scanResultado}
            onSelectFile={handleScanPdfWithAI}
            onUpgradeClick={
              setShowUpgradeModal
                ? () => {
                    onClose();
                    setShowUpgradeModal(true, errorLimitePlan);
                  }
                : undefined
            }
          />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">
              Asignación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Asegurado Titular *
                </label>
                <select
                  name="aseguradoId"
                  value={formData.aseguradoId}
                  onChange={handleChange}
                  disabled={isRenovacion}
                  className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white ${
                    errores.aseguradoId
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  } rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors`}
                >
                  <option value="" disabled className="dark:bg-gray-800">
                    -- Seleccioná un cliente --
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="dark:bg-gray-800">
                      {cliente.nombre} {cliente.apellido || ""} - {cliente.dni}
                    </option>
                  ))}
                </select>
                {errores.aseguradoId && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errores.aseguradoId}</p>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Compañía Aseguradora *
                </label>
                <select
                  name="companiaId"
                  value={formData.companiaId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white ${
                    errores.companiaId
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  } rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors`}
                >
                  <option value="" disabled className="dark:bg-gray-800">
                    -- Seleccioná una compañía --
                  </option>
                  {companias.map((compania) => (
                    <option key={compania.id} value={compania.id} className="dark:bg-gray-800">
                      {compania.nombre}
                    </option>
                  ))}
                </select>
                {errores.companiaId && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errores.companiaId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">
              Datos de la Póliza
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Número de Póliza *
                </label>
                <input
                  type="text"
                  name="nroPoliza"
                  value={formData.nroPoliza}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  className={`w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                    errores.nroPoliza
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  } rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors`}
                />
                {errores.nroPoliza && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errores.nroPoliza}</p>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Rama / Tipo
                </label>
                <select
                  name="tipoPoliza"
                  value={formData.tipoPoliza}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors"
                >
                  {RAMAS_POLIZA.map((rama) => (
                    <option key={rama} value={rama} className="dark:bg-gray-800">
                      {rama}
                    </option>
                  ))}
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
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Fecha Desde *
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio ? formData.fechaInicio.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100"
                  required
                />
                {errores.fechaInicio && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errores.fechaInicio}</p>
                )}
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Fecha Hasta (Renovación) *
                </label>
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento ? formData.fechaVencimiento.split("T")[0] : ""}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100"
                  required
                />
                {errores.fechaVencimiento && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errores.fechaVencimiento}
                  </p>
                )}
              </div>
            </div>

            <PolizaRefacturacionSection formData={formData} onChange={handleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Estado de la Póliza
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors"
                >
                  <option value="Vigente" className="dark:bg-gray-800">
                    Vigente
                  </option>
                  <option value="Pendiente de Pago" className="dark:bg-gray-800">
                    Pendiente de Pago
                  </option>
                  <option value="Anulada" className="dark:bg-gray-800">
                    Anulada
                  </option>
                  <option value="Renovada" className="dark:bg-gray-800">
                    Renovada
                  </option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Forma de Pago
                </label>
                <select
                  name="formaPago"
                  value={formData.formaPago || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-transparent text-gray-900 dark:text-white transition-colors"
                >
                  <option value="" className="dark:bg-gray-800">
                    -- Seleccionar --
                  </option>
                  {FORMAS_PAGO.map((f) => (
                    <option key={f} value={f} className="dark:bg-gray-800">
                      {f}
                    </option>
                  ))}
                  {formData.formaPago && !FORMAS_PAGO.includes(formData.formaPago) && (
                    <option value={formData.formaPago} className="dark:bg-gray-800">
                      {formData.formaPago}
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Cobertura{" "}
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    Ej: Terceros Completos
                  </span>
                </label>
                <input
                  type="text"
                  name="cobertura"
                  value={formData.cobertura}
                  onChange={handleChange}
                  placeholder="Detalle de cobertura"
                  className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Suma Asegurada
                </label>
                <input
                  type="text"
                  name="sumaAsegurada"
                  value={formData.sumaAsegurada || ""}
                  onChange={handleChange}
                  placeholder="Ej: $ 15.000.000"
                  className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                  Cláusula de Ajuste
                </label>
                <input
                  type="text"
                  name="clausulaAjuste"
                  value={formData.clausulaAjuste || ""}
                  onChange={handleChange}
                  placeholder="Ej: 20%"
                  className="w-full px-3 py-2 border bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-colors"
                />
              </div>
            </div>

            <PolizaRiesgoEspecificoSection
              formData={formData}
              errores={errores}
              onChange={handleChange}
            />

            <PolizaArchivosSection
              pdfFile={pdfFile}
              cuponeraFile={cuponeraFile}
              enviarCuponera={formData.enviarCuponera}
              existingPdfUrl={polizaAEditar?.pdfUrl}
              existingCuponeraUrl={polizaAEditar?.cuponeraUrl}
              onPdfSelect={setPdfFile}
              onCuponeraSelect={setCuponeraFile}
              onEnviarCuponeraChange={handleChange}
              onError={setErrorGlobal}
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 transition-colors bg-white dark:bg-gray-800 sticky bottom-0 z-10 p-2 -mx-2 -mb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || isScanningPdf}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <UploadCloud size={16} className="animate-bounce" />}
              {isLoading
                ? "Procesando..."
                : isRenovacion
                ? "Crear Renovación"
                : polizaAEditar
                ? "Actualizar Póliza"
                : "Guardar Póliza"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}