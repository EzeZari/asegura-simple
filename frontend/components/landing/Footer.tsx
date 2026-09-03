import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 text-center border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="AseguraSimple" 
            width={200} 
            height={56} 
            className="drop-shadow-xl opacity-90 h-12 w-auto mx-auto"
          />
        </div>
        
        {/* Links útiles */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium">
          <Link href="/#funcionalidades" className="hover:text-green-400 transition-colors">Funcionalidades</Link>
          <Link href="/#precios" className="hover:text-green-400 transition-colors">Precios</Link>
          <Link href="/contacto" className="hover:text-green-400 transition-colors">Contacto</Link>
          <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
          <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
        </div>
        
        {/* 🔥 Redes Sociales (Con SVG nativo a prueba de fallos) */}
        <div className="flex justify-center gap-4 mb-8">
          
          {/* Facebook (Relleno) */}
          <a 
            href="https://www.facebook.com/people/AseguraSimple/61594177975007/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-colors p-2"
            aria-label="Seguinos en Facebook"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
            >
              <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a 
            href="https://www.instagram.com/asegurasimple/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-colors p-2"
            aria-label="Seguinos en Instagram"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
          </a>

          {/* TikTok */}
          <a 
            href="https://www.tiktok.com/@asegura_simple" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-green-400 transition-colors p-2"
            aria-label="Seguinos en TikTok"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 448 512" 
              fill="currentColor"
              className="mt-0.5" /* Un pequeño margen para alinearlo perfecto con el de Instagram */
            >
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
            </svg>
          </a>
        </div>
        
        <p className="text-sm">© {new Date().getFullYear()} AseguraSimple · Hecho en Argentina 🇦🇷</p>
      </div>
    </footer>
  );
}