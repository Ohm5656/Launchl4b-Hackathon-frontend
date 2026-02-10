import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingDown, Sparkles, Target, MousePointer2 } from 'lucide-react';
import { Subscription } from './Dashboard';

interface InsightsProps {
  subscriptions: Subscription[];
}

export const Insights: React.FC<InsightsProps> = ({ subscriptions }) => {
  // Process data for category pie chart
  const categoriesData = subscriptions.reduce((acc: any[], sub) => {
    const existing = acc.find(item => item.name === sub.category);
    if (existing) {
      existing.value += sub.price;
    } else {
      acc.push({ name: sub.category, value: sub.price, color: sub.color });
    }
    return acc;
  }, []);

  // Calculate annual total
  const monthlyTotal = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const annualTotal = monthlyTotal * 12;

  // Mock data for monthly spending
  const monthlyData = [
    { name: 'Jan', amount: 45.99 },
    { name: 'Feb', amount: 52.50 },
    { name: 'Mar', amount: 48.00 },
    { name: 'Apr', amount: 65.20 },
    { name: 'May', amount: 58.00 },
    { name: 'Jun', amount: 72.40 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          Spending Insights
          <Sparkles className="w-6 h-6 text-indigo-500 fill-indigo-500" />
        </h2>
        <p className="text-slate-500 mt-1">Detailed analysis of your subscription habits and potential savings.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900">Spending Trend</h3>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingDown className="w-3 h-3" />
              -12% vs last mo
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Annual Projection */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Annual Projection</p>
                <p className="text-xs text-slate-400">If you don't cancel any subscriptions</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">${annualTotal.toFixed(2)}</p>
                <p className="text-xs text-slate-500">per year</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8">Spending by Category</h3>
          <div className="flex flex-col items-center gap-6">
            <div className="h-[250px] w-[250px] flex-shrink-0">
              <PieChart width={250} height={250}>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-[300px]">
              {categoriesData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || COLORS[idx % COLORS.length] }}></div>
                    <span className="text-sm font-medium text-slate-600 capitalize truncate">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 whitespace-nowrap">${cat.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};