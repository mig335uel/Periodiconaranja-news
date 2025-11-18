// TypeScript
"use client"

import { useState } from "react";
import Header from "@/app/Header";
import { useRouter } from "next/navigation";


interface LoginData {
    email: string;
    password: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginData>({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            if(response.ok){
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

            <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Inicia Sesión</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-600 mb-4">{success}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
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
                            id="password"
                            name="password"
                            placeholder="Contraseña"
                            required
                        />
                        <input
                            type="checkbox"
                            className="mt-2"
                            id="showPassword"
                            onChange={(e) => {
                                const passwordInput = document.getElementById("password") as HTMLInputElement | null;
                                if (!passwordInput) return;
                                passwordInput.type = e.target.checked ? "text" : "password";
                            }}
                        />
                        <label htmlFor="showPassword" className="ml-2 text-sm text-gray-600">
                            Mostrar Contraseña
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="w-full bg-orange-500 text-white p-4 rounded hover:bg-orange-600 transition">
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
