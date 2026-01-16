'use server';

import { gradeExam, type AiPoweredGradingInput, type AiPoweredGradingOutput } from '@/ai/flows/ai-powered-grading';
import { generateExam, type GenerateExamOutput, type GenerateExamInput } from '@/ai/flows/generate-exam';
import { type gradingFormSchema, type examGeneratorFormSchema } from '@/lib/types';
import { z } from 'zod';
import pdf from 'pdf-parse';
import { getCurrentUserId } from '@/auth';
import { db } from '@/db';
import { examCriteria, evaluations, results } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';

// Helper para extraer texto de PDF
async function extractTextFromPdf(fileBuffer: Buffer) {
  try {
    const data = await pdf(fileBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF.');
  }
}

// Helper para guardar archivo PDF
async function savePdfFile(fileBuffer: Buffer, filename: string): Promise<string> {
  const uploadsDir = join(process.cwd(), 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const uniqueFilename = `${nanoid()}-${filename}`;
  const filepath = join(uploadsDir, uniqueFilename);

  await writeFile(filepath, fileBuffer);
  return `/uploads/${uniqueFilename}`;
}

export async function gradeStudentExams(
  data: z.infer<typeof gradingFormSchema>
): Promise<{ success: boolean; data?: AiPoweredGradingOutput; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Procesar PDFs
    const processedExams = await Promise.all(
      data.examFiles.map(async (fileData, index) => {
        const fileBuffer = Buffer.from(fileData, 'base64');
        const submissionText = await extractTextFromPdf(fileBuffer);
        const submissionPath = await savePdfFile(fileBuffer, `exam-${index}.pdf`);

        return {
          examSubmission: submissionText,
          submissionPath,
        };
      })
    );

    // Llamar a IA
    const aiInput: AiPoweredGradingInput = {
      exams: processedExams.map(e => ({ examSubmission: e.examSubmission })),
      evaluationCriteria: { criteria: data.evaluationCriteria },
    };

    const gradingResults = await gradeExam(aiInput);

    if (!gradingResults || !Array.isArray(gradingResults)) {
      return { success: false, error: 'AI grading failed to return a valid response.' };
    }

    // Calcular promedio
    const totalGrade = gradingResults.reduce((sum, r) => sum + r.grade, 0);
    const averageGrade = totalGrade / gradingResults.length;

    // Crear evaluación
    const [evaluation] = await db
      .insert(evaluations)
      .values({
        userId,
        examType: 'manual',
        evaluationCriteria: data.evaluationCriteria,
        totalStudents: gradingResults.length,
        averageGrade: averageGrade.toFixed(2),
      })
      .returning();

    // Guardar resultados
    await db
      .insert(results)
      .values(
        gradingResults.map((result, index) => ({
          evaluationId: evaluation.id,
          userId,
          studentName: result.studentId,
          grade: result.grade.toString(),
          feedback: result.feedback,
          submissionPath: processedExams[index]?.submissionPath || null,
        }))
      );

    return { success: true, data: gradingResults };
  } catch (error) {
    console.error('Error during grading:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Grading failed: ${errorMessage}` };
  }
}

export async function generateExamAction(
  data: z.infer<typeof examGeneratorFormSchema>
): Promise<{ success: boolean; data?: GenerateExamOutput; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    let sourceText: string | undefined = undefined;
    if (data.sourceFile) {
      const fileBuffer = Buffer.from(data.sourceFile, 'base64');
      sourceText = await extractTextFromPdf(fileBuffer);
    }

    const input: GenerateExamInput = {
      topic: data.examTopic,
      type: data.examType,
      sourceText,
      instructions: data.instructions,
    };

    const result = await generateExam(input);

    if (!result?.examContent || !result?.evaluationCriteria) {
      return { success: false, error: 'AI failed to generate a valid exam structure.' };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating exam:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Exam generation failed: ${errorMessage}` };
  }
}

export async function saveCriteria(
  data: { name: string; criteria: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Not authenticated' };
    }

    await db.insert(examCriteria).values({
      userId,
      name: data.name,
      criteria: data.criteria,
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving criteria:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Could not save criteria: ${errorMessage}` };
  }
}

export async function getSavedCriteria(): Promise<Array<{
  id: string;
  name: string;
  criteria: string;
}> | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const criteria = await db
      .select()
      .from(examCriteria)
      .where(eq(examCriteria.userId, userId))
      .orderBy(desc(examCriteria.createdAt));

    return criteria.map(c => ({
      id: c.id.toString(),
      name: c.name,
      criteria: c.criteria,
    }));
  } catch (error) {
    console.error('Error fetching criteria:', error);
    return null;
  }
}

// Nueva acción: obtener historial de evaluaciones
export async function getEvaluationHistory() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    return await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.userId, userId))
      .orderBy(desc(evaluations.createdAt))
      .limit(20);
  } catch (error) {
    console.error('Error fetching evaluation history:', error);
    return null;
  }
}

// Nueva acción: obtener estadísticas del dashboard
export async function getEvaluationStats() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const allEvaluations = await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.userId, userId));

    if (allEvaluations.length === 0) {
      return {
        totalEvaluations: 0,
        thisMonth: 0,
        averageGrade: '0.0',
        totalStudents: 0,
      };
    }

    const now = new Date();
    const thisMonth = allEvaluations.filter(e => {
      const date = new Date(e.createdAt || 0);
      return date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    });

    const totalStudents = allEvaluations.reduce((sum, e) => sum + (e.totalStudents || 0), 0);
    const avgGrade = allEvaluations.reduce((sum, e) => sum + parseFloat(e.averageGrade || '0'), 0) / allEvaluations.length;

    return {
      totalEvaluations: allEvaluations.length,
      thisMonth: thisMonth.length,
      averageGrade: avgGrade.toFixed(1),
      totalStudents,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}
// Nueva acción: obtener resultados completos de una evaluación
export async function getEvaluationResults(evaluationId: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // Get evaluation
    const [evaluation] = await db
      .select()
      .from(evaluations)
      .where(
        and(
          eq(evaluations.id, evaluationId),
          eq(evaluations.userId, userId)
        )
      )
      .limit(1);

    if (!evaluation) return null;

    // Get results
    const resultsList = await db
      .select()
      .from(results)
      .where(eq(results.evaluationId, evaluationId))
      .orderBy(desc(results.grade));

    return {
      evaluation,
      results: resultsList,
    };
  } catch (error) {
    console.error('Error fetching evaluation results:', error);
    return null;
  }
}
