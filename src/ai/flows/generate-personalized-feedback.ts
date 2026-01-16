'use server';

/**
 * @fileOverview Generates personalized feedback for each student based on their exam performance and the evaluation criteria.
 *
 * - generatePersonalizedFeedback - A function that generates personalized feedback for a student.
 * - GeneratePersonalizedFeedbackInput - The input type for the generatePersonalizedFeedback function.
 * - GeneratePersonalizedFeedbackOutput - The return type for the generatePersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedFeedbackInputSchema = z.object({
  studentExam: z.string().describe('The student\'s exam submission.'),
  evaluationCriteria: z.string().describe('The evaluation criteria for the exam.'),
  studentGrade: z.string().describe('The grade of the student.'),
});

export type GeneratePersonalizedFeedbackInput = z.infer<
  typeof GeneratePersonalizedFeedbackInputSchema
>;

const GeneratePersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback for the student.'),
});

export type GeneratePersonalizedFeedbackOutput = z.infer<
  typeof GeneratePersonalizedFeedbackOutputSchema
>;

export async function generatePersonalizedFeedback(
  input: GeneratePersonalizedFeedbackInput
): Promise<GeneratePersonalizedFeedbackOutput> {
  return generatePersonalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedFeedbackPrompt',
  input: {schema: GeneratePersonalizedFeedbackInputSchema},
  output: {schema: GeneratePersonalizedFeedbackOutputSchema},
  prompt: `You are an expert educator providing personalized feedback to students based on their exam performance and the evaluation criteria.

  Student Grade: {{{studentGrade}}}
  Student Exam: {{{studentExam}}}
  Evaluation Criteria: {{{evaluationCriteria}}}

  Provide constructive feedback to the student, explaining the rationale behind the grade received and areas for improvement.
  The feedback should be encouraging and guide the student toward better understanding and performance.
  Focus on specific aspects of the exam and relate them to the evaluation criteria.
  The feedback must be in markdown format.
  `,
});

const generatePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedFeedbackFlow',
    inputSchema: GeneratePersonalizedFeedbackInputSchema,
    outputSchema: GeneratePersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
