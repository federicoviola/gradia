'use server';

/**
 * @fileOverview This file defines the Genkit flow for AI-powered grading of student exams.
 *
 * - gradeExam - An async function that takes exam submissions and evaluation criteria as input, grades the exams using AI, and generates personalized feedback.
 * - AiPoweredGradingInput - The input type for the gradeExam function, including student exams and evaluation criteria.
 * - AiPoweredGradingOutput - The output type for the gradeExam function, providing grades and feedback for each student.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
export type { GenerateExamOutput } from './generate-exam';


// Define the schema for a single student's exam submission.
const StudentExamSchema = z.object({
  examSubmission: z.string().describe('The student\'s exam submission text.'),
});

// Define the schema for the evaluation criteria.
const EvaluationCriteriaSchema = z.object({
  criteria: z.string().describe('The evaluation criteria for grading the exams, including points per question, grading rubrics, and specific keywords or concepts to look for.'),
});

// Define the input schema for the AI-powered grading flow.
const AiPoweredGradingInputSchema = z.object({
  exams: z.array(StudentExamSchema).describe('An array of student exam submissions.'),
  evaluationCriteria: EvaluationCriteriaSchema.describe('The evaluation criteria for grading the exams.'),
});

export type AiPoweredGradingInput = z.infer<typeof AiPoweredGradingInputSchema>;

// Define the schema for the grading output, including the grade and feedback.
const GradingOutputSchema = z.object({
  studentId: z.string().describe('The full name of the student, extracted from the exam text. If not found, use "Unknown Student".'),
  grade: z.number().describe('The grade obtained by the student.'),
  feedback: z.string().describe('Personalized feedback for the student, explaining the rationale behind the grade and areas for improvement.'),
});

// Define the output schema for the AI-powered grading flow.
const AiPoweredGradingOutputSchema = z.array(GradingOutputSchema);

export type AiPoweredGradingOutput = z.infer<typeof AiPoweredGradingOutputSchema>;

// Define the gradeExam function that calls the AI-powered grading flow.
export async function gradeExam(input: AiPoweredGradingInput): Promise<AiPoweredGradingOutput> {
  return aiPoweredGradingFlow(input);
}

// Define the prompt for AI-powered grading.
const aiPoweredGradingPrompt = ai.definePrompt({
  name: 'aiPoweredGradingPrompt',
  input: {schema: AiPoweredGradingInputSchema},
  output: {schema: GradingOutputSchema.array()},
  prompt: `You are an AI-powered grading assistant. For each exam submission provided, you must first identify and extract the student's full name from the text. If you cannot find a name, use "Unknown Student". Then, grade the exam based on the evaluation criteria. Provide a grade, the extracted student name, and personalized feedback for each student.

Evaluation Criteria:
{{evaluationCriteria.criteria}}

Student Exams:
{{#each exams}}
---
Exam Submission:
{{examSubmission}}
---
{{/each}}`,
});

// Define the AI-powered grading flow.
const aiPoweredGradingFlow = ai.defineFlow(
  {
    name: 'aiPoweredGradingFlow',
    inputSchema: AiPoweredGradingInputSchema,
    outputSchema: AiPoweredGradingOutputSchema,
  },
  async input => {
    const {output} = await aiPoweredGradingPrompt(input);
    return output!;
  }
);
