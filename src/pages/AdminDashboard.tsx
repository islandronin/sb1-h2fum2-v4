import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SubscriptionPlan } from '../types/Subscription';

export function AdminDashboard() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subsData] = await Promise.all([
        supabase.from('subscription_plans').select('*'),
        supabase.from('subscriptions').select(`
          *,
          users:user_id (email),
          plans:plan_id (name)
        `),
      ]);

      if (plansData.data) setPlans(plansData.data);
      if (subsData.data) setSubscriptions(subsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      const response = await fetch('/api/subscriptions/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData),
      });

      if (!response.ok) throw new Error('Failed to create plan');
      
      loadData();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Subscription Plans */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Subscription Plans
            </h2>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(plan.price).map(([interval, amount]) => (
                      <span
                        key={interval}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        ${amount}/{interval}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Subscriptions
            </h2>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{sub.users.email}</p>
                      <p className="text-sm text-gray-500">{sub.plans.name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Expires: {new Date(sub.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}