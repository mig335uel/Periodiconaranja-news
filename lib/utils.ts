import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category } from "@/Types/Posts";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function buildCategoryPath(categories: Category[] | undefined): string {
  // 1. Seguridad: Si no hay categorías, devolvemos una por defecto
  if (!categories || categories.length === 0) return "general";

  // 2. Buscamos la categoría RAÍZ (Padre = 0)
  // Ejemplo: "Actualidad" (parent: 0)
  let currentCategory = categories.find((cat) => cat.parent === 0);

  // FALLBACK: Si el redactor seleccionó "Andalucía" pero olvidó marcar "Actualidad" y "Nacional",
  // el array no tendrá ninguna con parent=0. En ese caso, cogemos la primera que haya.
  if (!currentCategory) {
    currentCategory = categories[0];
  }

  // Iniciamos la ruta con la raíz
  const pathSegments = [currentCategory.slug];
  let currentId = currentCategory.id;

  // 3. BUCLE DE JERARQUÍA (La magia)
  // Buscamos: "¿Tengo en este array alguna categoría cuyo padre sea la actual?"
  while (true) {
    const childCategory = categories.find((cat) => cat.parent === currentId);

    if (childCategory) {
      // Si encontramos al hijo (ej: Nacional es hijo de Actualidad), lo añadimos
      pathSegments.push(childCategory.slug);
      // Y ahora buscamos al hijo de este hijo
      currentId = childCategory.id;
    } else {
      // Si no hay más hijos en la cadena, terminamos
      break;
    }
  }

  // 4. Devolvemos la ruta limpia: "actualidad/nacional/andalucia"
  return pathSegments.join("/");
}