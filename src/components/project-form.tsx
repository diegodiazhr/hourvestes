'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { learningOutcomes, type CASCategory } from '@/lib/types';
import { createProjectAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { CasCategoryIcon } from './cas-category-icon';
import { useState } from 'react';

const projectFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Project name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  category: z.enum(['Creativity', 'Activity', 'Service'], {
    required_error: 'You need to select a project category.',
  }),
  dates: z.object(
    {
      from: z.date({ required_error: 'A start date is required.' }),
      to: z.date({ required_error: 'An end date is required.' }),
    },
    { required_error: 'Project dates are required.' }
  ),
  learningOutcomes: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one learning outcome.',
  }),
  personalGoals: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const defaultValues: Partial<ProjectFormValues> = {
  learningOutcomes: [],
};

export function ProjectForm() {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProjectFormValues) {
    setIsPending(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('dates', JSON.stringify(data.dates));
    formData.append('learningOutcomes', data.learningOutcomes.join(','));
    if(data.personalGoals) formData.append('personalGoals', data.personalGoals);
    
    try {
        await createProjectAction(formData);
        toast({
            title: "Project Created!",
            description: "Your new CAS project has been saved successfully.",
        });
    } catch(e) {
        toast({
            title: "Error",
            description: "Failed to create project. Please try again.",
            variant: 'destructive',
        });
    } finally {
        setIsPending(false);
    }

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Community Mural Painting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about your project"
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Project Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value?.from && 'text-muted-foreground'
                          )}
                        >
                          {field.value?.from ? (
                            <>
                              {format(field.value.from, 'LLL dd, y')} -{' '}
                              {field.value.to ? format(field.value.to, 'LLL dd, y') : '...'}
                            </>
                          ) : (
                            <span>Pick a date range</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CAS Category</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {(['Creativity', 'Activity', 'Service'] as const).map((category: CASCategory) => (
                        <FormItem key={category}>
                            <Label className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                                <FormControl>
                                    <RadioGroupItem value={category} className="sr-only" />
                                </FormControl>
                                <div className="flex flex-col items-center justify-center p-4 border-2 border-muted bg-transparent rounded-lg cursor-pointer">
                                    <CasCategoryIcon category={category} className="w-8 h-8 mb-2" />
                                    <span className="font-semibold">{category}</span>
                                </div>
                            </Label>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Goals & Outcomes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="personalGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What do you hope to achieve with this project?"
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="learningOutcomes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Learning Outcomes</FormLabel>
                    <FormDescription>
                      Select all the learning outcomes you aim to meet.
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                  {learningOutcomes.map(item => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="learningOutcomes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={checked => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        field.value?.filter(
                                          value => value !== item
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
      </form>
    </Form>
  );
}
