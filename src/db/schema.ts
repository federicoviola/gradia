import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Exam criteria
export const examCriteria = sqliteTable('exam_criteria', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    criteria: text('criteria').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Evaluations
export const evaluations = sqliteTable('evaluations', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    examType: text('exam_type'),
    examContent: text('exam_content'),
    evaluationCriteria: text('evaluation_criteria'),
    totalStudents: integer('total_students').default(0),
    averageGrade: text('average_grade'), // SQLite stores as text
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Results
export const results = sqliteTable('results', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    evaluationId: integer('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    studentName: text('student_name').notNull(),
    grade: text('grade').notNull(), // SQLite stores as text
    feedback: text('feedback').notNull(),
    submissionPath: text('submission_path'),
    gradedAt: integer('graded_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ExamCriteria = typeof examCriteria.$inferSelect;
export type NewExamCriteria = typeof examCriteria.$inferInsert;
export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
