export const generarLinkWhatsApp = (poliza: any, plantilla: string) => {
  const telefono = poliza?.asegurado?.telefono || "";
  const numeroLimpio = telefono.replace(/\D/g, '');
  const fecha = poliza?.fechaVencimiento ? new Date(poliza.fechaVencimiento).toLocaleDateString("es-AR") : "";
  const datoPatente = poliza?.patente ? `(Patente: ${poliza.patente.toUpperCase()})` : "";

  // Si por algún motivo llega vacía, usamos esta por defecto
  const templateSegura = plantilla || "Hola [Nombre], te avisamos que tu póliza de [Rama] ([NroPoliza]) en [Compania] vence el próximo [Vencimiento].";

  const mensaje = templateSegura
    .replace(/\[Nombre\]/g, poliza?.asegurado?.nombre || "")
    .replace(/\[Compania\]/g, poliza?.compania?.nombre || "")
    .replace(/\[NroPoliza\]/g, poliza?.nroPoliza || "")
    .replace(/\[Vencimiento\]/g, fecha)
    .replace(/\[Rama\]/g, poliza?.tipoPoliza || "")
    .replace(/\[Patente\]/g, datoPatente);

  // Si tiene número abre su chat directo, sino abre WhatsApp general para que elijas el contacto
  const urlBase = numeroLimpio ? `https://wa.me/${numeroLimpio}` : `https://wa.me/`;
  return `${urlBase}?text=${encodeURIComponent(mensaje)}`;
};