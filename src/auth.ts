import NextAuth from 'next-auth';
import authConfig from '@/auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper para obtener sesión en Server Components
export const getSession = auth;

// Helper para obtener userId  
export async function getCurrentUserId(): Promise<number | null> {
    const session = await auth();
    return session?.user?.id ? parseInt(session.user.id) : null;
}
