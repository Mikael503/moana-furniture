'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/integrations/supabase/client';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, Truck, Shield, CreditCard, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  price_xpf: number;
  compare_at_price_xpf: number | null;
  images: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

function HomepageContent() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('id,name,slug,price_xpf,compare_at_price_xpf,images').eq('is_active', true).eq('is_featured', true).limit(6),
        supabase.from('categories').select('id,name,slug,image_url').limit(6),
      ]);
      if (productsRes.data) setFeaturedProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: newsletterEmail });
    if (error) {
      if (error.code === '23505') {
        toast.info('Vous êtes déjà inscrit à notre newsletter.');
      } else {
        toast.error("Erreur lors de l'inscription. Réessayez.");
      }
    } else {
      toast.success('Merci ! Vous êtes bien inscrit à notre newsletter.');
      setNewsletterEmail('');
    }
    setNewsletterLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden"
style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=90')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
              Des meubles de qualité pour votre maison en Polynésie
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              Découvrez notre collection de meubles design et élégants, livrés directement sur Tahiti et les îles de la Polynésie française.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                  Voir la collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products?category=jardin">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Meubles de jardin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-card border-b py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Livraison Polynésie', sub: 'Tahiti & Îles' },
              { icon: Shield, title: 'Garantie 2 ans', sub: 'Sur tous les produits' },
              { icon: CreditCard, title: 'Paiement sécurisé', sub: 'Stripe chiffré' },
              { icon: RotateCcw, title: 'Retours faciles', sub: '14 jours satisfait' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading">Nos catégories</h2>
              <p className="text-muted-foreground mt-2">Trouvez le meuble parfait pour chaque pièce</p>
            </div>
            <Link href="/products" className="hidden sm:block">
              <Button variant="ghost">Voir tout</Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {category.image_url ? (
                          <Image src={category.image_url} alt={category.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl opacity-50">{category.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <p className="font-medium text-sm">{category.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading">Produits populaires</h2>
              <p className="text-muted-foreground mt-2">Les favoris de nos clients</p>
            </div>
            <Link href="/products">
              <Button variant="ghost">Voir tout <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-6 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="text-4xl opacity-50">?</span></div>
                        )}
                        {product.compare_at_price_xpf && (
                          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                            -{Math.round((1 - product.price_xpf / product.compare_at_price_xpf) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">{formatPrice(product.price_xpf)} XPF</span>
                          {product.compare_at_price_xpf && (
                            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compare_at_price_xpf)} XPF</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 md:py-16 bg-background border-t">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3">Restez informé</h2>
          <p className="text-muted-foreground mb-6">
            Inscrivez-vous à notre newsletter et recevez nos nouvelles collections et offres exclusives en avant-première.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="votre@email.com"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={newsletterLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {newsletterLoading ? 'Inscription...' : "S'inscrire"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Pas de spam. Désabonnement possible à tout moment.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold font-heading mb-4">Prêt à aménager votre intérieur ?</h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-xl mx-auto">
            Inscrivez-vous gratuitement et profitez d&apos;une expérience d&apos;achat personnalisée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">Créer un compte</Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <StoreLayout>
      <HomepageContent />
    </StoreLayout>
  );
}
