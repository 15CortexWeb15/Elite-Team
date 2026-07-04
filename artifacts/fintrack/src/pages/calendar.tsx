import React, { useState } from 'react';
import { useGetCalendarData } from '@workspace/api-client-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12 for API

  const { data: calendarDays, isLoading } = useGetCalendarData(
    { year, month }, 
    { query: { queryKey: ['calendar', year, month] } }
  );

  const prevMonth = () => {
    setDate(new Date(year, date.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setDate(new Date(year, date.getMonth() + 1, 1));
  };

  const monthName = date.toLocaleString('default', { month: 'long' });

  // Generate calendar grid
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday
  
  // Pad beginning of grid
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Visualize your daily performance.</p>
        </div>
        <div className="flex items-center gap-4 bg-card px-2 py-1 rounded-lg border border-border">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-lg min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} disabled={month === new Date().getMonth() + 1 && year === new Date().getFullYear()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 p-6 flex flex-col min-h-[600px]">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-full min-h-[80px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="rounded-lg bg-muted/20 border border-transparent"></div>
            ))}
            
            {days.map(day => {
              // Format date string to match API (YYYY-MM-DD)
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayData = calendarDays?.find(d => d.date.startsWith(dateStr));
              
              let bgColor = "bg-card";
              let borderColor = "border-border";
              
              if (dayData) {
                if (dayData.result === 'win') {
                  bgColor = "bg-profit/10";
                  borderColor = "border-profit/20";
                } else if (dayData.result === 'loss') {
                  bgColor = "bg-loss/10";
                  borderColor = "border-loss/20";
                } else if (dayData.result === 'breakeven') {
                  bgColor = "bg-muted";
                  borderColor = "border-border";
                }
              }

              return (
                <div 
                  key={day} 
                  className={`rounded-lg border p-2 flex flex-col transition-colors ${bgColor} ${borderColor} hover:border-primary/50 cursor-default`}
                >
                  <span className="text-sm font-medium text-muted-foreground">{day}</span>
                  {dayData && dayData.tradeCount > 0 && (
                    <div className="mt-auto text-right">
                      <div className={`font-mono text-sm font-bold ${dayData.profitLoss > 0 ? 'text-profit' : dayData.profitLoss < 0 ? 'text-loss' : 'text-muted-foreground'}`}>
                        {formatMoney(dayData.profitLoss)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {dayData.tradeCount} trade{dayData.tradeCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}