"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Props {
  alertas: any[];
}

export default function AlertaCalendar({ alertas }: Props) {
  const router = useRouter(); 
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<any>("month");

  const eventos = useMemo(() => {
    return alertas.map(poliza => {
      const fecha = new Date(poliza.fechaVencimiento);
      
      const hoy = new Date().getTime();
      const diff = Math.ceil((fecha.getTime() - hoy) / (1000 * 60 * 60 * 24));
      
      let nivel = "proxima";
      if (diff < 0) nivel = "vencida";
      else if (diff <= 7) nivel = "critica"; 

      const nombreCompleto = `${poliza.asegurado?.nombre || ""} ${poliza.asegurado?.apellido || ""}`.trim();
      const companiaCorta = poliza.compania?.nombre || 'S/C';

      let detalleVehiculo = "";
      if ((poliza.tipoPoliza === "Automotor" || poliza.tipoPoliza === "Motovehículo") && (poliza.marca || poliza.patente)) {
        detalleVehiculo = ` (${poliza.marca || ''} ${poliza.modelo || ''} - ${poliza.patente || 'S/P'})`.replace(/\s+/g, ' ').trim();
      }

      const textoDias = diff < 0 ? `Venció hace ${Math.abs(diff)} días` : diff === 0 ? 'Vence HOY' : `Faltan ${diff} días`;

      const tooltipInfo = `Cliente: ${nombreCompleto}\nRamo: ${poliza.tipoPoliza}${detalleVehiculo}\nCompañía: ${poliza.compania?.nombre || 'Sin Compañía'}\nPóliza: #${poliza.nroPoliza}\nEstado: ${textoDias}`;

      return {
        id: poliza.id,
        title: `${nombreCompleto} - ${companiaCorta}`, // Respetamos: Nombre Apellido - Compañía
        tooltip: tooltipInfo, 
        start: fecha,
        end: fecha,
        allDay: true,
        resource: nivel,
        polizaId: poliza.id 
      };
    });
  }, [alertas]);

  // 🔥 AHORA ASIGNAMOS CLASES EN LUGAR DE ESTILOS INLINE
  // Esto nos permite controlar cómo se ve en el Mes (fuerte) vs la Agenda (suave)
  const eventStyleGetter = (event: any) => {
    let claseNivel = "event-proxima"; 
    if (event.resource === "vencida") claseNivel = "event-vencida"; 
    if (event.resource === "critica") claseNivel = "event-critica"; 

    return {
      className: `${claseNivel} border-none rounded shadow-sm cursor-pointer`
    };
  };

  const CustomEvent = ({ event }: any) => {
    return (
      <div title={event.tooltip} className="w-full h-full flex flex-col justify-center truncate">
        <span>{event.title}</span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors h-[700px] w-full animate-in fade-in duration-300">
      <style jsx global>{`
        .rbc-calendar { font-family: inherit; }
        
        /* 🔥 BORDES Y FONDOS GENERALES */
        .rbc-header { padding: 10px; font-weight: 700; text-transform: uppercase; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
        .dark .rbc-header { border-bottom-color: #374151; color: #9ca3af; }
        .rbc-month-view, .rbc-month-row, .rbc-day-bg { border-color: #e5e7eb; }
        .dark .rbc-month-view, .dark .rbc-month-row, .dark .rbc-day-bg { border-color: #374151; }
        .rbc-off-range-bg { background-color: #f9fafb; }
        .dark .rbc-off-range-bg { background-color: #111827; }
        .rbc-today { background-color: #f0fdf4; } 
        .dark .rbc-today { background-color: #064e3b; }
        
        /* 🔥 1. SOLUCIÓN A LOS BOTONES (Textos e íconos legibles en modo oscuro) */
        .rbc-toolbar button { border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: #374151; border-color: #d1d5db; }
        .dark .rbc-toolbar button { color: #d1d5db; border-color: #4b5563; }
        .rbc-toolbar button:hover { background-color: #f3f4f6; }
        .dark .rbc-toolbar button:hover { background-color: #374151; }
        .rbc-active { background-color: #15803d !important; color: white !important; border-color: #15803d !important; }
        
        /* 🔥 2. ESTILOS DE LOS EVENTOS EN VISTA "MES" (SÓLIDOS) */
        .rbc-event { transition: transform 0.1s ease-in-out; font-size: 10px; font-weight: bold; padding: 2px 5px; }
        .rbc-event:hover { transform: scale(1.02); z-index: 10; }
        .rbc-month-view .event-vencida { background-color: #e11d48; color: white; }
        .rbc-month-view .event-critica { background-color: #f97316; color: white; }
        .rbc-month-view .event-proxima { background-color: #22c55e; color: white; }

        /* 🔥 3. ESTILOS DE LOS EVENTOS EN VISTA "AGENDA" (SUAVES Y ELEGANTES) */
        .rbc-agenda-view table { border-color: #e5e7eb; }
        .dark .rbc-agenda-view table { border-color: #374151; }
        .rbc-agenda-view table thead > tr > th { border-bottom: 1px solid #e5e7eb; color: #6b7280; padding: 10px; }
        .dark .rbc-agenda-view table thead > tr > th { border-bottom-color: #374151; color: #9ca3af; }
        .rbc-agenda-view table tbody > tr > td { border-color: #e5e7eb; padding: 12px 8px; }
        .dark .rbc-agenda-view table tbody > tr > td { border-color: #374151; }
        .dark .rbc-agenda-date-cell { color: #e5e7eb; font-weight: 600; }
        .dark .rbc-agenda-time-cell { color: #9ca3af; }
        
        /* Modo Claro - Filas de Agenda (Pastel) */
        .rbc-agenda-view tbody tr.event-vencida { background-color: #fff1f2; color: #9f1239; }
        .rbc-agenda-view tbody tr.event-critica { background-color: #fff7ed; color: #9a3412; }
        .rbc-agenda-view tbody tr.event-proxima { background-color: #f0fdf4; color: #166534; }
        
        /* Modo Oscuro - Filas de Agenda (Translucidas) */
        .dark .rbc-agenda-view tbody tr.event-vencida { background-color: rgba(225, 29, 72, 0.15); color: #fda4af; }
        .dark .rbc-agenda-view tbody tr.event-critica { background-color: rgba(249, 115, 22, 0.15); color: #fdba74; }
        .dark .rbc-agenda-view tbody tr.event-proxima { background-color: rgba(34, 197, 94, 0.15); color: #86efac; }
      `}</style>

      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="es"
        date={currentDate} 
        onNavigate={(newDate) => setCurrentDate(newDate)} 
        view={currentView} 
        onView={(newView) => setCurrentView(newView)} 
        onSelectEvent={(event) => router.push(`/polizas/${event.polizaId}`)} 
        components={{
          event: CustomEvent 
        }}
        messages={{
          next: "Sig",
          previous: "Ant",
          today: "Hoy",
          month: "Mes",
          agenda: "Agenda", 
          date: "FECHA",
          time: "HORA",
          event: "PÓLIZA",
          noEventsInRange: "No hay vencimientos en este período.",
          allDay: "Todo el día" // 🔥 SOLUCIÓN A "all day"
        }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'agenda']} 
      />
    </div>
  );
}