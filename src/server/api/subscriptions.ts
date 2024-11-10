import express from 'express';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Schema for subscription plans
const PlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  price: z.object({
    monthly: z.number().optional(),
    annual: z.number().optional(),
    lifetime: z.number().optional(),
  }),
  limits: z.object({
    contacts: z.number(),
    storage: z.number(),
    apiCalls: z.number(),
  }),
});

// Create a subscription
router.post('/create', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)
        .payment_intent?.client_secret,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(400).json({ error: 'Failed to create subscription' });
  }
});

// Cancel a subscription
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: true,
    });

    await supabase
      .from('subscriptions')
      .update({ cancelAtPeriodEnd: true })
      .eq('stripeSubscriptionId', id);

    res.json(subscription);
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(400).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate a canceled subscription
router.post('/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: false,
    });

    await supabase
      .from('subscriptions')
      .update({ cancelAtPeriodEnd: false })
      .eq('stripeSubscriptionId', id);

    res.json(subscription);
  } catch (error) {
    console.error('Subscription reactivation error:', error);
    res.status(400).json({ error: 'Failed to reactivate subscription' });
  }
});

// Update subscription plan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPriceId } = req.body;

    const subscription = await stripe.subscriptions.retrieve(id);
    const updatedSubscription = await stripe.subscriptions.update(id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(400).json({ error: 'Failed to update subscription' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleSuccessfulPayment(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleFailedPayment(failedInvoice);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Admin routes for managing subscription plans
router.post('/plans', async (req, res) => {
  try {
    const planData = PlanSchema.parse(req.body);
    
    // Create Stripe products and prices
    const product = await stripe.products.create({
      name: planData.name,
      description: planData.description,
      metadata: {
        features: JSON.stringify(planData.features),
        limits: JSON.stringify(planData.limits),
      },
    });

    const prices = await createPricesForPlan(product.id, planData.price);
    
    // Store plan in Supabase
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        name: planData.name,
        description: planData.description,
        features: planData.features,
        limits: planData.limits,
        stripe_product_id: product.id,
        prices: prices.map(price => ({
          id: price.id,
          type: price.recurring?.interval || 'lifetime',
          amount: price.unit_amount,
        })),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Plan creation error:', error);
    res.status(400).json({ error: 'Failed to create subscription plan' });
  }
});

// Helper functions
async function createPricesForPlan(productId: string, prices: {
  monthly?: number;
  annual?: number;
  lifetime?: number;
}) {
  const stripePrices = [];

  if (prices.monthly) {
    stripePrices.push(await stripe.prices.create({
      product: productId,
      unit_amount: prices.monthly * 100, // Convert to cents
      currency: 'usd',
      recurring: { interval: 'month' },
    }));
  }

  if (prices.annual) {
    stripePrices.push(await stripe.prices.create({
      product: productId,
      unit_amount: prices.annual * 100,
      currency: 'usd',
      recurring: { interval: 'year' },
    }));
  }

  if (prices.lifetime) {
    stripePrices.push(await stripe.prices.create({
      product: productId,
      unit_amount: prices.lifetime * 100,
      currency: 'usd',
    }));
  }

  return stripePrices;
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripeSubscriptionId: subscription.id,
      userId: subscription.metadata.userId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

  if (error) throw error;
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripeSubscriptionId', subscription.id);

  if (error) throw error;
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('stripeSubscriptionId', invoice.subscription);

    if (error) throw error;
  }
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripeSubscriptionId', invoice.subscription);

    if (error) throw error;
  }
}

export default router;