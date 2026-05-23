'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Lock, MapPin } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const SHIPPING_ZONES = [
  { id: 'tahiti', name: 'Tahiti', price: 200000, days: '3-5 jours' },
  { id: 'moorea', name: 'Moorea', price: 400000, days: '5-7 jours' },
  { id: 'iles', name: 'Îles éloignées', price: 600000, days: '10-14 jours' },
];

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

interface SavedAddress {
  id: string;
  full_name: string;
  street: string;
  city: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState('tahiti');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  // Pré-remplir avec l'adresse par défaut si l'utilisateur est connecté
  useEffect(() => {
    if (!user) return;
    async function loadDefaultAddress() {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
        .limit(5);

      if (error) return;
      if (data && data.length > 0) {
        setSavedAddresses(data);
        const defaultAddr = data.find((a: SavedAddress) => a.is_default) || data[0];
        setFormData(prev => ({
          ...prev,
          fullName: defaultAddr.full_name || '',
          phone: defaultAddr.phone || '',
          street: defaultAddr.street || '',
          city: defaultAddr.city || '',
          postalCode: defaultAddr.postal_code || '',
          email: user!.email || '',
        }));
      } else {
        setFormData(prev => ({ ...prev, email: user!.email || '' }));
      }
    }
    loadDefaultAddress();
  }, [user]);

  const shipping = SHIPPING_ZONES.find(z => z.id === selectedZone)?.price || 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyAddress = (addr: SavedAddress) => {
    setFormData(prev => ({
      ...prev,
      fullName: addr.full_name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postal_code,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      router.push('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setLoading(true);

    try {
      const shippingAddress = {
        fullName: formData.fullName,
        street: formData.street,
        city: formData.city,
        island: SHIPPING_ZONES.find(z => z.id === selectedZone)?.name || '',
        postalCode: formData.postalCode,
        phone: formData.phone,
      };

      // Créer la commande en "pending" — le webhook Stripe confirmera
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          subtotal_xpf: subtotal,
          shipping_xpf: shipping,
          total_xpf: total,
          shipping_address: shippingAddress,
          notes: formData.notes,
        })
        .select()
        .maybeSingle();

      if (orderError || !order) throw new Error('Erreur lors de la création de la commande');

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price_xpf: item.price,
        total_price_xpf: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw new Error('Erreur lors des articles');

      // Créer la session Stripe
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shipping: {
            zone: SHIPPING_ZONES.find(z => z.id === selectedZone)?.name,
            price: shipping,
          },
          customerEmail: formData.email,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.sessionId) {
        throw new Error(data.error || 'Erreur Stripe');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe non disponible');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (stripeError) throw stripeError;

      clearCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <Link href="/products"><Button>Découvrir nos produits</Button></Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au panier
            </Button>
          </Link>
          <h1 className="text-2xl font-bold font-heading">Finaliser la commande</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* Adresses sauvegardées */}
              {savedAddresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Mes adresses enregistrées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applyAddress(addr)}
                          className="text-left p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                        >
                          <p className="font-medium">{addr.full_name}</p>
                          <p className="text-muted-foreground">{addr.street}</p>
                          <p className="text-muted-foreground">{addr.city} {addr.postal_code}</p>
                          {addr.is_default && (
                            <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Adresse par défaut
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informations de livraison */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de livraison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet *</Label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="Teahuiarii Teahui" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+689 40 12 34 56" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="votre@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Adresse *</Label>
                    <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required placeholder="Rue, numéro, résidence..." />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required placeholder="Papeete" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="98714" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes de livraison (optionnel)</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px] px-3 py-2 border rounded-md text-sm bg-background text-foreground"
                      placeholder="Instructions de livraison, code porte, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Zone de livraison */}
              <Card>
                <CardHeader><CardTitle>Zone de livraison</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SHIPPING_ZONES.map((zone) => (
                      <label
                        key={zone.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedZone === zone.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input type="radio" name="zone" value={zone.id} checked={selectedZone === zone.id} onChange={() => setSelectedZone(zone.id)} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedZone === zone.id ? 'border-primary' : 'border-muted-foreground'}`}>
                            {selectedZone === zone.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <p className="font-medium">{zone.name}</p>
                            <p className="text-sm text-muted-foreground">Livraison en {zone.days}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary">{formatPrice(zone.price)} XPF</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Paiement sécurisé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Vous serez redirigé vers Stripe pour finaliser votre paiement.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Paiement 100% sécurisé — chiffrement SSL</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader><CardTitle>Récapitulatif</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 relative bg-muted rounded overflow-hidden shrink-0">
                          {item.image
                            ? <Image src={item.image} alt={item.name} fill className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground">?</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qté : {item.quantity}</p>
                          <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)} XPF</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span className="font-medium">{formatPrice(subtotal)} XPF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison ({SHIPPING_ZONES.find(z => z.id === selectedZone)?.name})</span>
                      <span className="font-medium">{formatPrice(shipping)} XPF</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)} XPF</span>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? 'Traitement...' : 'Payer maintenant'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    En passant commande, vous acceptez nos{' '}
                    <Link href="/mentions-legales" className="text-primary hover:underline">conditions</Link>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
