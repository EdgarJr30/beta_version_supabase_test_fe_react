import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../context/NotificationProvider'; // Asumiendo que ya usas esto

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { notifyToast, notifySwal } = useNotification();

  const signUpUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1) Crear usuario en auth.users
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // Guardar 'name' en la metadata (opcional)
        },
      });

      if (signUpError) {
        notifySwal(`Error al crear usuario: ${signUpError.message}`, 'error');
        setLoading(false);
        return;
      }

      notifyToast('✅ Usuario creado correctamente', 'success');
      console.log('✅ Usuario creado en auth.users:', data);

      // 2) Llamar a la función con SECURITY DEFINER en la BD para insertar en public.users
      const { user } = data;
      if (user) {
        const { error: rpcError } = await supabase.rpc('create_user_in_public', {
          p_id: user.id,
          p_email: email,
          p_name: name,
          p_rol_id: 2, // rol "user" por defecto
        });

        if (rpcError) {
          notifySwal(`Error al registrar en public.users: ${rpcError.message}`, 'error');
          setError("Error al completar el registro en public.users (RPC falló).");
        } else {
          notifyToast('🎉 Registro completo. Revisa tu correo para confirmar.', 'success');
          console.log('✅ Usuario agregado a public.users vía RPC');
          // Aquí podrías redirigir al login o limpiar los campos
        }
      }
    } catch (err: unknown) {
      console.error('❌ Error general al registrar usuario:', err);
      notifySwal(`Error general al registrar: ${String(err)}`, 'error');
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Registro</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={signUpUser} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
}
