import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/registro" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium mb-8 transition-colors">
          <ArrowLeft size={16} /> Volver
        </Link>
        
        <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-gray-500 mb-8 font-medium">Última actualización: Junio de 2026</p>

        <div className="prose prose-green max-w-none text-gray-700 space-y-6 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar AseguraSimple (en adelante, "la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descripción del Servicio</h2>
            <p>AseguraSimple provee un software como servicio (SaaS) diseñado para facilitar la gestión administrativa de Productores Asesores de Seguros. <strong>AseguraSimple no es una compañía de seguros, ni un broker, ni comercializa pólizas directamente.</strong> Nuestro servicio se limita a proveer la infraestructura tecnológica para la gestión de su cartera.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cuentas y Suscripciones</h2>
            <p><strong>Plan Gratuito:</strong> Se encuentra estrictamente limitado a la gestión de hasta 10 clientes (asegurados). El intento de evadir este límite mediante la creación de múltiples cuentas resultará en la suspensión inmediata.</p>
            <p className="mt-2"><strong>Planes Pagos:</strong> Se abonan de forma anticipada. En caso de falta de pago, la Plataforma otorgará un período de gracia de 3 días corridos. Finalizado este plazo, la cuenta pasará a "Modo Solo Lectura", impidiendo la creación o edición de nuevos registros hasta que se regularice la situación.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Propiedad de los Datos</h2>
            <p>Usted conserva todos los derechos sobre la información y datos de sus clientes cargados en la Plataforma. AseguraSimple actúa únicamente como <em>Encargado del Tratamiento</em> de dichos datos, proveyendo el alojamiento seguro de los mismos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Disponibilidad del Servicio</h2>
            <p>AseguraSimple se esfuerza por mantener un servicio operativo 24/7. Sin embargo, no garantizamos que la Plataforma esté libre de interrupciones o errores debido a mantenimientos programados o fallas de proveedores de infraestructura en la nube (AWS, Vercel, Supabase).</p>
          </section>

          <p className="text-xs text-gray-400 mt-12 pt-8 border-t border-gray-100">
            * Este documento es un borrador estándar. Se recomienda revisión legal antes de la comercialización oficial del servicio.
          </p>
        </div>
      </div>
    </div>
  );
}