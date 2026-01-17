import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category, Post } from "@/Types/Posts";
import { CategoryNode } from "@/Types/Categories";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function buildCategoryPath(categories: Category[] | undefined): string {
  // 1. Si no hay categorías, fallback a general
  if (!categories || categories.length === 0) return "general";

  // 2. Mapeamos para búsqueda rápida
  const categoryMap = new Map<number, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  let bestPath: string[] = [];
  let bestScore = -1;
  // Inicializamos con un ID muy alto para que cualquier ID real sea menor
  let bestCategoryId = Number.MAX_SAFE_INTEGER; 

  categories.forEach((startingCategory) => {
    const currentPath: string[] = [];
    let current: Category | undefined = startingCategory;
    
    // 3. Construimos la ruta hacia atrás (Hijo -> Padre -> Abuelo)
    while (current) {
      currentPath.unshift(current.slug);
      
      if (current.parent === 0) {
        // Llegamos a la raíz
        current = undefined;
      } else {
        // Buscamos al padre. Si no está asignado al post, la cadena se rompe aquí.
        current = categoryMap.get(current.parent);
      }
    }

    // --- LÓGICA DEFINITIVA ---
    const currentLength = currentPath.length;

    // A) PRIORIDAD 1: LA RUTA MÁS LARGA (Más específica)
    // Ejemplo: "actualidad/nacional/andalucia" (3) gana a "actualidad" (1)
    if (currentLength > bestScore) {
      bestScore = currentLength;
      bestPath = currentPath;
      bestCategoryId = startingCategory.id;
    } 
    // B) PRIORIDAD 2: EMPATE DE LONGITUD (Desempate por Jerarquía/Antigüedad)
    // Si tenemos "Actualidad" (Nivel 1) y "Nacional" (Nivel 1 - rota),
    // Gana la que tenga el ID MÁS BAJO (normalmente las secciones principales se crean antes).
    else if (currentLength === bestScore) {
      if (startingCategory.id < bestCategoryId) {
         bestPath = currentPath;
         bestCategoryId = startingCategory.id;
      }
    }
  });

  // Si falló todo, devolvemos la primera
  if (bestPath.length === 0 && categories.length > 0) {
    return categories[0].slug;
  }

  return bestPath.join("/");
}
export function buildCategoryNodePath(categories: CategoryNode[] | undefined): string {
  // 1. Si no hay categorías, fallback a general
  if (!categories || categories.length === 0) return "general";

  // 2. Mapeamos para búsqueda rápida
  const categoryMap = new Map<number, CategoryNode>();
  categories.forEach((cat) => categoryMap.set(cat.databaseId, cat));

  let bestPath: string[] = [];
  let bestScore = -1;
  // Inicializamos con un ID muy alto para que cualquier ID real sea menor
  let bestCategoryId = Number.MAX_SAFE_INTEGER; 

  categories.forEach((startingCategory) => {
    const currentPath: string[] = [];
    let current: CategoryNode | undefined = startingCategory;
    
    // 3. Construimos la ruta hacia atrás (Hijo -> Padre -> Abuelo)
    while (current) {
      currentPath.unshift(current.slug);
      
      if (current.parent.node.databaseId === 0) {
        // Llegamos a la raíz
        current = undefined;
      } else {
        // Buscamos al padre. Si no está asignado al post, la cadena se rompe aquí.
        current = categoryMap.get(current.parent.node.databaseId);
      }
    }

    // --- LÓGICA DEFINITIVA ---
    const currentLength = currentPath.length;

    // A) PRIORIDAD 1: LA RUTA MÁS LARGA (Más específica)
    // Ejemplo: "actualidad/nacional/andalucia" (3) gana a "actualidad" (1)
    if (currentLength > bestScore) {
      bestScore = currentLength;
      bestPath = currentPath;
      bestCategoryId = startingCategory.databaseId;
    } 
    // B) PRIORIDAD 2: EMPATE DE LONGITUD (Desempate por Jerarquía/Antigüedad)
    // Si tenemos "Actualidad" (Nivel 1) y "Nacional" (Nivel 1 - rota),
    // Gana la que tenga el ID MÁS BAJO (normalmente las secciones principales se crean antes).
    else if (currentLength === bestScore) {
      if (startingCategory.databaseId  < bestCategoryId) {
         bestPath = currentPath;
         bestCategoryId = startingCategory.databaseId;
      }
    }
  });

  // Si falló todo, devolvemos la primera
  if (bestPath.length === 0 && categories.length > 0) {
    return categories[0].slug
  }

  return bestPath.join("/");
}


export function normalizePost(post: any): Post {
  return {
    ...post,
    // Aquí está la magia: Si existen datos embebidos (_embedded), úsalos.
    // Si no, quédate con lo que había (para evitar crashes).
    categories: post._embedded?.['wp:term']?.[0] || post.categories,
    author: post._embedded?.author?.[0] || post.author,
    // Opcional: Si usas la imagen destacada nativa de WP en vez de Jetpack
    featured_media_data: post._embedded?.['wp:featuredmedia']?.[0] || null, 
  };
}