"use client";

import { LayoutDashboard, Users, FileText, MessageSquare, LucideHome } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation"; // 1. Importar hook de Next.js
import Link from "next/link";

export default function MenuPanel() {
    const { user, loading } = useAuth();
    const pathname = usePathname(); // 2. Usar hook para obtener la ruta de forma segura
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    
    // Verificación segura de isMobile para evitar errores de renderizado servidor/cliente
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (loading) return <aside className="w-64 bg-gray-900 h-screen p-4 text-gray-400">Cargando...</aside>; // Mantener estructura en carga
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
        <aside className="sticky top-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4 h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 shrink-0"> {/* shrink-0 evita que el logo se aplaste */}
                <h2 className="text-xl font-bold text-white">📰 Admin</h2>
                <a href="/" className="text-white hover:text-gray-300 transition"><LucideHome /></a>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems
                    .filter(item => item.roles.includes(role))
                    .map(item => {
                        // Usamos pathname (del hook) en lugar de location.pathname
                        const active = pathname?.startsWith(item.to);
                        const showSubmenu = openSubmenu === item.to;

                        if (item.submenu) {
                            return (
                                <div
                                    key={item.to}
                                    className={`flex flex-col ${active ? "bg-gray-800 text-white font-medium" : "text-gray-400 hover:bg-gray-800 hover:text-white"} rounded-lg transition`}
                                    // Lógica simplificada para móvil/desktop
                                    onClick={() => setOpenSubmenu(openSubmenu === item.to ? null : item.to)}
                                    // Opcional: Si prefieres hover en desktop, descomenta estas líneas y quita el onClick condicional
                                    // onMouseEnter={() => !isMobile && setOpenSubmenu(item.to)}
                                    // onMouseLeave={() => !isMobile && setOpenSubmenu(null)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {showSubmenu && (
                                        <div className="mt-2 ml-6 space-y-1 pb-2">
                                            {item.submenu.map(sub => (
                                                <Link
                                                    key={sub.to}
                                                    href={sub.to}
                                                    className={`block px-3 py-1 rounded-lg text-sm ${
                                                        pathname === sub.to
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

            <footer className="mt-auto border-t border-gray-800 pt-3 text-sm text-gray-500 shrink-0">
                Sesión: <span className="text-gray-300">{user.name || user.email}</span>
            </footer>
        </aside>
    );
}