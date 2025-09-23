// In a real app, you would connect to a database here.
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(['Creativity', 'Activity', 'Service']),
  dates: z.string(),
  learningOutcomes: z.string(),
  personalGoals: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const data = {
    ...rawData,
    dates: JSON.parse(rawData.dates as string),
    learningOutcomes: (rawData.learningOutcomes as string).split(','),
  }
  console.log('New project created (simulated):', data);

  revalidatePath('/');
  redirect('/');
}
