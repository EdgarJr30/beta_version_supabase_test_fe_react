import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signUpUser, deleteUser } from '../../services/userService';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const { roles } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [roleId, setRoleId] = useState(2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase.rpc('get_users_with_email');

        if (error) {
            console.error("❌ Error al obtener usuarios:", error.message);
            return;
        }

        setUsers(data || []);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (roles !== 'admin') {
            setError('No tienes permisos para registrar usuarios.');
            setLoading(false);
            return;
        }

        const result = await signUpUser({ email, password, name, roleId });

        if (result.success) {
            setSuccess("✅ Usuario registrado correctamente.");
            fetchUsers();
            setEmail('');
            setPassword('');
            setName('');
            setRoleId(2);
            setShowForm(false);
        } else {
            setError(result.error || "Error al completar el registro.");
        }

        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
        if (!confirmDelete) return;

        setLoading(true);
        const result = await deleteUser(userId);

        if (result.success) {
            setSuccess("✅ Usuario eliminado correctamente.");
            fetchUsers();
        } else {
            setError(result.error || "Error al eliminar usuario.");
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 w-full p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Administración de Usuarios</h1>

            {roles !== 'admin' ? (
                <p className="text-red-500 text-center">No tienes permisos para acceder a esta página.</p>
            ) : (
                <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-4 md:p-6 lg:p-8">
                    {/* Botones de navegación */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Lista de Usuarios</h2>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full sm:w-auto"
                            >
                                {showForm ? "Cancelar" : "Agregar Usuario"}
                            </button>

                            <button
                                onClick={() => navigate('/tenant')}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition w-full sm:w-auto"
                            >
                                Ver Tenant
                            </button>

                            <button
                                onClick={() => navigate('/emision-eNCF')}
                                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition w-full sm:w-auto"
                            >
                                Ver Emisión eNCF
                            </button>
                        </div>
                    </div>

                    {/* Formulario de Registro */}
                    {showForm && (
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                            <h3 className="text-lg sm:text-xl font-bold mb-3">Registrar Usuario</h3>
                            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
                            <form onSubmit={handleSignUp} className="space-y-3">
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
                                <select
                                    value={roleId}
                                    onChange={(e) => setRoleId(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                >
                                    <option value={2}>Usuario</option>
                                    <option value={3}>Testing</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                                >
                                    {loading ? "Registrando..." : "Registrar Usuario"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Lista de Usuarios */}
                    <ul className="mt-4">
                        {users.length === 0 ? (
                            <p className="text-gray-500 text-center">No hay usuarios registrados.</p>
                        ) : (
                            users.map((user) => (
                                <li key={user.id} className="flex flex-col sm:flex-row justify-between items-center p-3 border-b gap-2">
                                    <span className="text-center sm:text-left truncate">{user.name} ({user.email})</span>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition w-full sm:w-auto"
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
