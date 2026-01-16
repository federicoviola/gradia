'use server';

/**
 * @fileOverview This file defines the Genkit flow for generating exams and practical work.
 *
 * - generateExam - An async function that takes a topic, exam type, and optional source text to create an exam with evaluation criteria.
 * - GenerateExamInput - The input type for the generateExam function.
 * - GenerateExamOutput - The output type for the generateExam function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the exam generation flow.
const GenerateExamInputSchema = z.object({
  topic: z.string().optional().describe('The topic of the exam.'),
  type: z.enum(['multiple-choice', 'open-questions', 'essay', 'practical-work-from-document']).describe('The type of exam to generate.'),
  sourceText: z.string().optional().describe('The source text from a document for generating a practical work assignment.'),
  instructions: z.string().optional().describe('Specific instructions for the practical work assignment.'),
});

export type GenerateExamInput = z.infer<typeof GenerateExamInputSchema>;

// Define the output schema for the exam generation flow.
const GenerateExamOutputSchema = z.object({
  examContent: z.string().describe('The full content of the generated exam or practical work in Markdown format.'),
  evaluationCriteria: z.string().describe('The detailed evaluation criteria for the assignment, also in Markdown format. This should be suitable for use in a subsequent grading task.'),
});

export type GenerateExamOutput = z.infer<typeof GenerateExamOutputSchema>;

// Define the generateExam function that calls the exam generation flow.
export async function generateExam(input: GenerateExamInput): Promise<GenerateExamOutput> {
  return generateExamFlow(input);
}

// Define the prompt for exam generation.
const generateExamPrompt = ai.definePrompt({
  name: 'generateExamPrompt',
  input: {schema: GenerateExamInputSchema},
  output: {schema: GenerateExamOutputSchema},
  prompt: `You are an AI assistant for creating educational materials. Your task is to generate an exam OR a practical work assignment AND a detailed set of evaluation criteria based on the provided inputs. The entire output must be in Markdown format.

Exam Type: {{type}}
{{#if topic}}
Topic: {{topic}}
{{/if}}

Instructions for Generation:
- If 'type' is 'multiple-choice', provide 10 questions on the given 'topic', each with 4 options (A, B, C, D) and clearly indicate the correct answer.
- If 'type' is 'open-questions', provide 10 thought-provoking questions on the given 'topic' that require detailed answers.
- If 'type' is 'essay', provide 3 essay prompts on the given 'topic' that require in-depth analysis and argumentation.
- If 'type' is 'practical-work-from-document', generate a practical work assignment (trabajo práctico). Use the provided 'sourceText' if available, otherwise generate it based on the 'topic' and 'instructions'.
{{#if instructions}}
- Follow these specific instructions: {{instructions}}
{{/if}}

Instructions for Evaluation Criteria:
- Generate a detailed evaluation criteria that can be used by an AI to grade the assignment you just created.
- For each question or task, specify the points awarded and what constitutes a correct or high-quality answer.
- Include keywords, concepts, or specific points that should be mentioned.
- For essays or open questions, define a rubric (e.g., clarity, use of evidence, structure, understanding of the source text).
- This criteria section must be comprehensive enough for a separate grading process.

{{#if sourceText}}
Source Text for Practical Work:
---
{{sourceText}}
---
{{/if}}

Generate both the content and the evaluation criteria now.
`,
});

// Define the exam generation flow.
const generateExamFlow = ai.defineFlow(
  {
    name: 'generateExamFlow',
    inputSchema: GenerateExamInputSchema,
    outputSchema: GenerateExamOutputSchema,
  },
  async input => {
    const {output} = await generateExamPrompt(input);
    return output!;
  }
);
