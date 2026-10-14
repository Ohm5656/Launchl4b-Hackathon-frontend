import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from 'date-fns';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  category: string;
  color: string;
  isAutoDetected?: boolean;
  plan?: string;
  paymentMethod?: string;
  notes?: string;
  startedAt?: string;
  paymentHistory?: { date: string; amount: number }[];
}
export const money = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    value,
  );
export const monthlyCost = (s: Subscription) =>
  s.billingCycle === 'yearly' ? s.price / 12 : s.price;
export const dateLabel = (date: string) =>
  format(parseISO(date), 'MMM d, yyyy');
export const daysUntil = (date: string) =>
  differenceInCalendarDays(parseISO(date), startOfDay(new Date()));

// Calculate from the original anchor: Jan 31 → Feb 28 → Mar 31.
export function billingInMonth(s: Subscription, month: Date): string | null {
  const anchor = parseISO(s.nextBillingDate);
  const offset =
    (month.getFullYear() - anchor.getFullYear()) * 12 +
    month.getMonth() -
    anchor.getMonth();
  if (s.billingCycle === 'yearly' && offset % 12 !== 0) return null;
  const date = addMonths(anchor, offset);
  if (s.startedAt && date < parseISO(s.startedAt)) return null;
  return format(date, 'yyyy-MM-dd');
}
export function nextBilling(s: Subscription, today = new Date()): string {
  const anchor = parseISO(s.nextBillingDate);
  if (anchor >= startOfDay(today)) return s.nextBillingDate;
  const offset =
    (today.getFullYear() - anchor.getFullYear()) * 12 +
    today.getMonth() -
    anchor.getMonth();
  let steps = s.billingCycle === 'yearly' ? Math.floor(offset / 12) : offset;
  const advance = (n: number) =>
    s.billingCycle === 'yearly' ? addYears(anchor, n) : addMonths(anchor, n);
  if (advance(steps) < startOfDay(today)) steps += 1;
  return format(advance(steps), 'yyyy-MM-dd');
}
export function createDemoSubscriptions(today = new Date()): Subscription[] {
  const services = [
    {
      name: 'Netflix',
      price: 15.49,
      category: 'Entertainment',
      color: '#E50914',
      plan: 'Standard · 2 screens',
      day: 16,
    },
    {
      name: 'Spotify',
      price: 9.99,
      category: 'Entertainment',
      color: '#16883e',
      plan: 'Premium Individual',
      day: 19,
    },
    {
      name: 'Adobe Creative Cloud',
      price: 54.99,
      category: 'Productivity',
      color: '#d52b2b',
      plan: 'All Apps · Individual',
      day: 28,
    },
    {
      name: 'iCloud+',
      price: 2.99,
      category: 'Cloud storage',
      color: '#2875ce',
      plan: '200 GB storage',
      day: 22,
    },
    {
      name: 'Notion',
      price: 96,
      category: 'Productivity',
      color: '#475569',
      plan: 'Plus · Annual plan',
      day: 25,
    },
    {
      name: 'YouTube Premium',
      price: 13.99,
      category: 'Entertainment',
      color: '#d52b2b',
      plan: 'Individual · Ad-free',
      day: 8,
    },
    {
      name: 'ChatGPT Plus',
      price: 20,
      category: 'AI tools',
      color: '#16816b',
      plan: 'Plus · Personal',
      day: 5,
    },
  ];
  return services.map((s, i) => {
    const anchor = format(
      new Date(today.getFullYear(), today.getMonth(), s.day),
      'yyyy-MM-dd',
    );
    const paymentHistory = Array.from({ length: 5 }, (_, n) => ({
      date: format(
        i === 4
          ? addYears(parseISO(anchor), -n)
          : addMonths(parseISO(anchor), -n),
        'yyyy-MM-dd',
      ),
      amount: s.price,
    }))
      .filter((p) => parseISO(p.date) < startOfDay(today))
      .slice(0, 4);
    return {
      ...s,
      id: `demo-${i + 1}`,
      billingCycle: i === 4 ? 'yearly' : 'monthly',
      nextBillingDate: anchor,
      isAutoDetected: i !== 4,
      paymentMethod: i === 3 ? 'Apple account' : 'Visa ending in 4242',
      startedAt:
        paymentHistory.at(-1)?.date ||
        format(addMonths(parseISO(anchor), -8), 'yyyy-MM-dd'),
      paymentHistory,
      notes:
        i === 2
          ? 'Used for design projects. Review the plan before the next renewal.'
          : i === 4
            ? 'Annual plan for my project workspace.'
            : '',
    };
  });
}
