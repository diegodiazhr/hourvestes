'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Project } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function TimeSummaryChart({ projects }: { projects: Project[] }) {

  const data = useMemo(() => {
    const monthlySummary: { [key: string]: number } = {};

    projects.forEach(project => {
      project.timeEntries?.forEach(entry => {
        if (entry.endTime) {
          const entryDate = new Date(entry.startTime);
          const month = entryDate.toLocaleString('es-ES', { month: 'short' });
          const year = entryDate.getFullYear();
          const key = `${month.charAt(0).toUpperCase() + month.slice(1)}`;

          const durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
          const durationHours = durationMs / (1000 * 60 * 60);

          if (!monthlySummary[key]) {
            monthlySummary[key] = 0;
          }
          monthlySummary[key] += durationHours;
        }
      });
    });

    const monthOrder = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const sortedData = Object.entries(monthlySummary)
      .map(([name, hours]) => ({ name, hours: Math.round(hours) }))
      .sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
      
    // Fill in missing months up to the current month
    const currentMonthIndex = new Date().getMonth();
    const result = [];
    for(let i=0; i<=currentMonthIndex; i++){
        const monthName = monthOrder[i];
        const existingMonth = sortedData.find(d => d.name === monthName);
        if(existingMonth) {
            result.push(existingMonth);
        } else {
            result.push({name: monthName, hours: 0});
        }
    }
    // For now, let's just use the last 5 months for display
    return result.slice(-5);


  }, [projects]);


  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>No hay datos de tiempo para mostrar.</p>
        </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} Hr`} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
            labelStyle={{fontWeight: 'bold'}}
            formatter={(value: number) => [`${value} horas`, undefined]}
          />
          <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
