# 🐱 Mundo Felino

> Microapp educativa para cuidadores de gatos en Caracas: biblioteca de artículos, directorio de clínicas veterinarias y asistente IA *Michi*.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## ¿Qué es Mundo Felino?

Mundo Felino es una aplicación web pensada para dueños y cuidadores de gatos en Venezuela. Centraliza en un solo lugar:

- 📚 **Biblioteca educativa** – Artículos verificados sobre alimentación, salud, comportamiento y cuidados felinos.
- 🏥 **Directorio de clínicas** – Veterinarias en Caracas con filtro por municipio y guardia de urgencias.
- 🤖 **Asistente Michi** – Chat educativo con detección de emergencias médicas y respaldo en la API de Gemini.

---

## ✨ Funcionalidades principales

| Función | Descripción |
|---------|-------------|
| Tarjetas con elevación | Cards interactivos con sombra y efecto hover para artículos y noticias |
| Carrusel de imágenes | Galería deslizante en el hero de inicio |
| Animaciones en scroll | Fade-in suave al navegar hacia abajo (scrollytelling) |
| Chat de emergencias | Detecta palabras clave críticas y alerta al usuario de inmediato |
| Directorio filtrable | Busca clínicas por municipio y disponibilidad de urgencias |
| Modo Supabase | Conecta directo a Supabase sin necesidad de un backend aparte |

---

## 🏗️ Arquitectura

```
MundoFelino/
├── frontend/mundo-felino-web/    # React + Vite + TypeScript (desplegado en Vercel)
│   ├── src/
│   │   ├── api.ts                # Capa de datos: Supabase REST o API .NET
│   │   ├── App.tsx               # Componente raíz con secciones y animaciones
│   │   ├── chat.tsx              # Asistente Michi (chat IA)
│   │   └── types.ts              # Tipos TypeScript compartidos
│   ├── .env.example              # Variables de entorno de referencia
│   └── vercel.json               # Configuración de reescrituras para SPA
│
├── backend/MundoFelino.Api/      # ASP.NET Core 10 (opcional, fallback local)
│   ├── Controllers/              # Endpoints: artículos, clínicas, chat IA
│   ├── Dockerfile                # Imagen para despliegue en contenedor
│   └── appsettings.json
│
└── database/
    ├── supabase_init.sql         # Script único para inicializar Supabase
    ├── 001_schema.sql            # Esquema de tablas
    └── 002_seed_articles.sql     # 12 artículos semilla
```

---

## 🚀 Despliegue en producción (Supabase + Vercel)

### 1. Configura Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el script completo `database/supabase_init.sql`.
3. En **Project Settings → API** copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

### 2. Despliega el frontend en Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com).
2. Configura el **Root Directory** en `frontend/mundo-felino-web`.
3. Añade las variables de entorno:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
# Opcional para el chat inteligente:
VITE_GEMINI_API_KEY=AIzaSy...
```

4. Haz clic en **Deploy**. ¡Listo!

> El archivo `vercel.json` ya incluye la reescritura necesaria para que el SPA funcione correctamente con rutas del cliente.

---

## 💻 Desarrollo local

### Requisitos

- Node.js LTS (≥ 18)
- .NET SDK 10 *(solo si usas el backend opcional)*
- Docker Desktop *(solo si usas la API .NET con PostgreSQL local)*

### Frontend (solo con Supabase)

```bash
cd frontend/mundo-felino-web
cp .env.example .env.local
# Edita .env.local con tus claves de Supabase
npm install
npm run dev
# → http://localhost:5173
```

### Full Stack local (con API .NET)

```bash
# 1. Base de datos Postgres local
docker compose up -d postgres

# 2. API .NET
cd backend/MundoFelino.Api
dotnet restore
dotnet run
# → http://localhost:5080/swagger

# 3. Frontend
cd frontend/mundo-felino-web
npm install
npm run dev
```

---

## 🧪 Pruebas

```bash
cd frontend/mundo-felino-web
npm run test:e2e        # Playwright headless
npm run test:e2e:ui     # Playwright con interfaz visual
```

Las pruebas simulan las respuestas de la API con `page.route`, por lo que **no necesitas** PostgreSQL ni Supabase corriendo para ejecutarlas.

---

## ⚙️ Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | ✅ (modo Supabase) |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase | ✅ (modo Supabase) |
| `VITE_GEMINI_API_KEY` | Clave de Google Gemini para el chat | Opcional |
| `VITE_API_BASE_URL` | URL de la API .NET (si usas backend propio) | Opcional |
| `VITE_CHAT_TIMEOUT_MS` | Timeout del chat en ms (default: 90000) | Opcional |

---

## ⚠️ Aviso importante

El asistente Michi **no diagnostica ni prescribe**. Es un recurso educativo. Ante cualquier signo de alarma o emergencia médica, acude siempre a un veterinario profesional.

---

## 📄 Licencia

Proyecto educativo de código abierto. Uso libre para aprendizaje y comunidades felinas sin fines de lucro.
