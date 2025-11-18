"use client"

import Link from "next/link";
import React, { useState, useEffect } from "react";
import type { Category } from "@/Types/Posts";
import {useAuth} from "@/hooks/useAuth";

interface CategoryTree extends Category {
    children?: CategoryTree[];
}

const CategoryMenuItem: React.FC<{
    category: CategoryTree;
    level?: number;
}> = ({ category, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;
    const paddingLeft = level * 16;

    return (
        <li className="w-full">
            <div
                className="flex items-center justify-between px-4 py-2 hover:bg-orange-100 transition"
                style={{ paddingLeft: `${paddingLeft + 16}px` }}
            >
                <Link
                    href={`/categories/${category.slug}`}
                    className="text-gray-700 font-medium no-underline hover:text-orange-600 flex-1"
                >
                    {category.name}
                </Link>
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }}
                        className="ml-2 text-gray-500 hover:text-orange-600 transition"
                        aria-label={isOpen ? "Cerrar subcategorías" : "Abrir subcategorías"}
                    >
                        <svg
                            className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>
            {hasChildren && isOpen && (
                <ul className="bg-orange-50/50">
                    {category.children!.map((child) => (
                        <CategoryMenuItem
                            key={child.id}
                            category={child}
                            level={level + 1}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

const Header: React.FC = () => {
    const [submenuOpen, setSubmenuOpen] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryTree[]>([]);
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const {user} = useAuth();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();

                // Verifica la estructura: probablemente sea { categories: [...] }
                const categoriesArray = Array.isArray(data) ? data : data.categories || [];

                const categoryTree = buildCategoryTree(categoriesArray);
                setCategories(categoryTree);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);


    const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
        const categoryMap = new Map<string, CategoryTree>();
        const rootCategories: CategoryTree[] = [];

        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        categories.forEach(cat => {
            const category = categoryMap.get(cat.id)!;
            if (cat.parent_id === null) {
                rootCategories.push(category);
            } else {
                const parent = categoryMap.get(cat.parent_id);
                if (parent) {
                    parent.children!.push(category);
                }
            }
        });

        return rootCategories;
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await fetch('/api/authentication', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if (!response.ok) {
                    setIsLogged(false);
                    return;
                }
                setIsLogged(data.authenticated);
            } catch (error) {
                console.error('Error checking authentication:', error);
            }
        };
        checkAuthentication();
    }, []);
    const Logout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                setIsLogged(false);
                window.location.href = '/';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
    return (
        <>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-4 shadow-lg">
                <Link href="/" className="no-underline hover:underline transition-all duration-300 ease-in-out">
                    <h1 className="font-serif text-4xl font-bold tracking-wider ">
                        PERIÓDICO NARANJA
                    </h1>
                    <p className="text-sm mt-1 opacity-90">La verdad en color</p>
                </Link>
            </div>
            <nav className="w-full border-b-2 border-orange-500 bg-white shadow-md sticky top-0 z-50">
                <ul className="flex list-none gap-0 justify-center w-full px-4">
                    <li className="border-r border-gray-200 last:border-r-0">
                        <Link
                            href="/"
                            className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
                        >
                            Inicio
                        </Link>
                    </li>
                    <li
                        className="relative border-r border-gray-200 last:border-r-0"
                        onMouseEnter={() => setSubmenuOpen(true)}
                        onMouseLeave={() => setSubmenuOpen(false)}
                    >
                        <Link
                            href="/categories"
                            className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
                        >
                            Categorías
                        </Link>
                        {submenuOpen && (
                            <ul className="absolute left-0 top-full min-w-[280px] bg-white shadow-xl border border-gray-200 rounded-b-lg z-10 max-h-[500px] overflow-y-auto">
                                {categories.map((category) => (
                                    <CategoryMenuItem
                                        key={category.id}
                                        category={category}
                                    />
                                ))}
                            </ul>
                        )}
                    </li>
                    {isLogged ? (
                        <>
                            <li className="border-r border-gray-200 last:border-r-0">
                                <Link
                                    href="/myAccount"
                                    className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
                                >
                                    Mi Cuenta
                                </Link>
                            </li>
                            {(user?.role === 'admin' || user?.role=== 'editor' || user?.role === 'author' ) && (
                                <li className="border-r border-gray-200 last:border-r-0">
                                    <Link
                                        href="/adminPanel"
                                        className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
                                    >
                                        Admin
                                    </Link>
                                </li>
                            )}
                            <li className="border-r border-gray-200 last:border-r-0">
                                <div
                                    onClick={Logout}
                                    className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition">
                                    Cerrar Sesión
                                </div>
                            </li>
                        </>
                    ) : (
                        <li className="border-r border-gray-200 last:border-r-0">
                            <Link
                                href="/login"
                                className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
                            >
                                Acceder
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </>
    );
};

export default Header;
