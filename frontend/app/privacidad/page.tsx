import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200">
        
        {/* Cabecera con Logo (Sombreado) y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
          <Link href="/registro" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors w-fit bg-green-50 px-4 py-2 rounded-xl">
            <ArrowLeft size={16} /> Volver al Registro
          </Link>
          <div className="flex items-center">
            {/* 🔥 Logo ampliado y con sombra para que el texto blanco resalte */}
            <Image 
              src="/logo.png" 
              alt="AseguraSimple Logo" 
              width={180} 
              height={45} 
              className="object-contain drop-shadow-md" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-green-600" size={28} />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Política de Privacidad</h1>
        </div>
        <p className="text-sm text-gray-500 mb-10 font-bold uppercase tracking-wider">Última actualización: Junio de 2026</p>

        <div className="prose prose-green max-w-none text-gray-700 space-y-8 text-sm md:text-base leading-relaxed">
          <p className="font-medium text-gray-900 bg-gray-50 p-5 rounded-xl border border-gray-100">
            En AseguraSimple valoramos y protegemos la privacidad de la información. El presente documento detalla cómo recolectamos, utilizamos, almacenamos y protegemos los datos personales, en estricto cumplimiento con la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la República Argentina y las disposiciones de la Agencia de Acceso a la Información Pública (AAIP).
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">1. Roles en el Tratamiento de Datos</h2>
            <p>Es fundamental establecer la naturaleza jurídica de las partes involucradas:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Responsable del Tratamiento:</strong> El Usuario (Productor o Agencia) es el único Responsable de las bases de datos de sus clientes. Él determina la finalidad y los medios del tratamiento de la información de los asegurados.</li>
              <li><strong>Encargado del Tratamiento:</strong> AseguraSimple actúa exclusivamente como Encargado. Nuestra labor se limita a proveer la infraestructura tecnológica (software) para el alojamiento y gestión de dichos datos, obrando siempre bajo las instrucciones del Responsable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">2. Información Recolectada</h2>
            <p>Recolectamos dos categorías principales de información:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Datos del Usuario (Cuenta):</strong> Nombre completo, correo electrónico, número de teléfono, datos de facturación e identificadores de dispositivos/IP utilizados para garantizar la seguridad del acceso.</li>
              <li><strong>Datos de Terceros (Asegurados):</strong> Información cargada por el Usuario en la plataforma, la cual puede incluir Documento Nacional de Identidad (DNI/CUIT), domicilios, detalles de bienes patrimoniales (patentes, vehículos, inmuebles) e historial de siniestros. AseguraSimple no asume responsabilidad sobre la legitimidad de la recolección inicial de estos datos por parte del Productor.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">3. Finalidad del Uso de los Datos</h2>
            <p>Los datos almacenados son utilizados de manera exclusiva para <strong>garantizar la prestación, mantenimiento y mejora del servicio contratado</strong>. AseguraSimple asume el compromiso ético y legal de <strong>no vender, alquilar, ceder ni compartir</strong> la cartera de clientes, cotizaciones o pólizas del Usuario con compañías aseguradoras, competidores o agencias de marketing de terceros.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">4. Seguridad de la Información</h2>
            <p>Implementamos medidas técnicas y organizativas rigurosas para prevenir la alteración, pérdida o acceso no autorizado a la información. Las contraseñas de los usuarios son resguardadas mediante algoritmos de cifrado unidireccional (hashing), impidiendo su visualización incluso para el personal técnico de AseguraSimple. Los documentos adjuntos (pólizas en formato PDF) son alojados en contenedores de almacenamiento en la nube con acceso restringido.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">5. Uso de Cookies y Tecnologías Similares</h2>
            <p>La Plataforma emplea "cookies" estrictamente necesarias (tokens de sesión) para autenticar a los usuarios, evitar fraudes y mantener la seguridad del entorno de trabajo. No se utilizan cookies de rastreo publicitario intrusivo (third-party tracking cookies) en el panel de control del Usuario.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">6. Derechos de los Titulares (ARCO)</h2>
            <p>De conformidad con la legislación vigente, los titulares de los datos tienen derecho a solicitar el Acceso, Rectificación, Cancelación u Oposición respecto de sus datos personales. Cuando un asegurado final desee ejercer estos derechos, deberá dirigir su solicitud directamente al Productor de Seguros (Responsable del Tratamiento). AseguraSimple colaborará técnicamente para que el Usuario pueda dar cumplimiento a dichos requerimientos legales.</p>
          </section>
        </div>
      </div>
    </div>
  );
}