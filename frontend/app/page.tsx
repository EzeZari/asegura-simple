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

export const metadata: Metadata = {
  title: 'AseguraSimple | Sistema de Gestión para PAS',
  description: 'Olvidate del Excel. Centralizá tu cartera, controlá vencimientos y enviá alertas automáticas por WhatsApp a tus clientes. Probá 14 días gratis.',
  keywords: ['sistema para productores de seguros', 'sistema para PAS', 'gestión de seguros', 'AseguraSimple', 'productores asesores de seguros'],
  alternates: {
    canonical: 'https://www.asegurasimple.com', 
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-200">
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