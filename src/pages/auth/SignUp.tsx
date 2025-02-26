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

    // 1️⃣ Crear usuario en auth.users
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Guardar el nombre en metadata
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    console.log("✅ Usuario creado en auth.users:", data);

    // 2️⃣ Insertar usuario en public.users con el mismo UUID
    const { user } = data;
    if (user) {
      const { error: userError } = await supabase
        .from('users')
        .insert([
          { id: user.id, name, rol_id: 2 } // 2 = Usuario normal por defecto
        ]);

      if (userError) {
        console.error("❌ Error al insertar en public.users:", userError.message);
        setError("Error al completar el registro.");
      } else {
        console.log("✅ Usuario agregado a public.users");
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
