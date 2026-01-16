import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // These will be needed for storage/auth
    // console.warn('Supabase credentials not found in env');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
