import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripeClient(): Stripe | null {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) return null;
  return new Stripe(apiKey, { apiVersion: '2025-02-24.acacia' });
}

export async function POST(request: Request) {
  try {
    const { orderId, items, shipping, customerEmail } = await request.json();

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe payment is not configured' }, { status: 503 });
    }

    // XPF est une devise zéro-décimale (comme JPY) — Stripe attend le montant
    // directement en XPF entier, SANS multiplier par 100.
    // Les prix en base sont stockés en "XPF × 100" (convention cents),
    // il faut donc diviser par 100 avant d'envoyer à Stripe.
    const lineItems = items.map((item: { name: string; price: number; quantity: number; image?: string }) => ({
      price_data: {
        currency: 'xpf',
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price / 100),
      },
      quantity: item.quantity,
    }));

    if (shipping && shipping.price > 0) {
      lineItems.push({
        price_data: {
          currency: 'xpf',
          product_data: { name: `Livraison — ${shipping.zone}` },
          unit_amount: Math.round(shipping.price / 100),
        },
        quantity: 1,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${appUrl}/checkout?canceled=true`,
      customer_email: customerEmail,
      metadata: { order_id: orderId },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
