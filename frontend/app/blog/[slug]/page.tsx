import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { getAllSlugs, getPostBySlug, getRelatedPosts } from '@/lib/posts';

const SITE_URL = 'https://www.asegurasimple.com';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: 'Artículo no encontrado' };

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} | Blog AseguraSimple`,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const relatedPosts = getRelatedPosts(post.slug, 2);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'AseguraSimple' },
    publisher: { '@type': 'Organization', name: 'AseguraSimple' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-green-200 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Navbar />

      <main className="flex-grow pt-10 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors mb-8"
          >
            <ArrowLeft size={20} /> Volver al blog
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
              <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full">{post.category}</span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />{' '}
                {new Date(post.date).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} /> {post.readTime}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed border-l-4 border-green-600 pl-4 italic">
              {post.description}
            </p>
          </header>

          <div
            className="prose prose-lg prose-green max-w-none text-gray-700 mb-16 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>p]:mb-6 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:text-gray-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 🔥 Seguí leyendo — se arma solo, tira de lib/posts.ts. Nunca hace falta editar posts viejos. */}
          {relatedPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Seguí leyendo</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="block bg-white border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all group"
                  >
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                      {related.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3 leading-snug group-hover:text-green-700 transition-colors">
                      {related.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 font-semibold">
                      Leer artículo <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-green-700 text-white rounded-3xl p-8 md:p-12 text-center shadow-xl">
            <h3 className="text-3xl font-extrabold mb-4">¿Listo para dejar el Excel en el pasado?</h3>
            <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
              Centralizá tu cartera, automatizá tus alertas de vencimiento y contactá a tus clientes por WhatsApp con un solo clic.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/registro"
                className="bg-white text-green-700 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Probar 14 días gratis
              </Link>
            </div>
            <div className="mt-6 flex justify-center items-center gap-2 text-sm text-green-200 font-medium">
              <CheckCircle2 size={16} /> Sin tarjeta de crédito
              <span className="mx-2">•</span>
              <CheckCircle2 size={16} /> Configuración en 5 minutos
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}