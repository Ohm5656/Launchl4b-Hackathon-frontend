import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { Subscription } from './Dashboard';

interface CalendarViewProps {
  subscriptions: Subscription[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  const blanks = Array(startDay).fill(null);
  const days = [...blanks, ...dateRange];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDaySubs = (day: Date | null) => {
    if (!day) return [];
    return subscriptions.filter(sub => {
      const subDate = new Date(sub.nextBillingDate);
      return isSameDay(subDate, day);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{format(currentDate, 'MMMM yyyy')}</h2>
            <p className="text-slate-500 text-sm">Visualize your upcoming billing cycle</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
          {days.map((day, idx) => {
            const daySubs = getDaySubs(day);
            const isToday = day && isSameDay(day, new Date());
            
            return (
              <div 
                key={idx} 
                className={clsx(
                  "min-h-[120px] bg-white p-2 transition-all group relative",
                  !day && "bg-slate-50/50"
                )}
              >
                {day && (
                  <>
                    <span className={clsx(
                      "text-sm font-semibold inline-flex items-center justify-center w-7 h-7 rounded-lg",
                      isToday ? "bg-indigo-600 text-white" : "text-slate-500"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    <div className="mt-2 space-y-1">
                      {daySubs.map(sub => (
                        <div 
                          key={sub.id} 
                          className="px-2 py-1 rounded-md text-[10px] font-bold text-white truncate shadow-sm cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Billing Summary
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due this month</p>
              <p className="text-2xl font-bold text-slate-900">
                ${subscriptions
                  .filter(s => isSameMonth(new Date(s.nextBillingDate), currentDate))
                  .reduce((acc, s) => acc + s.price, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Next Payment</p>
              {subscriptions.length > 0 ? (
                <div>
                  <p className="font-bold text-slate-900">{subscriptions[0].name}</p>
                  <p className="text-sm text-slate-500">{format(new Date(subscriptions[0].nextBillingDate), 'MMM d, yyyy')}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No upcoming payments</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};