import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import SocialProof from '@/components/landing/SocialProof';
import Problems from '@/components/landing/Problems';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import HowItWorks from '@/components/landing/HowItWorks';
import FAQ from '@/components/landing/FAQ';
import CtaFinal from '@/components/landing/CtaFinal';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-200">
      <Navbar />
      <Hero />
      <Features />
      <Problems />
      <HowItWorks />
      {/* <SocialProof /> */}
      <Pricing />
      <FAQ />
      <CtaFinal />
      <Footer />
    </div>
  );
}