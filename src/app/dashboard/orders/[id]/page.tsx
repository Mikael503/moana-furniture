'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, CheckCircle, Package, Truck, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_xpf: number;
  total_price_xpf: number;
}

interface Order {
  id: string;
  status: string;
  subtotal_xpf: number;
  shipping_xpf: number;
  total_xpf: number;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  notes: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
}

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

const statusSteps = [
  { key: 'pending', label: 'En attente', icon: Clock },
  { key: 'confirmed', label: 'Confirmée', icon: CheckCircle },
  { key: 'processing', label: 'Préparation', icon: Package },
  { key: 'shipped', label: 'Expédiée', icon: Truck },
  { key: 'delivered', label: 'Livrée', icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch order
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!orderData) {
        setLoading(false);
        return;
      }

      setOrder(orderData);

      // Fetch order items
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsData) {
        setItems(itemsData);

        // Fetch product details for each item
        const productIds = [...new Set(itemsData.map(item => item.product_id))];
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, slug, images')
          .in('id', productIds);

        if (productsData) {
          const productsMap: Record<string, Product> = {};
          productsData.forEach(p => {
            productsMap[p.id] = p;
          });
          setProducts(productsMap);
        }
      }

      setLoading(false);
    }

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-8 bg-muted rounded w-48" />
        <div className="animate-pulse h-64 bg-muted rounded" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Commande non trouvée</h2>
        <Link href="/dashboard/orders">
          <Button>Retour aux commandes</Button>
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux commandes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading">
            Commande #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <p className="text-muted-foreground">
            Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Badge
          className={isCancelled ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}
          variant="secondary"
        >
          {isCancelled ? 'Annulée' : 'Confirmée'}
        </Badge>
      </div>

      {/* Order Progress */}
      {!isCancelled && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <p className={`text-xs mt-2 ${isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-0.5 w-16 sm:w-24 mx-2 ${
                          index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Articles commandés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const product = products[item.product_id];
                return (
                  <div key={item.id} className="flex gap-4">
                    <Link href={product ? `/products/${product.slug}` : '#'} className="shrink-0">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden relative">
                        {product?.images?.[0] ? (
                          <Image src={product.images[0]} alt={product?.name || ''} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            ?
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={product ? `/products/${product.slug}` : '#'}>
                        <h3 className="font-medium hover:text-primary line-clamp-2">
                          {product?.name || 'Produit inconnu'}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Quantité: {item.quantity}
                      </p>
                      <p className="font-semibold mt-1">
                        {formatPrice(item.total_price_xpf)} XPF
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{formatPrice(order.subtotal_xpf)} XPF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-medium">{formatPrice(order.shipping_xpf)} XPF</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_xpf)} XPF</span>
              </div>
            </CardContent>
          </Card>

          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresse de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.shipping_address.fullName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.shipping_address.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.shipping_address.city}, {order.shipping_address.island}
                  {order.shipping_address.postalCode && ` ${order.shipping_address.postalCode}`}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {order.shipping_address.phone}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
