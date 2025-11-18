import { useEffect, useState } from "react";


interface User {
    id: string,
    name: string,
    last_name: string,
    email: string,
    role: string,
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/authentication", {
                    method: "GET",
                    credentials: "include", // para enviar cookies si usas sesiones
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user as User);
                }
            } catch (error) {
                console.error("Error al obtener usuario:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { user, loading };
}
