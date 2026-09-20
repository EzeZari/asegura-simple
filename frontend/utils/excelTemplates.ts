import * as XLSX from "xlsx";

export const descargarTemplatePolizas = () => {
  const template = [
    {
      "NroPoliza": "POL-001",
      "DNI_CUIT": "20123456789",
      "Compania": "Sancor Seguros",
      "Rama_Riesgo": "Automotor",
      "Estado": "Vigente",
      "VigenciaDesde": "01/01/2025",
      "VigenciaHasta": "01/01/2026",
      "Cobertura": "Responsabilidad Civil",
      "FormaPago": "Tarjeta de Crédito",
      "Patente": "ABC123",
      "Marca": "Toyota",
      "Modelo": "Corolla",
      "UbicacionRiesgo": "",
      "CantidadEmpleados": "",
    },
    {
      "NroPoliza": "POL-002",
      "DNI_CUIT": "27987654321",
      "Compania": "Zurich Seguros",
      "Rama_Riesgo": "Combinado Familiar",
      "Estado": "Pendiente de Pago",
      "VigenciaDesde": "15/03/2025",
      "VigenciaHasta": "15/03/2026",
      "Cobertura": "Todo Riesgo",
      "FormaPago": "CBU / Débito Automático",
      "Patente": "",
      "Marca": "",
      "Modelo": "",
      "UbicacionRiesgo": "Av. Siempreviva 742, Rosario",
      "CantidadEmpleados": "",
    },
    {
      "NroPoliza": "POL-003",
      "DNI_CUIT": "30456789012",
      "Compania": "Galeno ART",
      "Rama_Riesgo": "ART",
      "Estado": "Vigente",
      "VigenciaDesde": "01/06/2025",
      "VigenciaHasta": "01/06/2026",
      "Cobertura": "Ley 24557",
      "FormaPago": "Transferencia",
      "Patente": "",
      "Marca": "",
      "Modelo": "",
      "UbicacionRiesgo": "",
      "CantidadEmpleados": "8",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  ws['!cols'] = [
    { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 25 }, { wch: 18 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 18 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pólizas");
  XLSX.writeFile(wb, "template_polizas_asegurasimple.xlsx");
};