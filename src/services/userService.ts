import { supabase } from '../lib/supabaseClient';

interface SignUpUserProps {
  email: string;
  password: string;
  name: string;
  roleId: number;
}

export async function signUpUser({ email, password, name, roleId }: SignUpUserProps) {
  try {
    //Crear usuario en auth.users
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Guardar el nombre en metadata
      },
    });

    if (error) throw new Error(error.message);

    console.log("✅ Usuario creado en auth.users:", data);

    //Insertar usuario en public.users con el mismo UUID
    const { user } = data;
    if (user) {
      const { error: userError } = await supabase
        .from('users')
        .insert([
          { id: user.id, name, rol_id: roleId } // Usar el ID generado en auth.users
        ]);

      if (userError) throw new Error(userError.message);

      console.log("✅ Usuario agregado a public.users");
    }

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error en signUpUser:", error.message);
      return { success: false, error: error.message };
    }
    console.error("❌ Error en signUpUser:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteUser(userId: string) {
    try {
      // Eliminar usuario de `auth.users` (esto eliminará `public.users` automáticamente)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
      if (authError) throw new Error(authError.message);
  
      console.log(`✅ Usuario con ID ${userId} eliminado correctamente.`);
  
      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ Error al eliminar usuario:", error.message);
        return { success: false, error: error.message };
      }
      console.error("❌ Error al eliminar usuario:", error);
      return { success: false, error: String(error) };
    }
  }
  
  
