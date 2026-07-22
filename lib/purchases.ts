// Purchases stub — swap internals for RevenueCat later (CLAUDE.md).
// Plan copy/prices are final per Sora Paywall v2.dc.html.

export type PlanId = 'weekly' | 'annual';

export type Plan = {
  id: PlanId;
  label: string;
  price: string;
  sub: string;
  badge?: string;
  billLine: string;
  footnote: string;
};

export const PLANS: Plan[] = [
  {
    id: 'weekly',
    label: 'WEEKLY',
    price: '$6.99',
    sub: 'per week · flexible',
    billLine: 'Billed $6.99/week only if you stay.',
    footnote: '7 days free, then $6.99/week',
  },
  {
    id: 'annual',
    label: 'ANNUAL',
    price: '$49.99',
    sub: 'per year · $0.96/week',
    badge: 'MOST CHOOSE THIS',
    billLine: 'Billed $49.99/year only if you stay.',
    footnote: '7 days free, then $49.99/year',
  },
];

export function usePurchases() {
  return {
    plans: PLANS,
    // RevenueCat purchase flow goes here; stub always succeeds.
    startTrial: async (_plan: PlanId) => true,
    restore: async () => false,
  };
}
