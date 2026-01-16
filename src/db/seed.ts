import { db } from './index';
import { users, examCriteria, evaluations, results } from './schema';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Crear Usuario de Prueba
    const passwordHash = await bcrypt.hash('password123', 10);
    const [testUser] = await db.insert(users).values({
        email: 'test@gradia.com',
        passwordHash: passwordHash,
        name: 'Profesor de Prueba',
    }).onConflictDoNothing({ target: users.email }).returning();

    const userId = testUser?.id || 1; // Fallback a ID 1 si ya existe y no retornó

    console.log(`✅ User created or verified: test@gradia.com (ID: ${userId})`);

    // 2. Crear Criterios de Prueba
    await db.insert(examCriteria).values([
        {
            userId,
            name: 'Matemáticas Básicas',
            criteria: 'Evaluar resolución de ecuaciones de primer grado, claridad en el procedimiento y resultado correcto.',
        },
        {
            userId,
            name: 'Historia Argentina',
            criteria: 'Evaluar comprensión de procesos históricos, fechas clave y capacidad de análisis crítico.',
        },
    ]);
    console.log('✅ Exam criteria seeded.');

    // 3. Crear una Evaluación de Ejemplo
    const [evaluation] = await db.insert(evaluations).values({
        userId,
        examType: 'Matemáticas',
        totalStudents: 5,
        averageGrade: '7.5',
        evaluationCriteria: 'Procedimiento (50%), Resultado (50%)',
        examContent: 'Examen de Álgebra - Primer Cuatrimestre',
    }).returning();

    console.log(`✅ Evaluation created: ${evaluation.id}`);

    // 4. Crear Resultados de Estudiantes
    await db.insert(results).values([
        {
            evaluationId: evaluation.id,
            userId,
            studentName: 'Juan Pérez',
            grade: '8.5',
            feedback: 'Excelente resolución de problemas. El procedimiento es claro y organizado. Sigue así.',
        },
        {
            evaluationId: evaluation.id,
            userId,
            studentName: 'María García',
            grade: '6.0',
            feedback: 'Buen intento, pero hubo errores en la transposición de términos. Revisa la teoría de signos.',
        },
        {
            evaluationId: evaluation.id,
            userId,
            studentName: 'Carlos Rodríguez',
            grade: '9.5',
            feedback: 'Perfecto. Nada que objetar. Demostraste un dominio total del tema.',
        },
        {
            evaluationId: evaluation.id,
            userId,
            studentName: 'Sofía Martínez',
            grade: '4.5',
            feedback: 'Lamentablemente no alcanzaste el mínimo. Te sugiero reforzar los conceptos de funciones.',
        },
        {
            evaluationId: evaluation.id,
            userId,
            studentName: 'Lucas Paz',
            grade: '9.0',
            feedback: 'Muy buen examen. Solo un pequeño detalle en la última pregunta, pero el razonamiento es correcto.',
        },
    ]);

    console.log('✅ Student results seeded.');
    console.log('✨ Seeding completed successfully!');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
