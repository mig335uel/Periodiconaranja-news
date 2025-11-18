"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, FileText, MessageSquare, Users } from "lucide-react";
export default function Dashboard() {
    const [coutPost, setCountPost] = useState<number>(0);
    useEffect(() => {
        const fetchPostCount = async () => {
            try {
                const response = await fetch('/api/post/countPosts', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setCountPost(data.count);
            } catch (error) {
                console.error('Error fetching post count:', error);
            }
        };
        fetchPostCount();
    }, []);
    return (
        <div className="space-y-8 w-full px-8 py-6 bg-linear-to-br from-gray-50 via-white to-gray-100 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Panel de Administración</h1>
                <p className="text-gray-500 text-lg">Resumen general de la actividad del sitio</p>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Usuarios" icon={<Users />} value="124" color="bg-blue-600" shadow="shadow-blue-200" />
                <Card title="Posts" icon={<FileText />} value={coutPost.toString()} color="bg-green-600" shadow="shadow-green-200" />
                <Card title="Comentarios" icon={<MessageSquare />} value="1,245" color="bg-yellow-500" shadow="shadow-yellow-200" />
                <Card title="Visitas" icon={<BarChart3 />} value="12,430" color="bg-purple-600" shadow="shadow-purple-200" />
            </div>

            {/* Zona de estadísticas o gráficos */}
            <section className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mt-8 shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-white">Estadísticas de actividad</h2>
                <p className="text-gray-400">Aquí podrías colocar un gráfico o análisis de tráfico.</p>
            </section>
        </div>
    );
}
// Componente auxiliar para tarjetas
function Card({ title, icon, value, color, shadow }: { title: string; icon: ReactNode; value: string; color: string; shadow: string }) {
    return (
        <div className={`flex items-center gap-4 p-5 rounded-2xl ${color} text-white shadow-lg ${shadow} hover:scale-[1.03] transition-transform duration-200`}>
            <div className="p-3 bg-white/30 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-base font-semibold text-white/90 mb-1 tracking-wide">{title}</p>
                <h3 className="text-3xl font-extrabold drop-shadow-lg">{value}</h3>
            </div>
        </div>
    );
}

