import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 text-center border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        {/* 🔥 Logo en el Footer limpio */}
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="AseguraSimple" 
            width={200} 
            height={56} 
            className="drop-shadow-xl opacity-90 h-12 w-auto mx-auto"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium">
          <Link href="#funcionalidades" className="hover:text-green-400 transition-colors">Funcionalidades</Link>
          <Link href="#precios" className="hover:text-green-400 transition-colors">Precios</Link>
          <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
          <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
        </div>
        
        <p className="text-sm">© {new Date().getFullYear()} AseguraSimple · Hecho en Argentina 🇦🇷</p>
      </div>
    </footer>
  );
}