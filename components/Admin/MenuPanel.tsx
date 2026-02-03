"use client";

import { LayoutDashboard, Users, FileText, FolderTree, MessageSquare, HomeIcon, LucideHome } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

import Link from "next/link";

const detectOS = () => {
    if (typeof window === 'undefined') return 'unknown';
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) return 'macos';
    if (platform.includes('win')) return 'windows';
    if (/linux|android/.test(platform)) return 'linux';
    return 'unknown';
}


export default function MenuPanel() {
    const { user, loading } = useAuth();

    // Estado para mostrar el submenu - DEBE estar antes de cualquier return
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    // Detectar si es móvil por sistema operativo
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (loading) return <p className="p-4 text-gray-400">Cargando...</p>;
    if (!user) return <p className="p-4 text-gray-400">No has iniciado sesión</p>;

    const role = user.role;

    const navItems = [
        { to: "/adminPanel/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["admin", "editor"] },
        { to: "/adminPanel/post", label: "Posts", icon: <FileText size={18} />, roles: ["admin", "editor"], submenu:[
                { to: "/adminPanel/post", label: "Todos los posts" },
                { to: "/adminPanel/post/create", label: "Crear nuevo post" },
                { to: "/adminPanel/categories", label: "Categorías" },
                { to: "/adminPanel/tags", label: "Etiquetas" },
            ] },
        { to: "/adminPanel/comments", label: "Comentarios", icon: <MessageSquare size={18} />, roles: ["admin", "editor"] },
        { to: "/adminPanel/users", label: "Usuarios", icon: <Users size={18} />, roles: ["admin"] },
    ];

    return (
        /* CAMBIOS CLAVE AQUÍ:
           1. sticky: Se pega a la posición.
           2. top-0: Se pega al techo de la ventana.
           3. h-screen: Ocupa toda la altura visible.
           4. overflow-y-auto: Si el menú es muy largo, permite scroll dentro del menú.
        */
        <aside className="sticky top-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 h-screen">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">📰 Admin</h2>
                <a href="/" className="text-white"><LucideHome ></LucideHome></a>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems
                    .filter(item => item.roles.includes(role))
                    .map(item => {
                        const active = location.pathname.startsWith(item.to);
                        const showSubmenu = openSubmenu === item.to;
                        // Si tiene submenu, renderiza como div para manejar eventos
                        if (item.submenu) {
                            return (
                                <div
                                    key={item.to}
                                    className={`flex flex-col ${active ? "bg-gray-800 text-white font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"} rounded-lg transition`}
                                    onClick={() => isMobile ? setOpenSubmenu(openSubmenu === item.to ? null : item.to) : undefined}
                                    onMouseEnter={() => !isMobile ? setOpenSubmenu(item.to) : undefined}
                                    onMouseLeave={() => !isMobile ? setOpenSubmenu(null) : undefined}
                                    style={{ cursor: item.submenu ? 'pointer' : 'default' }}
                                >
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {showSubmenu && (
                                        <div className="mt-2 ml-6 space-y-1">
                                            {item.submenu.map(sub => (
                                                <Link
                                                    key={sub.to}
                                                    href={sub.to}
                                                    className={`block px-3 py-1 rounded-lg text-sm ${
                                                        location.pathname === sub.to
                                                            ? "bg-gray-700 text-white font-medium"
                                                            : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                                    }`}
                                                >
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        // Si no tiene submenu, renderiza como Link normal
                        return (
                            <Link
                                key={item.to}
                                href={item.to}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                                    active
                                        ? "bg-gray-800 text-white font-medium"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
            </nav>

            <footer className="mt-auto border-t border-gray-800 pt-3 text-sm text-gray-500">
                Sesión: <span className="text-gray-300">{user.display_name || `${user.name} ${user.last_name}`}</span>
            </footer>
        </aside>
    );
}
