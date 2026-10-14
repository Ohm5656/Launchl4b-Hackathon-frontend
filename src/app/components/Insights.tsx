import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useWorkspace } from '../services/Workspace';
import { billingInMonth, money, monthlyCost } from '../services/subscriptions';

export function Insights() {
  const { subscriptions, anchors } = useWorkspace();
  const total = subscriptions.reduce((n, s) => n + monthlyCost(s), 0);
  const categoryData = subscriptions
    .reduce<{ name: string; value: number }[]>((acc, s) => {
      const found = acc.find((c) => c.name === s.category);
      if (found) found.value += monthlyCost(s);
      else acc.push({ name: s.category, value: monthlyCost(s) });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);
  const colors = ['#4f46e5', '#8b83ed', '#419aa0', '#b6c0da', '#64748b'];
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = addMonths(startOfMonth(new Date()), i);
    return {
      name: format(month, 'MMM'),
      amount: Number(
        anchors
          .reduce((n, s) => n + (billingInMonth(s, month) ? s.price : 0), 0)
          .toFixed(2),
      ),
    };
  });
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1>Spending insights</h1>
          <p>Spending by month and category.</p>
        </div>
        <span className="annual-estimate">
          {money(total * 12)} projected / year
        </span>
      </header>
      <div className="insights-grid">
        <section className="panel forecast-panel">
          <div className="panel-heading">
            <div>
              <h2>Payment forecast</h2>
              <p>What’s scheduled over the next six months.</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ left: 0, right: 12, top: 16, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#68758b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#68758b', fontSize: 11 }}
                  tickFormatter={(n) => `$${n}`}
                  width={55}
                />
                <Tooltip
                  cursor={{ fill: '#f4f3ff' }}
                  formatter={(value: number) => [
                    money(value),
                    'Scheduled payments',
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#655ce0"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={42}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="chart-note">
            Projected from your current plans. Annual payments appear in their
            renewal month.
          </p>
        </section>
        <section className="panel category-panel">
          <div className="panel-heading">
            <div>
              <h2>Where it goes</h2>
              <p>Monthly spending by category.</p>
            </div>
          </div>
          <div className="category-strip">
            {categoryData.map((c, i) => (
              <span
                key={c.name}
                style={{
                  width: `${total ? (c.value / total) * 100 : 0}%`,
                  background: colors[i % colors.length],
                }}
              />
            ))}
          </div>
          <div className="category-list">
            {categoryData.map((c, i) => (
              <div key={c.name}>
                <span
                  className="category-dot"
                  style={{ background: colors[i % colors.length] }}
                />
                <span>
                  {c.name}
                  <small>
                    {total ? Math.round((c.value / total) * 100) : 0}% of
                    monthly spend
                  </small>
                </span>
                <strong>{money(c.value)}</strong>
              </div>
            ))}
            {!categoryData.length && (
              <p className="aside-description">No subscription receipts yet.</p>
            )}
          </div>
          <div className="category-total">
            <span>Monthly total</span>
            <strong>{money(total)}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}
