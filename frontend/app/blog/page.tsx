import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ArrowRight, Clock, BookOpen, ShieldCheck, TrendingUp } from 'lucide-react';
import { getAllPosts, PostIcon } from '@/lib/posts';

const SITE_URL = 'https://www.asegurasimple.com';

export const metadata: Metadata = {
  title: 'Blog para Productores de Seguros | AseguraSimple',
  description:
    'Estrategias, consejos y herramientas para Productores Asesores de Seguros (PAS) en Argentina. Aprendé a digitalizar y escalar tu cartera.',
  keywords: ['blog seguros', 'consejos para PAS', 'productores de seguros argentina', 'digitalizar cartera seguros'],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog para Productores de Seguros | AseguraSimple',
    description:
      'Estrategias, consejos y herramientas para Productores Asesores de Seguros (PAS) en Argentina.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

const ICONS: Record<PostIcon, typeof BookOpen> = { BookOpen, TrendingUp, ShieldCheck };

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-green-200 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="bg-white border-b border-gray-200 pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Recursos para el{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-500">
                Productor de Seguros
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estrategias, tecnología y consejos prácticos para automatizar tu agencia, retener más clientes y escalar tus comisiones.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500">
              Muy pronto vas a encontrar acá nuestras primeras notas.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const Icon = ICONS[post.icon];
                return (
                  <article
                    key={post.slug}
                    className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    <div
                      className={`h-48 w-full ${post.bgColor} flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}
                    >
                      <Icon className={`${post.iconColor} w-16 h-16 opacity-50`} />
                    </div>

                    <div className="p-8 flex flex-col flex-grow relative bg-white z-10">
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        <span className="text-green-600">{post.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {post.readTime}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-green-700 transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="text-gray-600 mb-8 flex-grow">{post.excerpt}</p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-green-700 font-bold hover:text-green-800 transition-colors"
                      >
                        Leer artículo <ArrowRight size={18} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}