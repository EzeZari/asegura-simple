"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Clock, MessageSquare, Shield, CarFront, CheckCircle } from "lucide-react";

export default function ConsultaPublicaPage() {
  const { token } = useParams();
  const [siniestro, setSiniestro] = useState<any>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siniestros/publico/consulta/${token}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setSiniestro(data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-4 text-gray-500">
          <Shield size={40} className="text-gray-300" />
          <p className="font-medium">Buscando expediente seguro...</p>
        </div>
      </div>
    );
  }

  if (error || !siniestro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido o expirado</h2>
          <p className="text-gray-500 text-sm">Este link de seguimiento ya no se encuentra activo por cuestiones de seguridad. Por favor, contactá a tu productor para solicitar uno nuevo.</p>
        </div>
      </div>
    );
  }

  const poliza = siniestro.poliza || {};
  const asegurado = poliza.asegurado || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Cabecera Pública */}
      <div className="bg-green-700 pt-12 pb-24 px-6 text-center text-white">
        <Shield size={40} className="mx-auto mb-4 text-green-300" />
        <h1 className="text-2xl font-black mb-1">AseguraSimple</h1>
        <p className="text-green-200 font-medium text-sm">Portal de Seguimiento de Siniestros</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 flex flex-col gap-6">
        
        {/* Tarjeta de Estado Principal */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center gap-2">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Reclamo #{siniestro.nroSiniestro}
          </span>
          <h2 className="text-2xl font-black text-gray-900">{siniestro.estadoSiniestro}</h2>
          <p className="text-gray-500 text-sm">Hola {asegurado.nombre}, acá podés ver el avance en tiempo real de tu trámite con {poliza.compania?.nombre}.</p>
        </div>

        {/* Tarjeta de Vehículo / Riesgo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest border-b border-gray-50 pb-3 mb-4">Vehículo Afectado</h3>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-2xl border border-gray-100">
              <CarFront size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900">{poliza.marca} {poliza.modelo}</p>
              <p className="text-sm text-gray-500 font-mono mt-0.5">Patente: {poliza.patente || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Línea de Tiempo (Notas) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest border-b border-gray-50 pb-3 mb-6 flex items-center gap-2">
            <MessageSquare size={16} /> Historial de Novedades
          </h3>

          <div className="flex flex-col gap-6 relative">
            {/* Línea conectora visual */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100 z-0"></div>

            {siniestro.notas?.length === 0 ? (
              <p className="text-center text-gray-400 text-sm italic py-4">Tu asesor está procesando la denuncia inicial. Pronto verás novedades aquí.</p>
            ) : (
              siniestro.notas.map((nota: any, index: number) => (
                <div key={nota.id} className="relative z-10 flex gap-4">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${index === 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {index === 0 ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(nota.fecha).toLocaleString("es-AR", { dateStyle: 'long', timeStyle: 'short' })}
                    </span>
                    <p className={`text-sm leading-relaxed ${index === 0 ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                      {nota.texto}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}