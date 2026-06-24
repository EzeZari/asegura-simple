import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/registro" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-8 transition-colors">
          <ArrowLeft size={16} /> Volver
        </Link>
        
        <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8 font-medium">Última actualización: Junio de 2026</p>

        <div className="prose prose-green max-w-none text-gray-700 space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Marco Legal</h2>
            <p>El tratamiento de datos personales llevado a cabo por AseguraSimple se ajusta a las normativas de la República Argentina, específicamente a la <strong>Ley 25.326 de Protección de Datos Personales</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Rol de AseguraSimple</h2>
            <p>AseguraSimple actúa en calidad de <strong>Encargado del Tratamiento</strong> (Procesador). El Productor Asesor de Seguros que contrata nuestro servicio es el <strong>Responsable del Tratamiento</strong> de los datos de sus clientes. AseguraSimple no utiliza los datos de los asegurados finales para fines propios, marketing, ni los comparte con terceros.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Datos que recolectamos</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Del Titular de la Cuenta (Productor):</strong> Nombre, email, teléfono, datos de facturación e IPs de conexión para auditoría de seguridad.</li>
              <li><strong>De los Asegurados (Terceros):</strong> Datos identificatorios (DNI), de contacto y detalles patrimoniales (patentes, inmuebles) cargados exclusivamente por el Productor.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Seguridad y Almacenamiento</h2>
            <p>Los datos son almacenados en servidores seguros con cifrado estándar de la industria. Las contraseñas se almacenan mediante algoritmos de hash criptográfico unidereccional (Bcrypt), haciendo imposible su lectura por parte de nuestro equipo.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Uso de Cookies</h2>
            <p>Utilizamos cookies estrictamente necesarias para mantener la sesión abierta, garantizar la seguridad de la cuenta y prevenir ataques tipo CSRF. No utilizamos cookies invasivas de rastreo publicitario de terceros.</p>
          </section>

          <p className="text-xs text-gray-400 mt-12 pt-8 border-t border-gray-100">
            * Este documento es un borrador estándar. Se recomienda revisión legal antes de la comercialización oficial del servicio.
          </p>
        </div>
      </div>
    </div>
  );
}