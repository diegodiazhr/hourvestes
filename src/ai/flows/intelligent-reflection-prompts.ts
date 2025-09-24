
// src/ai/flows/intelligent-reflection-prompts.ts
'use server';

/**
 * @fileOverview Provides intelligent reflection prompts for CAS projects.
 *
 * - generateReflectionPrompts - Generates reflection prompts based on project details.
 * - ReflectionPromptInput - Input type for the generateReflectionPrompts function.
 * - ReflectionPromptOutput - Output type for the generateReflectionPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReflectionPromptInputSchema = z.object({
  projectType: z
    .string()
    .describe('The type of CAS project (e.g., Creativity, Activity, Service).'),
  projectProgress: z.string().describe('The current progress of the project (e.g., Planning, Implementation, Completion).'),
  studentGoals: z.string().describe('The student’s stated goals for the project.'),
  projectDescription: z.string().describe('A brief description of the project.'),
});
export type ReflectionPromptInput = z.infer<typeof ReflectionPromptInputSchema>;

const ReflectionPromptOutputSchema = z.object({
  reflectionPrompts: z.array(z.string()).describe('A list of reflection prompts tailored to the project details.'),
});
export type ReflectionPromptOutput = z.infer<typeof ReflectionPromptOutputSchema>;

export async function generateReflectionPrompts(input: ReflectionPromptInput): Promise<ReflectionPromptOutput> {
  return reflectionPromptsFlow(input);
}

const reflectionPromptsPrompt = ai.definePrompt({
  name: 'reflectionPromptsPrompt',
  input: {schema: ReflectionPromptInputSchema},
  output: {schema: ReflectionPromptOutputSchema},
  prompt: `You are an AI assistant designed to provide insightful reflection prompts for students undertaking CAS projects as part of the International Baccalaureate Diploma Programme.

  Based on the details of the student's project, generate a list of reflection prompts to help the student think critically about their experiences and document their learning journey effectively.

  IMPORTANT: All your responses and reflection prompts must be in Spanish.

  Consider the project type, progress, the student's goals, and the project description when creating the prompts.

  Project Type: {{{projectType}}}
  Project Progress: {{{projectProgress}}}
  Student Goals: {{{studentGoals}}}
  Project Description: {{{projectDescription}}}

  Reflection Prompts:
  `,
});

const reflectionPromptsFlow = ai.defineFlow(
  {
    name: 'reflectionPromptsFlow',
    inputSchema: ReflectionPromptInputSchema,
    outputSchema: ReflectionPromptOutputSchema,
  },
  async input => {
    const {output} = await reflectionPromptsPrompt(input);
    return output!;
  }
);
