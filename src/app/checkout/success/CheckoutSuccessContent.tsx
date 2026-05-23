'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();

    // Fetch order details
    async function fetchOrder() {
      if (orderId) {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        setOrder(data);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId, clearCart]);

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-heading mb-4">Commande confirmée !</h1>
            <p className="text-lg text-muted-foreground">
              Merci pour votre commande. Vous recevrez un email de confirmation avec les détails de votre commande.
            </p>
          </div>

          {loading ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                  <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ) : order ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 text-left">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
                    <p className="font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Statut</p>
                    <p className="font-semibold text-primary capitalize">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="font-bold text-primary">
                      {new Intl.NumberFormat('fr-FR').format(order.total_xpf / 100)} XPF
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Prochaines étapes
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Vous recevrez un email de confirmation avec le récapitulatif de votre commande.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Nous préparerons votre commande avec soin dans notre entrepôt.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Vous serez informé de l&apos;expédition et recevrez un numéro de suivi.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Livraison à l&apos;adresse que vous avez indiquée.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/orders">
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Suivre ma commande
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg">
                Continuer mes achats
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
