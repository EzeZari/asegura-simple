import { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Problems from '@/components/landing/Problems';
import Features from '@/components/landing/Features';
// 🔥 1. Descomentamos la importación
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CtaFinal from '@/components/landing/CtaFinal';
import Footer from '@/components/landing/Footer';

// 🔥 3. Importamos el nuevo componente JSON-LD unificado
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'AseguraSimple | Sistema de Gestión para Productores de Seguros (PAS)',
  description: 'Olvidate del Excel. Centralizá tu cartera, controlá vencimientos y enviá alertas automáticas por WhatsApp a tus clientes. Probá 14 días gratis.',
  keywords: ['sistema para productores de seguros', 'sistema para PAS', 'gestión de seguros', 'AseguraSimple', 'productores asesores de seguros'],
  alternates: {
    canonical: 'https://www.asegurasimple.com', 
  },
  openGraph: {
    title: 'AseguraSimple | Sistema para Productores de Seguros (PAS)',
    description: 'Centralizá tu cartera, controlá vencimientos y enviá alertas automáticas por WhatsApp a tus clientes.',
    url: 'https://www.asegurasimple.com',
    siteName: 'AseguraSimple',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AseguraSimple - Sistema de Gestión',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-200">
      {/* 🔥 4. Lo inyectamos al inicio de la página para que lo lean los bots de IA */}
      <JsonLd />
      
      <Navbar />
      <Hero />
      <Problems />
      <Features />
      
      {/* 🔥 2. Lo agregamos acá, justo antes de los precios */}
      <HowItWorks />
      
      <Pricing />
      <FAQ />
      <CtaFinal />
      <Footer />
    </div>
  );
}