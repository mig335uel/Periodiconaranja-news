# Periodico Naranja - Technical Documentation

## 1. Project Overview

**Periodico Naranja** is a modern digital media platform built with **Next.js 16** (App Router). The application combines robustness for content management (CMS/News), real-time election data visualization ("Escrutinio"), and community engagement features through comments and user authentication.

### Core Tech Stack

- **Core Framework**: Next.js 16.0.7 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives) + Sass
- **Database & Auth**: Supabase (@supabase/auth-helpers-nextjs)
- **Content Editor**: Tiptap (Rich Text Editor)
- **Data Visualization**: Chart.js + React Chartjs 2
- **State Management/Utils**: Lodash, Swiper (Carousels)

---

## 2. Project Architecture

The project follows the modern Next.js **App Router** architecture, ensuring detailed route handling and server-side optimization.

### Key Directory Structure

- **`app/`**: Contains all application routes (Pages, Layouts, API Routes).
  - **`api/`**: Backend endpoints (Full-stack features).
  - **`adminPanel/`**: Restricted area for content management.
  - **`[...slug]/`**: Main dynamic route for rendering news articles and categories.
  - **`elecciones/`**: Specialized module for election results.
  - **`myAccount/`**: User dashboard.
- **`components/`**: UI building blocks (150+ components).
- **`lib/`**: Reusable business logic and service clients (e.g., Supabase, Tiptap utils).
- **`Types/`**: Global TypeScript type definitions (Domain Models).
- **`middleware.ts`**: Handles Supabase session management and route protection.

---

## 3. Domain Models (Types)

The application handles complex data structures, many inspired by headless CMS schemas (similar to WordPress REST API).

### 3.1 News (`Posts.ts`)

The `Post` model is the core content entity.

- **Key Fields**: `title`, `content` (Rendered HTML), `excerpt`, `author`, `categories`.
- **Structure**: Follows a format compatible with headless data sources (`yoast_head_json` for SEO, `rendered` strings).
- **Relationships**: Linked to `Author` and `Category`.

### 3.2 Elections (`Elecciones.ts`)

A robust system for visualizing election results.

- **Configuration (`PARTIDOS_CONFIG`)**: Static mapping of political parties with visual and semantic properties:
  - `color`: Corporate color of the party.
  - `ideologia`: Numeric scale (approx. 1-7) for positioning on political spectrum charts.
- **Data (`RegionData`)**: Structure for storing results by region (seats, votes, percentage).

### 3.3 Comments (`Comments.ts`)

Defines the structure for user interactions on news articles.

---

## 4. API & Backend (`app/api/`)

The application functions as a Next.js monolith with its own internal RESTful API.

### Main Modules

- **Authentication**:
  - `/api/authentication`: Session status verification.
  - `/api/login`, `/api/logout`, `/api/register`: Complete auth flow.
- **Content**:
  - `/api/post`: News CRUD operations.
  - `/api/upload`: Media upload management (images/videos) for articles.
  - `/api/categories`: Taxonomy management.
- **Interaction**:
  - `/api/comentarios`: API for the comment system.
- **Data**:
  - `/api/elecciones`: Endpoint for serving election data (static or dynamic JSONs).

---

## 5. Key Features

### News Editor (Tiptap)

The project implements a custom rich text editor.

- Advanced formatting support (Bold, Italic, Lists).
- Multimedia and image integration.
- Custom extensions (as listed in `package.json`).

### Election System

Beyond a standard blog, this includes logic for "Escrutinio" (Vote Counting).

- Capabilities to calculate majorities.
- Renders charts based on ideology and seats using `Elecciones.ts`.

### Hybrid Authentication

Uses **Supabase** for user management, integrated via **Middleware** for secure session persistence on both server and client sides.



---

## 6. Getting Started

### Requirements

- Node.js 20+
- Environment variables configured in `.env.local` (Supabase Credentials).

### Installation & Run

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# Access http://localhost:3000
```
