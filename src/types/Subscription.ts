export type SubscriptionTier = 'free' | 'pro' | 'enterprise' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: {
    monthly?: number;
    annual?: number;
    lifetime?: number;
  };
  limits: {
    contacts: number;
    storage: number;
    apiCalls: number;
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}