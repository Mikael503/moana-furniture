import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Client Supabase avec service role (côté serveur uniquement)
function getSupabaseAdmin() {
  const url = process.env.DATABASE_URL;
  const key = process.env.DATABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin credentials missing');
  return createClient(url, key);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      console.error('No order_id in Stripe session metadata');
      return NextResponse.json({ error: 'No order_id' }, { status: 400 });
    }

    try {
      const supabase = getSupabaseAdmin();

      // 1. Mettre à jour le statut de la commande → confirmed
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Failed to update order status:', orderError);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      // 2. Récupérer les articles de la commande
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (itemsError || !orderItems) {
        console.error('Failed to fetch order items:', itemsError);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
      }

      // 3. Décrémenter le stock de chaque produit
      for (const item of orderItems) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .maybeSingle();

        if (productError || !product) continue;

        const newStock = Math.max(0, product.stock_quantity - item.quantity);
        await supabase
          .from('products')
          .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
          .eq('id', item.product_id);
      }

      console.log(`Order ${orderId} confirmed, stock updated.`);
    } catch (err) {
      console.error('Webhook processing error:', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  // Retourner 200 pour tous les événements (évite les retries Stripe)
  return NextResponse.json({ received: true });
}
