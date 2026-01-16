# Documentación Técnica - Periódico Naranja

## 1. Visión General del Proyecto

**Periódico Naranja** es una plataforma de medios digitales moderna desarrollada con **Next.js 16** (App Router). La aplicación combina funcionalidades de gestión de contenido (CMS/Noticias), visualización de datos electorales en tiempo real y una comunidad activa a través de comentarios y autenticación de usuarios.

### Stack Tecnológico Principal

- **Framework Core**: Next.js 16.0.7 (React 19)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Shadcn UI (Radix Primitives) + Sass
- **Base de Datos & Auth**: Supabase (@supabase/auth-helpers-nextjs)
- **Editor de Contenido**: Tiptap (Rich Text Editor)
- **Visualización de Datos**: Chart.js + React Chartjs 2
- **Gestión de Estado/Utils**: Lodash, Swiper (Carousels)

---

## 2. Arquitectura del Proyecto

El proyecto sigue la arquitectura moderna de Next.js con **App Router**.

### Estructura de Directorios Clave

- **`app/`**: Contiene todas las rutas de la aplicación (Pages, Layouts, API Routes).
  - **`api/`**: Endpoints del backend (Full-stack features).
  - **`adminPanel/`**: Área restringida para gestión de contenido.
  - **`[...slug]/`**: Ruta dinámica principal para renderizar noticias y categorías.
  - **`elecciones/`**: Módulo especializado para resultados electorales.
  - **`myAccount/`**: Panel de usuario.
- **`components/`**: Bloques de construcción de la UI. (150+ componentes).
- **`lib/`**: Lógica de negocio reutilizable y clientes de servicios (ej. Supabase, Tiptap utils).
- **`Types/`**: Definiciones de tipos TypeScript globales (Modelos de Dominio).
- **`middleware.ts`**: Gestión de sesiones de Supabase y protección de rutas.

---

## 3. Modelos de Dominio (Types)

La aplicación maneja estructuras de datos complejas, muchas de ellas inspiradas en esquemas headless (como WordPress REST API).

### 3.1 Noticias (`Posts.ts`)

El modelo `Post` es el núcleo del contenido.

- **Campos Clave**: `title`, `content` (HTML renderizado), `excerpt`, `author`, `categories`.
- **Estructura**: Sigue un formato similar a la API de WordPress (`yoast_head_json` para SEO, `rendered` strings).
- **Relaciones**: Author (`Author`), Categories (`Category`).

### 3.2 Elecciones (`Elecciones.ts`)

Sistema robusto para visualizar resultados electorales.

- **Configuración (`PARTIDOS_CONFIG`)**: Mapeo estático de partidos políticos con propiedades visuales y semánticas:
  - `color`: Color corporativo del partido.
  - `ideologia`: Escala numérica (1-7 aprox) para posicionamiento en gráficos del espectro político.
- **Datos (`RegionData`)**: Estructura para almacenar resultados por región (escaños, votos, porcentaje).

### 3.3 Comentarios (`Comments.ts`)

Estructura para la interacción de usuarios en las noticias.

---

## 4. API & Backend (`app/api/`)

La aplicación funciona como un monolito Next.js con su propia API RESTful interna.

### Módulos Principales

- **Autenticación**:
  - `/api/authentication`: Verificación de estado.
  - `/api/login`, `/api/logout`, `/api/register`: Flow completo de auth.
- **Contenido**:
  - `/api/post`: CRUD de noticias.
  - `/api/upload`: Gestión de subida de medios (imágenes/videos) para artículos.
  - `/api/categories`: Gestión taxonómica.
- **Interacción**:
  - `/api/comentarios`: API para el sistema de comentarios.
- **Datos**:
  - `/api/elecciones`: Endpoint para servir datos electorales (probablemente JSONs estáticos o dinámicos).

---

## 5. Características Destacadas

### Editor de Noticias (Tiptap)

El proyecto implementa un editor de texto enriquecido personalizado.

- Soporte para formato avanzado (Bold, Italic, Listas).
- Integración de imágenes y multimedia.
- Extensiones personalizadas (mencionadas en `package.json`).

### Sistema Electoral

No es solo un blog, incluye lógica para "Escrutinio".

- Capacidad de calcular mayorías y dibujar gráficos basados en la ideología y escaños (`Elecciones.ts`).

### Autenticación Híbrida

Utiliza Supabase para la gestión de usuarios, integrado via Middleware para persistencia de sesión segura en el lado del servidor y cliente.

---

## 6. Guía de Inicio

### Requisitos

- Node.js 20+
- Variables de entorno configuradas en `.env.local` (Credenciales Supabase).

### Ejecución

```bash
# Instalar dependencias
npm install
# o
pnpm install

# Servidor de desarrollo
npm run dev
# Acceder a http://localhost:3000
```
