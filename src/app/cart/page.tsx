'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

const SHIPPING_ZONES = [
  { id: 'tahiti', name: 'Tahiti', price: 200000, days: '3-5 jours' },
  { id: 'moorea', name: 'Moorea', price: 400000, days: '5-7 jours' },
  { id: 'iles', name: 'Îles', price: 600000, days: '10-14 jours' },
];

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const [selectedZone, setSelectedZone] = useState('tahiti');
  const shipping = SHIPPING_ZONES.find(z => z.id === selectedZone)?.price || 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
            <h1 className="text-2xl font-bold font-heading mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">
              Ajoutez des produits à votre panier pour commencer vos achats.
            </p>
            <Link href="/products">
              <Button size="lg">
                Voir les produits
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading mb-8">Mon Panier</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/products/${item.slug}`} className="shrink-0">
                      <div className="w-24 h-24 relative bg-muted rounded-lg overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl opacity-50">?</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-primary font-bold mt-1">
                        {formatPrice(item.price)} XPF
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)} XPF
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                  <span className="font-medium">{formatPrice(subtotal)} XPF</span>
                </div>

                <Separator />

                {/* Shipping Zone Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zone de livraison</label>
                  <div className="space-y-2">
                    {SHIPPING_ZONES.map((zone) => (
                      <label
                        key={zone.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedZone === zone.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-zone"
                            value={zone.id}
                            checked={selectedZone === zone.id}
                            onChange={() => setSelectedZone(zone.id)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedZone === zone.id ? 'border-primary' : 'border-muted-foreground'
                          }`}>
                            {selectedZone === zone.id && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{zone.name}</p>
                            <p className="text-xs text-muted-foreground">{zone.days}</p>
                          </div>
                        </div>
                        <span className="font-medium">{formatPrice(zone.price)} XPF</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)} XPF</span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full" size="lg">
                    Passer la commande
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground">
                  Paiement sécurisé par Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
