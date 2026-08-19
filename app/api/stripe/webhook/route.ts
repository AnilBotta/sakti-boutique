/**
 * Stripe webhook — flips a pending order to `paid`.
 *
 * Verifies the signature with the owner's webhook signing secret (from the
 * Integrations panel, active mode), then handles `checkout.session.completed`
 * by marking the order referenced in session metadata as paid. Idempotent.
 *
 * Register the endpoint URL (…/api/stripe/webhook) in the Stripe dashboard and
 * paste its signing secret (whsec_…) into Settings → Integrations → Stripe.
 */

import type Stripe from 'stripe';
import { getStripeRuntime } from '@/lib/integrations/stripe';
import { markOrderPaid } from '@/lib/checkout/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  const rt = await getStripeRuntime();
  if (!rt || !rt.webhookSecret) {
    return new Response('Stripe not configured', { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = rt.stripe.webhooks.constructEvent(body, signature, rt.webhookSecret);
  } catch (e) {
    console.error('[stripe.webhook] signature', e instanceof Error ? e.message : e);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const paymentRef =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? session.id;
    if (orderId) {
      await markOrderPaid(orderId, paymentRef);
    }
  }

  return new Response('ok', { status: 200 });
}
