'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw,
  ChevronRight, Check, ZoomIn,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_xpf: number;
  compare_at_price_xpf: number | null;
  images: string[];
  stock_quantity: number;
  is_featured: boolean;
  dimensions: { width: number; height: number; depth: number; unit: string } | null;
  weight_kg: number | null;
  category_id: string;
  created_at: string;
}

interface Category { id: string; name: string; slug: string; }

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (fetchError) {
        setError('Impossible de charger ce produit.');
        setLoading(false);
        return;
      }

      if (data) {
        setProduct(data);
        const [catRes, relatedRes] = await Promise.all([
          supabase.from('categories').select('*').eq('id', data.category_id).maybeSingle(),
          supabase.from('products').select('*').eq('category_id', data.category_id).neq('id', data.id).eq('is_active', true).limit(4),
        ]);
        if (catRes.data) setCategory(catRes.data);
        if (relatedRes.data) setRelatedProducts(relatedRes.data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock_quantity < quantity) {
      toast.error('Stock insuffisant');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price_xpf,
      image: product.images[0] || '',
      slug: product.slug,
    }, quantity);
    toast.success(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier`);
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-12 bg-muted rounded w-3/4" />
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Produit non trouvé'}</h1>
          <p className="text-muted-foreground mb-6">Ce produit n&apos;existe pas ou a été supprimé.</p>
          <Link href="/products"><Button>Retour aux produits</Button></Link>
        </div>
      </StoreLayout>
    );
  }

  const dimensions = product.dimensions;

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products">Produits</Link>
          {category && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images avec zoom */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden group cursor-zoom-in" onClick={() => setZoomOpen(true)}>
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-50">{product.name[0]}</span>
                </div>
              )}
              {product.compare_at_price_xpf && (
                <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded">
                  -{Math.round((1 - product.price_xpf / product.compare_at_price_xpf) * 100)}% REMISE
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-card/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 relative rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {category && <Badge variant="secondary">{category.name}</Badge>}
            <h1 className="text-3xl md:text-4xl font-bold font-heading">{product.name}</h1>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price_xpf)} XPF</span>
              {product.compare_at_price_xpf && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.compare_at_price_xpf)} XPF
                </span>
              )}
            </div>

            {product.stock_quantity > 0 ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span className="font-medium">
                  En stock ({product.stock_quantity} disponible{product.stock_quantity > 1 ? 's' : ''})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <span className="font-medium">Rupture de stock</span>
              </div>
            )}

            <Separator />

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'Aucune description disponible.'}
              </p>
            </div>

            {dimensions && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Largeur</p>
                  <p className="font-medium">{dimensions.width} {dimensions.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hauteur</p>
                  <p className="font-medium">{dimensions.height} {dimensions.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profondeur</p>
                  <p className="font-medium">{dimensions.depth} {dimensions.unit}</p>
                </div>
              </div>
            )}
            {product.weight_kg && (
              <p className="text-sm text-muted-foreground">Poids : {product.weight_kg} kg</p>
            )}

            <Separator />

            {product.stock_quantity > 0 && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock_quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-16 text-center border-0"
                  />
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} disabled={quantity >= product.stock_quantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ajouter au panier
                </Button>
              </div>
            )}

            {!user && (
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">Connectez-vous</Link> pour sauvegarder vos favoris.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-primary" /><span>Livraison Polynésie</span></div>
              <div className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-primary" /><span>Garantie 2 ans</span></div>
              <div className="flex items-center gap-2 text-sm"><RotateCcw className="h-4 w-4 text-primary" /><span>Retours 14 jours</span></div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold font-heading mb-6">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link key={rp.id} href={`/products/${rp.slug}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {rp.images[0] ? (
                          <Image src={rp.images[0]} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="text-4xl opacity-50">?</span></div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">{rp.name}</h3>
                        <span className="text-lg font-bold text-primary">{formatPrice(rp.price_xpf)} XPF</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">Image agrandie — {product.name}</DialogTitle>
          {product.images[selectedImage] && (
            <div className="relative aspect-square w-full">
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StoreLayout>
  );
}
