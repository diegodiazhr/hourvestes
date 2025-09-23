'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Project } from '@/lib/types';
import { useMemo } from 'react';
import { BarChart } from 'lucide-react';

const COLORS = {
  Creatividad: 'hsl(var(--chart-1))',
  Actividad: 'hsl(var(--chart-2))',
  Servicio: 'hsl(var(--chart-4))',
};

export function TimeSummaryChart({ projects }: { projects: Project[] }) {

  const data = useMemo(() => {
    const summary = {
      Creatividad: 0,
      Actividad: 0,
      Servicio: 0,
    };

    projects.forEach(project => {
      const projectTime = project.timeEntries?.reduce((acc, entry) => {
        if(entry.endTime){
          const start = new Date(entry.startTime).getTime();
          const end = new Date(entry.endTime).getTime();
          return acc + (end - start);
        }
        return acc;
      }, 0) || 0;
      summary[project.category] += projectTime;
    });

    return Object.entries(summary).map(([name, value]) => ({
      name,
      value: Math.round(value / (1000 * 60 * 60)) // convert ms to hours
    })).filter(d => d.value > 0);

  }, [projects]);


  if (data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BarChart/> Resumen de Tiempo</CardTitle>
                <CardDescription>Visualiza el tiempo por categoría.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p>No hay datos de tiempo para mostrar.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><BarChart/>Resumen de Tiempo</CardTitle>
        <CardDescription>Horas dedicadas por categoría de CAS</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} horas`}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
