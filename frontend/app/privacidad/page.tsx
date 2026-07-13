"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200">
        
        {/* Cabecera con Logo y Botón Volver */}
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
          <ShieldCheck className="text-green-600" size={28} />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Política de Privacidad</h1>
        </div>
        <p className="text-sm text-gray-500 mb-10 font-bold uppercase tracking-wider">Última actualización: Junio de 2026</p>

        <div className="prose prose-green max-w-none text-gray-700 space-y-8 text-sm md:text-base leading-relaxed">
          <p className="font-medium text-gray-900 bg-gray-50 p-5 rounded-xl border border-gray-100">
            En AseguraSimple valoramos y protegemos la privacidad de la información. El presente documento detalla cómo recolectamos, utilizamos, almacenamos y protegemos los datos personales, en estricto cumplimiento con la <strong>Ley N° 25.326 de Protección de Datos Personales</strong> de la República Argentina y las disposiciones de la Agencia de Acceso a la Información Pública (AAIP).
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">1. Identificación del Responsable</h2>
            <p>La presente plataforma es operada por AseguraSimple. Para cualquier consulta referida al tratamiento de datos personales, los usuarios pueden comunicarse de manera directa a través del correo electrónico: <strong>privacidad@asegurasimple.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">2. Roles en el Tratamiento de Datos</h2>
            <p>En el ecosistema B2B de AseguraSimple, la normativa exige una delimitación estricta de responsabilidades:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Responsable del Tratamiento:</strong> El Productor Asesor de Seguros (PAS) o Agencia que contrata nuestro servicio es el único Responsable de la base de datos de su cartera. Él es quien recolecta la información, obtiene el consentimiento de sus asegurados y decide sobre la finalidad de los mismos.</li>
              <li><strong>Encargado del Tratamiento:</strong> AseguraSimple actúa estrictamente en calidad de Encargado. Procesamos los datos personales por cuenta y orden exclusiva del Responsable, proveyendo la infraestructura tecnológica sin tomar decisiones de fondo sobre la finalidad de dicha información.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">3. Información Recolectada y Finalidad</h2>
            <p>Recolectamos información con el propósito exclusivo de proveer el software de gestión, emitir facturación y facilitar el soporte técnico. La información incluye:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Datos del Usuario (Cuenta):</strong> Nombre completo, correo, credenciales y datos financieros requeridos para la suscripción.</li>
              <li><strong>Datos de Terceros (Asegurados):</strong> Documento Nacional de Identidad, domicilios, historial de siniestros y detalles de pólizas cargadas por el Usuario.</li>
            </ul>
            <p className="mt-3">AseguraSimple no comercializa esta información ni somete los datos a decisiones automatizadas o algoritmos de perfilamiento con efectos perjudiciales sin intervención humana.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">4. Destinatarios y Transferencia Internacional de Datos</h2>
            <p>Para garantizar una alta disponibilidad y seguridad, AseguraSimple se apoya en proveedores de infraestructura tecnológica de primer nivel (Subencargados). Esto implica la transferencia de datos hacia servidores alojados en los Estados Unidos de América.</p>
            <p className="mt-2">Nuestros proveedores incluyen: <strong>Supabase</strong> (bases de datos), <strong>Vercel y Railway</strong> (alojamiento de aplicaciones), <strong>Resend</strong> (correos transaccionales) y <strong>Mercado Pago</strong> (procesamiento de cobros locales).</p>
            <p className="mt-2">Al suscribirse a AseguraSimple, el Usuario acepta esta transferencia transfronteriza, la cual se encuentra salvaguardada jurídicamente mediante la adopción de las <strong>Cláusulas Contractuales Modelo</strong> establecidas en la Resolución N° 198/2023 de la AAIP, garantizando niveles de protección equivalentes a los exigidos por la legislación argentina.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">5. Seguridad y Plazos de Conservación</h2>
            <p>Implementamos medidas técnicas superlativas de ciberseguridad, incluyendo el cifrado de la información en reposo y en tránsito, control de accesos mediante doble factor de autenticación (2FA) y registros de auditoría (logs).</p>
            <p className="mt-2">Los datos serán almacenados únicamente durante el período de vigencia de la suscripción, sumado a los plazos legales obligatorios derivados de normativas fiscales o de prevención de lavado de activos (típicamente entre 5 y 10 años). Agotados dichos plazos, la información será suprimida de manera segura o sometida a un proceso de anonimización irreversible.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">6. Uso de Cookies y Telemetría</h2>
            <p>Nuestra plataforma emplea cookies y tecnologías similares de carácter estrictamente técnico, fundamentales para mantener la sesión activa, garantizar la seguridad del entorno y optimizar el rendimiento. El Usuario puede gestionar o bloquear estas cookies desde la configuración de su navegador; sin embargo, se advierte explícitamente que la deshabilitación de las mismas puede afectar parcial o totalmente el funcionamiento de AseguraSimple.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">7. Derechos ARCO y Autoridad de Control</h2>
            <p>Los titulares de la información poseen el derecho irrenunciable y gratuito de solicitar el Acceso, Rectificación, Actualización y Supresión de sus datos.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>El derecho de <strong>Acceso</strong> será respondido dentro de los diez (10) días corridos desde la recepción de la solicitud (garantizado en intervalos no inferiores a seis meses).</li>
              <li>Las solicitudes de <strong>Rectificación, Actualización o Supresión</strong> serán ejecutadas en un plazo máximo de cinco (5) días hábiles administrativos.</li>
            </ul>
            <p className="mt-4 p-4 bg-gray-100 rounded-lg text-sm italic font-medium border border-gray-200">
              "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}