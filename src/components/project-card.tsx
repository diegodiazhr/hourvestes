import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CasCategoryIcon } from '@/components/cas-category-icon';
import type { Project } from '@/lib/types';
import { format } from 'date-fns';

type Props = {
  project: Project;
};

const progressValues = {
  Planning: 25,
  'In Progress': 60,
  Completed: 100,
};

const progressColors = {
    Planning: 'bg-blue-400',
    'In Progress': 'bg-yellow-400',
    Completed: 'bg-green-500',
}

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block group"
    >
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 rounded-lg shadow-sm hover:shadow-lg hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="font-headline text-xl mb-2 group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <Badge
              variant="secondary"
              className="flex items-center gap-2 shrink-0 capitalize"
            >
              <CasCategoryIcon category={project.category} className="h-4 w-4" />
              {project.category}
            </Badge>
          </div>
          <CardDescription>
            {format(project.startDate, 'MMM yyyy')} -{' '}
            {project.progress === 'Completed' ? format(project.endDate, 'MMM yyyy') : 'Present'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-3">
            {project.description}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {project.progress}
          </p>
          <Progress value={progressValues[project.progress]} className="h-2" />
        </CardFooter>
      </Card>
    </Link>
  );
}
