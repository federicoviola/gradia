import type { GenerateExamOutput } from '@/ai/flows/generate-exam';
import { z } from 'zod';

export type GradingResult = {
    studentId: string;
    grade: number;
    feedback: string;
};

export type GeneratedExam = GenerateExamOutput;

export const gradingFormSchema = z.object({
  evaluationCriteria: z.string().min(10, 'Evaluation criteria must be at least 10 characters long.'),
  examFiles: z.array(z.string()).min(1, 'At least one exam file is required.'),
});

export const examGeneratorFormSchema = z.object({
  examTopic: z.string().optional(),
  examType: z.enum(['multiple-choice', 'open-questions', 'essay', 'practical-work-from-document']),
  sourceFile: z.string().optional(),
  instructions: z.string().optional(),
}).refine(data => {
  if (data.examType === 'practical-work-from-document') {
    return !!data.instructions || !!data.examTopic;
  }
  return !!data.examTopic;
}, {
  message: 'Topic or instructions are required to generate content.',
  path: ['examTopic'],
});


export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

export type SavedCriteria = {
  id: string;
  name: string;
  criteria: string;
};
