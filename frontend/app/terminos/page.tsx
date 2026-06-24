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
          <Scale className="text-green-600" size={28} />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Términos y Condiciones de Uso</h1>
        </div>
        <p className="text-sm text-gray-500 mb-10 font-bold uppercase tracking-wider">Última actualización: Junio de 2026</p>

        <div className="prose prose-green max-w-none text-gray-700 space-y-8 text-sm md:text-base leading-relaxed">
          <p className="font-medium text-gray-900 bg-gray-50 p-5 rounded-xl border border-gray-100">
            El presente documento establece las condiciones mediante las cuales los usuarios (en adelante, "el Usuario", "el Productor" o "la Agencia") podrán acceder y utilizar la plataforma de software como servicio provista por AseguraSimple (en adelante, "la Plataforma"). Al crear una cuenta, el Usuario acepta someterse a estos términos en su totalidad.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">1. Naturaleza del Servicio</h2>
            <p>AseguraSimple es una solución tecnológica (SaaS) destinada a facilitar la gestión administrativa, operativa y de cartera de Productores Asesores de Seguros. <strong>AseguraSimple no es una compañía aseguradora, ni un broker, ni comercializa pólizas de seguro, ni interviene en la relación contractual entre el Productor y sus clientes finales.</strong> La responsabilidad por el asesoramiento, emisión, cobranza y liquidación de siniestros recae exclusiva y excluyentemente sobre el Usuario y/o las compañías aseguradoras correspondientes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">2. Registro y Seguridad de la Cuenta</h2>
            <p>El Usuario se compromete a proporcionar información veraz, actual y completa durante el proceso de registro. Es responsabilidad exclusiva del Usuario mantener la confidencialidad de sus credenciales de acceso. AseguraSimple no será responsable por ninguna pérdida o daño derivado del acceso no autorizado a la cuenta del Usuario como consecuencia de la negligencia en la custodia de sus contraseñas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">3. Planes, Facturación y Períodos de Gracia</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Plan Gratuito:</strong> Está estrictamente limitado a la gestión de un máximo de diez (10) clientes/asegurados. La creación de múltiples cuentas vinculadas a un mismo Productor para evadir este límite constituye una violación de estos términos y resultará en la baja definitiva del servicio.</li>
              <li><strong>Suscripciones Pagas:</strong> Se abonan de manera anticipada. Ante la falta de pago, la Plataforma otorgará un período de gracia automático de tres (3) días corridos. Finalizado dicho plazo, la cuenta adoptará la modalidad de "Solo Lectura", inhabilitando la creación o modificación de registros hasta la regularización de la deuda.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">4. Propiedad Intelectual e Información</h2>
            <p>AseguraSimple retiene todos los derechos, títulos e intereses (incluyendo derechos de autor, marcas y patentes) sobre el código fuente, diseño, bases de datos y algoritmos de la Plataforma. Por su parte, <strong>el Usuario conserva la propiedad absoluta e intransferible sobre todos los datos, clientes y pólizas que ingrese al sistema.</strong> AseguraSimple no retendrá ni comercializará la cartera de clientes del Usuario bajo ninguna circunstancia.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">5. Niveles de Servicio y Limitación de Responsabilidad</h2>
            <p>Si bien AseguraSimple emplea infraestructura en la nube de alta disponibilidad, el servicio se provee "tal cual es" (as is). No garantizamos que el funcionamiento sea ininterrumpido o libre de errores. En ningún caso AseguraSimple será responsable por lucro cesante, pérdida de ventas, pérdida de datos o daños indirectos derivados de caídas del servidor, fallas de conectividad o causas de fuerza mayor.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">6. Jurisdicción y Ley Aplicable</h2>
            <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República Argentina. Cualquier controversia derivada de la aplicación, interpretación o ejecución de este contrato, será sometida a la jurisdicción de los Tribunales Ordinarios de la ciudad de Rosario, Provincia de Santa Fe, renunciando las partes a cualquier otro fuero que pudiera corresponderles.</p>
          </section>
        </div>
      </div>
    </div>
  );
}