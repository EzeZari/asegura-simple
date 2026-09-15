import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
// import SocialProof from '@/components/landing/SocialProof';
import Problems from '@/components/landing/Problems';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
// import HowItWorks from '@/components/landing/HowItWorks';
import FAQ from '@/components/landing/FAQ';
import CtaFinal from '@/components/landing/CtaFinal';
import Footer from '@/components/landing/Footer';

// 🔥 Metadatos SEO específicos para la Landing Page
export const metadata: Metadata = {
  title: 'AseguraSimple | Software de Gestión para PAS',
  description: 'Olvidate del Excel. Centralizá tu cartera, controlá vencimientos y enviá alertas automáticas por WhatsApp a tus clientes. Probá 14 días gratis.',
  keywords: ['software para productores de seguros', 'sistema para PAS', 'gestión de seguros', 'AseguraSimple', 'productores asesores de seguros'],
  alternates: {
    canonical: 'https://www.asegurasimple.com', // 🔥 Esto soluciona lo del "Canonical: Not specified"
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-200">
      <Navbar />
      <Hero />
      
      {/* 🔥 Primero tocamos el "dolor" del usuario */}
      <Problems />
      
      {/* 🔥 Después mostramos nuestro tremendo sistema como solución */}
      <Features />
      
      {/* Ocultamos "Cómo Funciona" y "Social Proof" para que la página sea más directa */}
      
      <Pricing />
      <FAQ />
      <CtaFinal />
      <Footer />
    </div>
  );
}