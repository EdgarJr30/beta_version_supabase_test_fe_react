import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signUpUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1) Crear usuario en auth.users
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Opcional: guardar 'name' en la metadata
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    console.log("✅ Usuario creado en auth.users:", data);

    // 2) Llamar a la función con SECURITY DEFINER en la BD para insertar en public.users
    const { user } = data;
    if (user) {
      // p_rol_id = 2 como ejemplo de "rol user"
      const { error: rpcError } = await supabase.rpc('create_user_in_public', {
        p_id: user.id,
        p_email: email,
        p_name: name,
        p_rol_id: 2,
      });

      if (rpcError) {
        console.error("❌ Error al ejecutar create_user_in_public:", rpcError.message);
        setError("Error al completar el registro en public.users (RPC falló).");
      } else {
        console.log("✅ Usuario agregado a public.users vía SECURITY DEFINER function");
      }
    }

    setLoading(false);
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
