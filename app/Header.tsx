"use client";

import Link from "next/link";
import { useRouter } from "next/navigation"; // <--- Importante para redirigir
import React, { useState, useEffect, FormEvent } from "react";
import type { Category } from "@/Types/Posts";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronDown, ChevronUp, Search } from "lucide-react";

interface CategoryTree extends Category {
  children?: CategoryTree[];
}

const CategoryMenuItem: React.FC<{
  category: CategoryTree;
  level?: number;
  mobile?: boolean;
  onClose?: () => void;
}> = ({ category, level = 0, mobile = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const paddingLeft = level * 16;


  const handleClick = () => {
    if (isOpen === true) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }

  };

  return (
    <li
      className="w-full"
      onClick={() => !mobile && handleClick()}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 hover:bg-orange-100 transition ${mobile ? "border-b border-gray-100" : ""
          }`}
        style={{ paddingLeft: `${paddingLeft + (mobile ? 24 : 16)}px` }}
      >
        <Link
          href={`/categories/${category.slug}`}
          className="text-gray-700 font-medium no-underline hover:text-orange-600 flex-1"
          onClick={onClose}
        >
          {category.name}
        </Link>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClick();
            }}
            className="ml-2 text-gray-500 hover:text-orange-600 transition"
            aria-label={isOpen ? "Cerrar subcategorías" : "Abrir subcategorías"}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className={`${mobile ? "bg-gray-50" : "bg-orange-50/50"}`}>
          {category.children!.map((child) => (
            <CategoryMenuItem
              key={child.id}
              category={child}
              level={level + 1}
              mobile={mobile}
              onClose={onClose}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Header: React.FC = () => {
  const router = useRouter(); // <--- Inicializamos el router
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [searchFormOpen, setSearchFormOpen] = useState<boolean>(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        // Verifica la estructura: probablemente sea { categories: [...] }
        const categoriesArray = Array.isArray(data)
          ? data
          : data.categories || [];

        const categoryTree = buildCategoryTree(categoriesArray);
        setCategories(categoryTree);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
    const categoryMap = new Map<number, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent === 0) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parent);
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
        const response = await fetch("/api/authentication", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) {
          setIsLogged(false);
          return;
        }
        setIsLogged(data.authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };
    checkAuthentication();
  }, []);
  const Logout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setIsLogged(false);
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  useEffect(() => {
    if (searchFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [searchFormOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita que la página se recargue

    // Obtenemos el valor del input
    const formData = new FormData(event.currentTarget);
    const searchTerm = formData.get("search")?.toString().trim();

    if (searchTerm) {
      setSearchFormOpen(false); // Cerramos el buscador
      // Redirigimos a la página de búsqueda enviando el término en la URL
      router.push(`/busqueda?s=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg relative z-20">
        <div className="w-full px-4 py-3 flex items-center justify-between md:justify-center relative">
          {/* 1. BOTÓN MENÚ (IZQUIERDA) */}
          {/* Añadimos 'w-12' para reservar un espacio fijo y equilibrar con el de la derecha */}
          <div className="md:hidden flex-shrink-0 w-12 flex justify-start">
            <button
              className="text-white p-2 -ml-2 rounded-md hover:bg-orange-700/50 transition"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={28} />
            </button>
          </div>

          {/* 2. TÍTULO (CENTRO) */}
          {/* Añadimos 'flex-1' para que ocupe todo el espacio central disponible */}
          {/* En desktop (md:flex-none) dejamos que tenga su ancho natural */}
          <Link
            href="/"
            className="flex-1 md:flex-none no-underline hover:underline transition-all duration-300 ease-in-out text-center"
          >
            {new Date() < new Date('2025-12-21T10:00:00') ? (
              <img src="/LogoEleccionesExtremeñas.png" alt="Logo Elecciones Extremeñas" />
            ) : (
              <>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider leading-tight">
                  PERIÓDICO NARANJA
                </h1>
                <p
                  className="text-[10px] sm:text-xs md:text-sm mt-1 opacity-90"
                  suppressHydrationWarning
                >
                  Noticias que inspirar, información que conecta
                </p>
              </>

            )}

          </Link>

          {/* 3. BOTÓN BÚSQUEDA (DERECHA) */}
          {/* En Móvil: 'relative w-12' para equilibrar al menú. */}
          {/* En Desktop: 'md:absolute md:right-4' para salirse del flujo y no molestar. */}
          <div className="flex-shrink-0 w-12 flex justify-end md:absolute md:right-4 md:w-auto">
            <button
              className="text-white p-2 -mr-2 rounded-md hover:bg-orange-700/50 transition"
              onClick={() => setSearchFormOpen(true)}
            >
              <Search size={28} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
              <h2 className="font-bold text-orange-600 text-lg">Menú</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2 list-none p-0 m-0">
                <li>
                  <Link
                    href="/"
                    className="block px-4 py-3 rounded-lg text-gray-700 font-bold hover:bg-orange-50 hover:text-orange-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    INICIO
                  </Link>
                </li>
                <li>
                  <Link
                    href="/elecciones/extremadura/2025"
                    className="block px-4 py-3 rounded-lg text-gray-700 font-bold hover:bg-orange-50 hover:text-orange-600 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ELECCIONES EXTREMADURA 2025
                  </Link>
                </li>
                <li>
                  <div className="px-4 py-3 text-gray-700 font-bold border-b border-gray-100 mb-2">
                    CATEGORÍAS
                  </div>
                  <ul className="pl-2 space-y-1 list-none">
                    {categories.map((category) => (
                      <CategoryMenuItem
                        key={category.id}
                        category={category}
                        mobile={true}
                        onClose={() => setMobileMenuOpen(false)}
                      />
                    ))}
                  </ul>
                </li>
                <div className="my-4 border-t border-gray-100"></div>
                {isLogged ? (
                  <>
                    <li>
                      <Link
                        href="/myAccount"
                        className="block px-4 py-3 rounded-lg text-gray-700 font-bold hover:bg-orange-50 hover:text-orange-600 transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        MI CUENTA
                      </Link>
                    </li>

                    <li>
                      <button
                        onClick={() => {
                          Logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left block px-4 py-3 rounded-lg text-red-600 font-bold hover:bg-red-50 transition"
                      >
                        CERRAR SESIÓN
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      href="/login"
                      className="block px-4 py-3 rounded-lg text-white bg-orange-600 font-bold text-center hover:bg-orange-700 transition shadow-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ACCEDER
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <nav className="w-full border-b-2 border-orange-500 bg-white shadow-md sticky top-0 z-50 hidden md:block">
        <ul className="flex list-none gap-0 justify-center w-full px-4">
          <li className="border-r border-gray-200 last:border-r-0">
            <Link
              href="/"
              className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
            >
              Inicio
            </Link>
          </li>
          <li className="border-r border-gray-200 last:border-r-0">
            <Link
              href="/elecciones/extremadura/2025"
              className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
            >
              Elecciones Extremadura 2025
            </Link>
          </li>
          <li
            className="relative border-r border-gray-200 last:border-r-0"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <Link
              href="/categories"
              className="no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
            >
              Categorías
            </Link>
            {categoriesDropdownOpen && (
              <ul className="absolute left-0 top-full min-w-[280px] bg-white shadow-xl border border-gray-200 rounded-b-lg z-10 max-h-[500px] overflow-y-auto">
                {categories.map((category) => (
                  <CategoryMenuItem key={category.id} category={category} />
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
              {(user?.role === "admin" ||
                user?.role === "editor" ||
                user?.role === "author") && (
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
                  className="cursor-pointer no-underline text-gray-700 font-bold uppercase text-sm px-6 py-4 block hover:bg-orange-50 hover:text-orange-600 transition"
                >
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
      {searchFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 px-4">
          {/* Fondo oscuro al hacer clic cierra */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSearchFormOpen(false)}
          />

          {/* Caja del buscador */}
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSearch} className="flex items-center p-4">
              <Search className="text-gray-400 mr-3" size={24} />
              <input
                type="text"
                name="search"
                autoFocus
                placeholder="¿Qué estás buscando? (ej: Política, Deportes...)"
                className="flex-1 text-lg text-gray-800 placeholder-gray-400 outline-none border-none focus:ring-0 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchFormOpen(false)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
