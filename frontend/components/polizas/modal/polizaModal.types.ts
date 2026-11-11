export interface PolizaFormData {
  nroPoliza: string;
  tipoPoliza: string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
  formaPago: string;
  cobertura: string;
  aseguradoId: string;
  companiaId: string;
  patente: string;
  marca: string;
  modelo: string;
  ubicacionRiesgo: string;
  cantidadEmpleados: string;
  enviarCuponera: boolean;
  motor: string;
  chasis: string;
  anio: string;
  color: string;
  sumaAsegurada: string;
  clausulaAjuste: string;
  tieneRefacturacion: boolean;
  frecuenciaRefacturacion: string;
  fechaRefacturacion: string;
  diaHabitualPago: string;
}

export interface ScanUsoInfo {
  escaneosUsados: number;
  limitePlan: number;
  restantes: number;
  plan: string;
}

export interface ScanResultado {
  mensaje: string;
  usos?: ScanUsoInfo;
  avisos: string[];
}

export const ESTADO_INICIAL_POLIZA: PolizaFormData = {
  nroPoliza: "",
  tipoPoliza: "Automotor",
  fechaInicio: "",
  fechaVencimiento: "",
  estado: "Vigente",
  formaPago: "",
  cobertura: "",
  aseguradoId: "",
  companiaId: "",
  patente: "",
  marca: "",
  modelo: "",
  ubicacionRiesgo: "",
  cantidadEmpleados: "",
  enviarCuponera: false,
  motor: "",
  chasis: "",
  anio: "",
  color: "",
  sumaAsegurada: "",
  clausulaAjuste: "",
  tieneRefacturacion: false,
  frecuenciaRefacturacion: "Mensual",
  fechaRefacturacion: "",
  diaHabitualPago: "",
};

export const FORMAS_PAGO = [
  "Tarjeta de Crédito",
  "Tarjeta de Débito",
  "CBU / Débito Automático",
  "Efectivo / Cupón",
  "Transferencia",
];

export const RAMAS_POLIZA = [
  "Accidentes personales",
  "ART",
  "Automotor",
  "Cascos",
  "Caución",
  "Combinado familiar",
  "Ecomovilidad",
  "Incendio",
  "Integral para comercio",
  "Motovehículo",
  "Responsabilidad civil",
  "Robo",
  "Seguro técnico",
  "Transporte",
  "Vida colectivo",
  "Vida individual",
  "Vida simple",
];

export const normalizarTexto = (texto: string): string =>
  String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const buscarClienteLocal = (
  clientes: any[],
  dniExtraido?: string,
  nombreExtraido?: string,
  apellidoExtraido?: string
) => {
  const dniLimpio = String(dniExtraido || "").replace(/[^0-9]/g, "");
  const dniCentralCuit = dniLimpio.length === 11 ? dniLimpio.substring(2, 10) : dniLimpio;

  if (dniLimpio) {
    const porDni = clientes.find((c) => {
      const cDni = String(c.dni || "").replace(/[^0-9]/g, "");
      return (
        cDni &&
        (cDni.includes(dniLimpio) ||
          cDni.includes(dniCentralCuit) ||
          dniLimpio.includes(cDni))
      );
    });
    if (porDni) return porDni;
  }

  const nombreCompletoPdf = normalizarTexto(`${nombreExtraido || ""} ${apellidoExtraido || ""}`);
  if (nombreCompletoPdf.length >= 3) {
    return (
      clientes.find((c) => {
        const nom = normalizarTexto(c.nombre);
        const ape = normalizarTexto(c.apellido);
        if (nom && ape) {
          return nombreCompletoPdf.includes(nom) && nombreCompletoPdf.includes(ape);
        }
        return nom && nombreCompletoPdf.includes(nom);
      }) || null
    );
  }

  return null;
};

export const buscarCompaniaLocal = (companias: any[], companiaExtraida?: string) => {
  const buscada = normalizarTexto(companiaExtraida || "");
  if (!buscada) return null;

  return (
    companias.find((c) => {
      const cia = normalizarTexto(c.nombre);
      return cia && (cia.includes(buscada) || buscada.includes(cia));
    }) || null
  );
};