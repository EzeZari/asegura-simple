import * as XLSX from "xlsx";

// 1. Template para Pólizas
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

// 2. Template para Asegurados (Todos los campos)
export const descargarTemplateAsegurados = () => {
  const template = [
    {
      "Nombre": "Juan",
      "Apellido": "Pérez",
      "DNI_CUIT": "20321112224",
      "Tipo": "Individuo",
      "FechaNacimiento": "15/05/1988",
      "CondicionIVA": "Consumidor Final",
      "Telefono": "341555666",
      "Email": "juan.perez@email.com",
      "Direccion": "Av. San Martín 1234, Rosario",
      "CodigoPostal": "2000"
    },
    {
      "Nombre": "Distribuidora del Litoral SRL",
      "Apellido": "",
      "DNI_CUIT": "30559991145",
      "Tipo": "Empresa",
      "FechaNacimiento": "",
      "CondicionIVA": "Responsable Inscripto",
      "Telefono": "341444888",
      "Email": "administracion@distribuidora.com",
      "Direccion": "Bv. Oroño 550, Rosario",
      "CodigoPostal": "2000"
    },
    {
      "Nombre": "María Laura",
      "Apellido": "Gómez",
      "DNI_CUIT": "27359998881",
      "Tipo": "Individuo",
      "FechaNacimiento": "22/10/1992",
      "CondicionIVA": "Monotributo",
      "Telefono": "341222333",
      "Email": "marialaura@gmail.com",
      "Direccion": "Pellegrini 850, Rosario",
      "CodigoPostal": "2000"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  ws['!cols'] = [
    { wch: 26 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 16 },
    { wch: 22 }, { wch: 16 }, { wch: 30 }, { wch: 32 }, { wch: 14 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Asegurados");
  XLSX.writeFile(wb, "template_asegurados_asegurasimple.xlsx");
};