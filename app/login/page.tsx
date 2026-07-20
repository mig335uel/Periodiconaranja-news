// TypeScript
"use client"

import { useState } from "react";
import Header from "@/app/Header";
import { useRouter } from "next/navigation";

interface LoginData {
    email: string;
    password: string;
}


interface RegisterData {
    name: string;
    last_name: string;
    display_name?: string;
    email: string;
    password: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginData>({ email: "", password: "" });
    const [registerData, setRegisterData] = useState<RegisterData>({ name: "", last_name: "", display_name: "", email: "", password: "" });
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleGoogleSignIn = async () => {
        // TODO: Agrega tu lógica de inicio de sesión con Google aquí
        console.log("Iniciando sesión con Google...");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isRegistering) {
            setRegisterData({ ...registerData, [e.target.name]: e.target.value });
            return;
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.success);
                router.push("/");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (registerData.password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        try {
            setRegisterData({ ...registerData, display_name: `${registerData.name} ${registerData.last_name}` });
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(data.success);
                router.push("/");
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <>
            <Header />
            <div className="max-w-md mx-auto mt-8">
                <button 
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white border border-gray-300 text-gray-700 p-4 rounded hover:bg-gray-50 transition font-bold flex items-center justify-center shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 mr-3">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Inicia Sesión con Google
                </button>
            </div>

            <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Inicia Sesión</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-600 mb-4">{success}</p>}
                <form onSubmit={handleSubmit} className={!isRegistering ? "space-y-4" : "hidden"}>
                    <input
                        type="email"
                        value={formData.email}
                        className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                        onChange={handleChange}
                        id="email"
                        name="email"
                        placeholder="Correo Electrónico"
                        required
                    />
                    <div className="mb-4">
                        <input
                            type="password"
                            value={formData.password}
                            className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                            id="login-password"
                            name="password"
                            placeholder="Contraseña"
                            required
                        />
                        <input
                            type="checkbox"
                            className="mt-2"
                            id="showPassword"
                            onChange={(e) => {
                                const passwordInput = document.getElementById("login-password") as HTMLInputElement | null;
                                if (!passwordInput) return;
                                passwordInput.type = e.target.checked ? "text" : "password";
                            }}
                        />
                        <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600">
                            Mostrar Contraseña
                        </label>
                    </div>
                    <div className="text-sm text-orange-500 hover:underline" onClick={() => setIsRegistering(true)}>
                        ¿No tienes una cuenta? Regístrate
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="w-full bg-orange-500 text-white p-4 rounded hover:bg-orange-600 transition">
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
                <form onSubmit={handleRegister} className={isRegistering ? "space-y-4" : "hidden"}>
                    <input
                        type="text"
                        value={registerData.name}
                        className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                        onChange={handleChange}
                        id="name"
                        name="name"
                        placeholder="Nombre"
                        required
                    />
                    <input
                        type="text"
                        value={registerData.last_name}
                        className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                        onChange={handleChange}
                        id="last_name"
                        name="last_name"
                        placeholder="Apellidos"
                        required
                    />


                    <input
                        type="email"
                        value={registerData.email}
                        className="w-full p-4 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                        onChange={handleChange}
                        id="email"
                        name="email"
                        placeholder="Correo Electrónico"
                        required
                    />
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={registerData.password}
                            className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={handleChange}
                            id="register-password"
                            name="password"
                            placeholder="Contraseña"
                            required
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Confirmar Contraseña"
                            required
                        />

                        <input
                            type="checkbox"
                            className="mt-2"
                            id="showPassword"
                            onChange={(e) => {
                                const passwordInput = document.getElementById("register-password") as HTMLInputElement | null;
                                if (!passwordInput) return;
                                passwordInput.type = e.target.checked ? "text" : "password";
                                const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement | null;
                                if (!confirmPasswordInput) return;
                                confirmPasswordInput.type = e.target.checked ? "text" : "password";
                            }}
                        />

                        <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600">
                            Mostrar Contraseña
                        </label>
                    </div>
                    <div className="flex items-center justify-between">

                        <button type="submit" className="w-full bg-orange-500 text-white p-4 rounded hover:bg-orange-600 transition">
                            Registrarse
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
