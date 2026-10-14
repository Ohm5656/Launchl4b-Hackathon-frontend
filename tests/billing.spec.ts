import { test, expect } from '@playwright/test';
import {
  billingInMonth,
  nextBilling,
  monthlyCost,
  type Subscription,
} from '../src/app/services/subscriptions';

const monthly: Subscription = {
  id: 'one',
  name: 'Test',
  price: 120,
  billingCycle: 'monthly',
  nextBillingDate: '2026-01-31',
  category: 'Other',
  color: '#4f46e5',
};
test('recurring month-end dates retain their original day across short months and years', () => {
  expect(nextBilling(monthly, new Date(2026, 1, 1))).toBe('2026-02-28');
  expect(nextBilling(monthly, new Date(2026, 2, 1))).toBe('2026-03-31');
  expect(nextBilling(monthly, new Date(2036, 1, 1))).toBe('2036-02-29');
  expect(billingInMonth(monthly, new Date(2036, 2, 1))).toBe('2036-03-31');
});
test('annual renewals skip other months, preserve leap days, and normalize spending', () => {
  const annual = {
    ...monthly,
    billingCycle: 'yearly' as const,
    nextBillingDate: '2024-02-29',
  };
  expect(nextBilling(annual, new Date(2026, 2, 1))).toBe('2027-02-28');
  expect(nextBilling(annual, new Date(2028, 1, 1))).toBe('2028-02-29');
  expect(billingInMonth(annual, new Date(2026, 2, 1))).toBeNull();
  expect(monthlyCost(annual)).toBe(10);
  expect(
    billingInMonth(
      { ...annual, startedAt: '2024-02-29' },
      new Date(2023, 1, 1),
    ),
  ).toBeNull();
});
