"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200">
        
        {/* Cabecera con Logo (Sombreado) y Botón Volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
          <Link href="/registro" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors w-fit bg-green-50 px-4 py-2 rounded-xl">
            <ArrowLeft size={16} /> Volver al Registro
          </Link>
          <div className="flex items-center">
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
          <Scale className="text-green-600" size={28} />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Términos y Condiciones de Uso</h1>
        </div>
        <p className="text-sm text-gray-500 mb-10 font-bold uppercase tracking-wider">Última actualización: Junio de 2026</p>

        <div className="prose prose-green max-w-none text-gray-700 space-y-8 text-sm md:text-base leading-relaxed">
          <p className="font-medium text-gray-900 bg-gray-50 p-5 rounded-xl border border-gray-100">
            El presente documento constituye un contrato legalmente vinculante (Contrato de Adhesión bajo el Art. 984 del CCCN) entre AseguraSimple y los profesionales que utilicen la plataforma. Al registrarse y tildar la casilla de aceptación, el Usuario confirma comprender y aceptar íntegramente estas estipulaciones.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">1. Naturaleza Comercial (SaaS B2B) y Exclusión de Consumo</h2>
            <p>El Usuario declara y garantiza que contrata y utiliza la plataforma AseguraSimple de manera exclusiva en su calidad de Productor Asesor de Seguros (PAS) independiente, agencia o profesional comercial, integrando el software a su proceso productivo para gestionar sus operaciones. Por consiguiente, <strong>las Partes reconocen expresamente la inexistencia de una relación de consumo, excluyendo la aplicación de la Ley N° 24.240 de Defensa del Consumidor</strong> y sometiendo este contrato a la legislación civil y comercial ordinaria.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">2. Limitación Contractual de Responsabilidad (Liability Cap)</h2>
            <p>AseguraSimple provee la plataforma en modalidad de "software como servicio" (SaaS) bajo la condición "como está" (<em>As Is</em>) y "según disponibilidad". No garantizamos que el servicio será ininterrumpido, infalible o estará exento de caídas sistémicas.</p>
            <p className="mt-2 text-red-700 font-medium">AseguraSimple se exime expresamente de cualquier responsabilidad patrimonial frente al Usuario o terceros por lucro cesante, pérdida de chance comercial, pérdida de ventas o de datos derivados de interrupciones del servicio. El Usuario asume la carga de mantener copias de respaldo (backups) de su información.</p>
            <p className="mt-2">En el hipotético caso en que se decrete judicialmente responsabilidad patrimonial por parte de AseguraSimple (excluyendo dolo), la indemnización máxima acumulada quedará estrictamente limitada al monto total efectivamente abonado por el Usuario en concepto de suscripciones durante los seis (6) meses previos al evento dañoso.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">3. Facturación, Régimen Cambiario y Renuncia al Art. 765 CCCN</h2>
            <p>La tarifa de suscripción mensual se encuentra fijada nominalmente en Dólares Estadounidenses (USD) para preservar la intangibilidad del servicio tecnológico. El Usuario reconoce que la fijación en dicha moneda extranjera es un componente esencial del contrato.</p>
            <p className="mt-2 font-bold text-gray-900">En uso de la autonomía de la voluntad, el Usuario renuncia de forma expresa e irrevocable a las facultades conferidas por el Artículo 765 del Código Civil y Comercial de la Nación, comprometiéndose a no invocar la pesificación al tipo de cambio oficial.</p>
            <p className="mt-2">El pago se procesará a través de Mercado Pago en Pesos Argentinos (ARS), aplicando AseguraSimple un tipo de cambio financiero legal, libre y de referencia (como el Dólar MEP o CCL) al cierre del día hábil anterior a la facturación.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">4. Pagos y Suscripciones Recurrentes</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>El método de pago asociado a la suscripción mediante Mercado Pago debe ser ineludiblemente una tarjeta de débito o crédito bancaria. El uso exclusivo de "dinero en cuenta" puede generar la expiración anticipada del token de cobro tras 30 días, derivando en la cancelación automática del plan por parte de la pasarela.</li>
              <li>Ante la falta de pago tras los reintentos automáticos configurados por Mercado Pago, la plataforma aplicará un período de gracia de tres (3) días. Vencido este plazo, la cuenta pasará a modalidad "Solo Lectura", inhabilitando operaciones operativas hasta regularizar la situación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">5. Descargo Operativo: Rúbrica Digital (SSN)</h2>
            <p>AseguraSimple provee un módulo para la generación y exportación de archivos (formatos XML/TXT) compatibles con los estándares de la Superintendencia de Seguros de la Nación (SSN) para la Rúbrica Digital de Productores.</p>
            <p className="mt-2"><strong>El Usuario entiende y acepta que AseguraSimple únicamente provee el archivo informático.</strong> La responsabilidad indelegable de ingresar al sistema de la AFIP, validar la estructura, realizar las liquidaciones y presentar los registros dentro del plazo legal exigido recae exclusivamente sobre el Productor. AseguraSimple no responderá frente a multas, suspensiones o inhabilitaciones de matrícula impuestas por la SSN derivadas de omisiones, retrasos o errores en las presentaciones efectuadas por el PAS.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">6. Cláusula de Indemnidad</h2>
            <p>El Usuario se obliga irrevocablemente a mantener indemne a AseguraSimple, a sus directores, empleados y proveedores de infraestructura, frente a cualquier reclamo, demanda civil, administrativa o penal interpuesta por terceros (incluyendo asegurados finales o autoridades de control) que tenga como causa el uso indebido de la plataforma, la carga de datos sin el consentimiento legal, o el incumplimiento de sus deberes profesionales como Productor de Seguros.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">7. Jurisdicción y Ley Aplicable</h2>
            <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República Argentina. Cualquier controversia será sometida a la jurisdicción exclusiva de los Tribunales Ordinarios de la ciudad de Rosario, Provincia de Santa Fe, renunciando las partes a cualquier otro fuero que pudiera corresponderles.</p>
          </section>
        </div>
      </div>
    </div>
  );
}