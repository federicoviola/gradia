import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        // Validación
        if (!email || !password || password.length < 6) {
            return NextResponse.json(
                { error: 'Invalid credentials. Password must be at least 6 characters.' },
                { status: 400 }
            );
        }

        // Verificar si el usuario ya existe
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        await db.insert(users).values({
            email,
            passwordHash,
            name: name || null,
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
