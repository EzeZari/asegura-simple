import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Le prohibimos a los bots intentar entrar a las rutas privadas
      disallow: [
        '/inicio/',
        '/polizas/',
        '/asegurados/',
        '/siniestros/',
        '/configuracion/',
        '/alertas/',
        '/estadisticas/',
        '/admin/',
      ],
    },
    // ¡Acá le decimos a Google dónde está tu sitemap automáticamente!
    sitemap: 'https://www.asegurasimple.com/sitemap.xml',
  };
}