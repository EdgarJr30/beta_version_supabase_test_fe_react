import { supabase } from '../lib/supabaseClient';

export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 'redirectTo' es opcional, pero si deseas que el usuario sea redirigido
    // a una página específica después de restablecer, configúralo:
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password', 
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
