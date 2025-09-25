'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Project } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function TimeSummaryChart({ projects }: { projects: Project[] }) {

  const data = useMemo(() => {
    const today = new Date();
    const last6Months: { name: string; hours: number }[] = [];

    // Initialize the last 6 months in order from oldest to newest
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
      last6Months.push({ name: monthName.charAt(0).toUpperCase() + monthName.slice(1), hours: 0 });
    }

    projects.forEach(project => {
      project.timeEntries?.forEach(entry => {
        if (entry.endTime) {
          const entryDate = new Date(entry.startTime);
          
          // Check if the entry date is within the last 6 months
          const diffMonths = (today.getFullYear() - entryDate.getFullYear()) * 12 + (today.getMonth() - entryDate.getMonth());
          if (diffMonths >= 0 && diffMonths < 6) {
             const monthName = entryDate.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
             const key = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            
             const durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
             const durationHours = durationMs / (1000 * 60 * 60);

             const monthInSummary = last6Months.find(m => m.name === key);
             if (monthInSummary) {
               monthInSummary.hours += durationHours;
             }
          }
        }
      });
    });
    
    // Round the hours for display
    last6Months.forEach(m => m.hours = Math.round(m.hours));

    return last6Months;

  }, [projects]);


  if (projects.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Horas dedicadas</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                 <p className="text-muted-foreground">No hay datos de tiempo para mostrar.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className='h-full w-full' style={{ minHeight: '300px' }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
          <Tooltip 
            cursor={{fill: 'hsl(var(--muted))', radius: 'var(--radius)'}}
            contentStyle={{background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
            labelStyle={{fontWeight: 'bold'}}
            formatter={(value: number) => [`${value.toFixed(0)} horas`, undefined]}
          />
          <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
