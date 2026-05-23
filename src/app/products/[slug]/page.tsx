import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// generateMetadata — SEO dynamique par produit
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_DATABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return {};

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, price_xpf')
    .eq('slug', slug)
    .maybeSingle();

  if (!product) {
    return { title: 'Produit non trouvé | Meubles Polynésie' };
  }

  const price = new Intl.NumberFormat('fr-FR').format(product.price_xpf / 100);
  const description = product.description
    ? `${product.description.slice(0, 155)}...`
    : `${product.name} — ${price} XPF. Livraison en Polynésie française.`;

  return {
    title: `${product.name} | Meubles Polynésie`,
    description,
    openGraph: {
      title: `${product.name} — ${price} XPF`,
      description,
      images: product.images?.[0] ? [{ url: product.images[0], alt: product.name }] : [],
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
