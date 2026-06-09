// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe, getTierFromPriceId } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession;
      if (session.mode !== 'subscription') break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const userId = session.metadata?.user_id;
      if (!userId) break;

      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);

      await supabase.from('subscriptions').upsert({
        id: subscription.id,
        user_id: userId,
        status: subscription.status,
        tier,
        stripe_customer_id: session.customer as string,
        price_id: priceId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      });
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getTierFromPriceId(priceId);

      await supabase.from('subscriptions').update({
        status: subscription.status,
        tier,
        price_id: priceId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }).eq('id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      }).eq('id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await supabase.from('subscriptions').update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('id', invoice.subscription as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
