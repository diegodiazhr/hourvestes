import { projects } from '@/lib/data';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Header } from '@/components/header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CasCategoryIcon } from '@/components/cas-category-icon';
import { CheckCircle2 } from 'lucide-react';
import { EvidenceSection } from '@/components/evidence-section';
import { ReflectionPrompts } from '@/components/reflection-prompts';

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = projects.find(p => p.id === params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
              <h1 className="text-4xl font-bold font-headline text-foreground">
                {project.name}
              </h1>
              <Badge
                variant="secondary"
                className="flex items-center gap-2 text-base px-4 py-2 shrink-0 capitalize"
              >
                <CasCategoryIcon
                  category={project.category}
                  className="h-5 w-5"
                />
                {project.category}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {format(project.startDate, 'MMMM d, yyyy')} -{' '}
              {project.progress === 'Completed'
                ? format(project.endDate, 'MMMM d, yyyy')
                : 'Present'}
            </p>
          </div>

          <Separator />

          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Project Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Goals & Learning Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Personal Goals</h3>
                    <p className="text-foreground/80 whitespace-pre-wrap">
                      {project.personalGoals}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">
                      Learning Outcomes Met
                    </h3>
                    <ul className="space-y-3">
                      {project.learningOutcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-foreground/80">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Reflections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 whitespace-pre-wrap">
                    {project.reflections}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8 sticky top-24">
              <EvidenceSection evidence={project.evidence} />
              <ReflectionPrompts project={project} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
