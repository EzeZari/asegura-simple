export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.asegurasimple.com/#organization",
        "name": "AseguraSimple",
        "url": "https://www.asegurasimple.com/",
        "logo": "https://www.asegurasimple.com/logo.png",
        "description": "Sistema de gestión en la nube para productores asesores de seguros (PAS) de Argentina.",
        "areaServed": { "@type": "Country", "name": "Argentina" },
        "sameAs": [
          "https://www.facebook.com/people/AseguraSimple/61594177975007/",
          "https://www.instagram.com/asegurasimple/",
          "https://www.tiktok.com/@asegura_simple"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.asegurasimple.com/#website",
        "url": "https://www.asegurasimple.com/",
        "name": "AseguraSimple",
        "inLanguage": "es-AR",
        "publisher": { "@id": "https://www.asegurasimple.com/#organization" }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://www.asegurasimple.com/#software",
        "name": "AseguraSimple",
        "url": "https://www.asegurasimple.com/",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "inLanguage": "es-AR",
        "description": "Sistema de gestión para productores de seguros: centraliza la cartera, controla vencimientos, gestiona cobranzas y envía alertas por WhatsApp y correo. Carga pólizas desde un PDF con inteligencia artificial.",
        "featureList": [
          "Carga de pólizas desde PDF con inteligencia artificial",
          "Módulo de refacturación y cobranzas",
          "Calendario inteligente de vencimientos",
          "Panel de métricas de la cartera",
          "Ficha 360º de cada póliza",
          "Avisos por WhatsApp en 1 clic",
          "Correos electrónicos con plantillas",
          "Importación de cartera desde Excel"
        ],
        "publisher": { "@id": "https://www.asegurasimple.com/#organization" },
        "offers": [
          {
            "@type": "Offer",
            "name": "Prueba",
            "description": "14 días gratis. Hasta 10 asegurados, 1 usuario administrador y módulo de cobranzas.",
            "price": "0",
            "priceCurrency": "ARS",
            "url": "https://www.asegurasimple.com/registro"
          },
          {
            "@type": "Offer",
            "name": "Básico",
            "description": "Por mes. Hasta 100 asegurados, 1 usuario administrador, módulo de cobranzas y 25 lecturas de PDF con IA.",
            "price": "9990",
            "priceCurrency": "ARS",
            "url": "https://www.asegurasimple.com/registro"
          },
          {
            "@type": "Offer",
            "name": "Profesional",
            "description": "Por mes. Hasta 300 asegurados, hasta 3 usuarios, importación masiva de Excel y 50 lecturas de PDF con IA.",
            "price": "14990",
            "priceCurrency": "ARS",
            "url": "https://www.asegurasimple.com/registro"
          },
          {
            "@type": "Offer",
            "name": "Agencia",
            "description": "Por mes. Asegurados ilimitados, hasta 10 usuarios, permisos avanzados y 200 lecturas de PDF con IA.",
            "price": "24990",
            "priceCurrency": "ARS",
            "url": "https://www.asegurasimple.com/registro"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.asegurasimple.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Mis datos y los de mis clientes están seguros?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La seguridad de tu cartera es nuestra prioridad absoluta. Operamos bajo estándares bancarios para proteger tu información: servidores encriptados de alta seguridad y backups diarios automáticos. La información es 100% tuya: podés exportarla o eliminarla en cualquier momento."
            }
          },
          {
            "@type": "Question",
            "name": "¿Puedo importar mi cartera actual desde un Excel?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí. Desarrollamos una herramienta de importación masiva inteligente. Solo tenés que subir tu archivo Excel y el sistema crea las fichas de los clientes y ordena la información de forma automática. En menos de 5 minutos tenés todo el sistema listo para operar."
            }
          },
          {
            "@type": "Question",
            "name": "¿Tienen soporte técnico si no entiendo algo?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí. Tendrás acceso a un Chat de Soporte Integrado directamente dentro de la plataforma para resolver cualquier duda al instante con nuestro equipo."
            }
          },
          {
            "@type": "Question",
            "name": "¿Funciona correctamente desde el celular?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí, AseguraSimple es una plataforma responsiva: la interfaz se adapta a la pantalla de cualquier dispositivo móvil o tablet. Podés consultar una póliza, agendar un vencimiento o cargar un siniestro desde tu celular mientras estás en la calle visitando a un cliente."
            }
          },
          {
            "@type": "Question",
            "name": "¿Qué pasa si decido cancelar mi suscripción?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No hay contratos a largo plazo, cláusulas de permanencia ni letras chicas. Si dejás de usar el sistema premium, tu cuenta pasa automáticamente al plan gratuito, o podés darla de baja por completo. Te recomendamos exportar tu información en Excel antes de hacerlo."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}