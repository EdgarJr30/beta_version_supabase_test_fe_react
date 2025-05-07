import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppVersion from '../../components/AppVersion';
import { useNotification } from "../../context/NotificationProvider";
import TurnstileCaptcha from '../../components/TurnstileCaptcha';
import { forgotPassword } from '../../utils/forgotPassword';

export default function Login() {
    const { session } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const { notifyToast } = useNotification();

    useEffect(() => {
        if (session) {
            navigate('/');
        }
    }, [session, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validar que el usuario haya completado el captcha
        if (!import.meta.env.DEV && !captchaToken) {
            notifyToast("Por favor, completa el CAPTCHA antes de iniciar sesión.", "error");
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            // setError(error.message);
            notifyToast("Invalid login credentials", "error");

        }
        else {
            console.log("Inicio de sesión exitoso con Captcha:", captchaToken);
        }
    };

    const handleForgotPassword = async (e: React.MouseEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            notifyToast("Por favor, ingresa tu correo primero.", "error");
            return;
        }

        const { success, error: forgotError } = await forgotPassword(email);
        if (!success) {
            notifyToast(`${forgotError}` || "Error al enviar el enlace de recuperación.", "error");
        } else {
            notifyToast("Se ha enviado un enlace de recuperación a tu correo.", "success");
        }
    };

    return (
        <div className="flex min-h-screen flex-1">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <img
                            alt="Your Company"
                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                            className="h-10 w-auto"
                        />
                        <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">Sistema de facturación electrónica</h2>
                    </div>

                    <div className="mt-10">
                        <div>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                        Correo electrónico
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="Correo electrónico"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                        Contraseña
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">

                                    <div className="text-sm/6">
                                        <a href="#" onClick={handleForgotPassword} className="font-semibold text-indigo-600 hover:text-indigo-500">
                                            Olvidaste tu Contraseña?
                                        </a>
                                    </div>
                                </div>
                                {/* Captcha */}
                                <div>
                                    {!import.meta.env.DEV && <TurnstileCaptcha onSuccess={setCaptchaToken} />}
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Iniciar Sesión
                                    </button>
                                </div>
                            </form>
                            <p className="mt-10 text-center text-sm/6 text-gray-500">
                                Desarrollado por {' '}
                                <a href="" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    Tejada Tech Group
                                </a>
                            </p>
                            <AppVersion />
                            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative hidden w-0 flex-1 lg:block">
                <img
                    alt=""
                    src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
                    className="absolute inset-0 size-full object-cover"
                />
            </div>
        </div>
    );
}
