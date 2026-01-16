import { pgTable, serial, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Exam criteria
export const examCriteria = pgTable('exam_criteria', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    criteria: text('criteria').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Evaluations
export const evaluations = pgTable('evaluations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    examType: varchar('exam_type', { length: 255 }),
    examContent: text('exam_content'),
    evaluationCriteria: text('evaluation_criteria'),
    totalStudents: integer('total_students').default(0),
    averageGrade: varchar('average_grade', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Results
export const results = pgTable('results', {
    id: serial('id').primaryKey(),
    evaluationId: integer('evaluation_id').notNull().references(() => evaluations.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    studentName: varchar('student_name', { length: 255 }).notNull(),
    grade: varchar('grade', { length: 50 }).notNull(),
    feedback: text('feedback').notNull(),
    submissionPath: text('submission_path'),
    gradedAt: timestamp('graded_at', { withTimezone: true }).defaultNow(),
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
