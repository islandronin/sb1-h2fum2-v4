import React from 'react';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import type { SubscriptionPlan } from '../types/Subscription';
import { Check } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentPlan?: string;
}

export function SubscriptionPlans({ plans, currentPlan }: SubscriptionPlansProps) {
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const { clientSecret } = await response.json();

      const { error } = await stripe.confirmCardPayment(clientSecret);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your networking needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                currentPlan === plan.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-gray-500">{plan.description}</p>
                <div className="mt-8">
                  {plan.price.monthly && (
                    <div className="flex items-baseline text-gray-900">
                      <span className="text-5xl font-extrabold tracking-tight">
                        ${plan.price.monthly}
                      </span>
                      <span className="ml-1 text-xl font-semibold">/month</span>
                    </div>
                  )}
                  {plan.price.annual && (
                    <div className="mt-2 flex items-baseline text-gray-600">
                      <span className="text-2xl font-semibold">
                        ${plan.price.annual}
                      </span>
                      <span className="ml-1">/year</span>
                    </div>
                  )}
                  {plan.price.lifetime && (
                    <div className="mt-2 flex items-baseline text-gray-600">
                      <span className="text-2xl font-semibold">
                        ${plan.price.lifetime}
                      </span>
                      <span className="ml-1">lifetime</span>
                    </div>
                  )}
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex">
                      <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pt-6 pb-8">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={currentPlan === plan.id}
                  className={`w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                    currentPlan === plan.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}