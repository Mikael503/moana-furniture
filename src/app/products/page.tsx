'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/integrations/supabase/client';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { Search, SlidersHorizontal, X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 12;

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
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = searchParams.get('category');
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || 'all');
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Quick view modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) setError('Impossible de charger les catégories');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Filtre catégorie côté serveur
    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) query = query.eq('category_id', category.id);
    }

    // Filtre prix côté serveur
    if (priceMax !== null) query = query.lte('price_xpf', priceMax);

    // Recherche côté serveur
    if (searchQuery.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`);

    // Tri côté serveur
    switch (sortBy) {
      case 'price-low':  query = query.order('price_xpf', { ascending: true }); break;
      case 'price-high': query = query.order('price_xpf', { ascending: false }); break;
      case 'name':       query = query.order('name', { ascending: true }); break;
      default:           query = query.order('created_at', { ascending: false });
    }

    // Pagination
    const from = page * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, error: fetchError, count } = await query;
    if (fetchError) {
      setError('Impossible de charger les produits. Veuillez réessayer.');
    } else {
      setProducts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [categories, selectedCategory, sortBy, searchQuery, priceMax, page]);

  useEffect(() => {
    if (categories.length > 0) fetchProducts();
  }, [fetchProducts, categories]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedCategory, sortBy, searchQuery, priceMax]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSortBy('newest');
    setSearchQuery('');
    setPriceMax(null);
    setPage(0);
  };

  const hasActiveFilters = selectedCategory !== 'all' || sortBy !== 'newest' || searchQuery || priceMax !== null;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4">Nos Meubles</h1>
          <p className="text-primary-foreground/80">Découvrez notre collection de meubles design pour toute la maison</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <h3 className="font-medium mb-3">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    Tous les produits
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Prix maximum</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Moins de 50 000 XPF', value: 5000000 },
                    { label: 'Moins de 100 000 XPF', value: 10000000 },
                    { label: 'Moins de 200 000 XPF', value: 20000000 },
                    { label: 'Tous les prix', value: null },
                  ].map((opt) => (
                    <Button
                      key={opt.label}
                      variant={priceMax === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setPriceMax(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Effacer les filtres
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {totalCount} produit{totalCount > 1 ? 's' : ''}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récents</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <div className="text-center py-16">
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={fetchProducts}>Réessayer</Button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">Aucun produit trouvé</p>
                <Button variant="outline" onClick={clearFilters}>Réinitialiser les filtres</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                      <CardContent className="p-0">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl opacity-50">?</span>
                            </div>
                          )}
                          {product.compare_at_price_xpf && (
                            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                              -{Math.round((1 - product.price_xpf / product.compare_at_price_xpf) * 100)}%
                            </div>
                          )}
                          {product.stock_quantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="secondary" className="text-sm px-3 py-1">Rupture de stock</Badge>
                            </div>
                          )}
                          {/* Bouton Quick View */}
                          <button
                            onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border"
                          >
                            Aperçu rapide
                          </button>
                        </div>
                        <Link href={`/products/${product.slug}`}>
                          <div className="p-4">
                            <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">{formatPrice(product.price_xpf)} XPF</span>
                              {product.compare_at_price_xpf && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatPrice(product.compare_at_price_xpf)} XPF
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
        <DialogContent className="max-w-2xl">
          {quickViewProduct && (
            <>
              <DialogTitle className="sr-only">{quickViewProduct.name}</DialogTitle>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                  {quickViewProduct.images[0] ? (
                    <Image src={quickViewProduct.images[0]} alt={quickViewProduct.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-50">?</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between py-2">
                  <div>
                    <h2 className="text-xl font-bold font-heading mb-3">{quickViewProduct.name}</h2>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-primary">{formatPrice(quickViewProduct.price_xpf)} XPF</span>
                      {quickViewProduct.compare_at_price_xpf && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(quickViewProduct.compare_at_price_xpf)} XPF
                        </span>
                      )}
                    </div>
                    {quickViewProduct.description && (
                      <p className="text-sm text-muted-foreground line-clamp-4">{quickViewProduct.description}</p>
                    )}
                  </div>
                  <div className="space-y-3 mt-4">
                    <Button
                      className="w-full"
                      disabled={quickViewProduct.stock_quantity === 0}
                      onClick={() => {
                        if (quickViewProduct.stock_quantity > 0) {
                          addItem({
                            id: quickViewProduct.id,
                            name: quickViewProduct.name,
                            price: quickViewProduct.price_xpf,
                            image: quickViewProduct.images[0] || '',
                            slug: quickViewProduct.slug,
                          });
                          toast.success('Ajouté au panier');
                          setQuickViewProduct(null);
                        }
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {quickViewProduct.stock_quantity === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                    </Button>
                    <Link href={`/products/${quickViewProduct.slug}`} onClick={() => setQuickViewProduct(null)}>
                      <Button variant="outline" className="w-full">Voir le produit complet</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <StoreLayout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>}>
        <ProductsContent />
      </Suspense>
    </StoreLayout>
  );
}
