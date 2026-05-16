# Frontend: Next.js Web App

This folder contains the user-facing web application for Algo-Rhythm. It communicates with the ASP.NET backend via REST and receives real-time song status updates over SignalR.

---

## Features

- **Explore page** — browse and listen to songs published by the community, no account required
- **Authentication** — sign up and sign in to access your personal dashboard
- **Dashboard** — manage your generated songs: rename, play, publish/unpublish, download, or delete
- **Song generation** — submit generation requests and watch songs update live from `Processing` to ready via SignalR
- **Responsive layout** — mobile-aware via a custom `useMobile` hook

---

## Project Structure

```
frontend/web/
├── app/
│   ├── (dashboard)/         # Authenticated dashboard routes (route group)
│   │   ├── manage/          # Song management page
│   │   └── layout.tsx       # Dashboard layout (nav, auth guard, SignalR connection)
│   ├── auth/                # Auth routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   │   └── layout.tsx
│   ├── explore/             # Public explore/browse page
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Root page (landing / redirect)
│
├── components/              # Shared UI components
│
├── hooks/
│   └── use-mobile.ts        # Hook for responsive/mobile detection
│
├── lib/
│   ├── api-request.ts       # Centralised fetch wrapper (attaches auth headers, base URL)
│   ├── query-client-provider.tsx  # React Query client setup
│   └── utils.ts             # Shared utility functions
│
├── modules/
│   ├── auth/                # Auth forms, state, and logic
│   ├── dashboard/
│   │   └── ui/components/   # Dashboard-specific UI components (song cards, player, etc.)
│   ├── explore/
│   │   └── ui/views/        # Explore page views
│   └── songs/               # Song-related shared logic and types
│
└── public/                  # Static assets
```

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- The ASP.NET backend running locally or deployed (see `backend/Api/README.md`)

---

## Setup

### 1. Install dependencies

```bash
cd frontend/web
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in `frontend/web/`:

```env
NEXT_PUBLIC_BACKEND_API=https://localhost:7000
```

Replace the value with your backend's URL. The `NEXT_PUBLIC_` prefix exposes this variable to the browser, which is required for client-side API calls and the SignalR connection.

> **Note:** In production, set this to your deployed backend URL (e.g. `https://api.yourdomain.com`).

### 3. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production build |
| `npm run lint` | Run ESLint |

---

## Key Concepts

### API Requests
All backend communication goes through `lib/api-request.ts`, which centralises the base URL (`NEXT_PUBLIC_BACKEND_API`) and attaches authentication headers to every request. Use this instead of calling `fetch` directly.

### Real-Time Updates (SignalR)
When a song is submitted for generation, its card shows a `Processing` state. The dashboard layout maintains a SignalR connection to the backend — when the backend finishes generating a song, it pushes a notification and the song card updates automatically without a page refresh.

### Route Groups
The `(dashboard)` folder is a Next.js [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups). It applies the dashboard layout (including auth protection and the SignalR connection) to all routes inside it without affecting the URL path.

### Data Fetching
The app uses **React Query** (configured in `lib/query-client-provider.tsx`) for server state management — caching, background refetching, and invalidation when songs are created or updated.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_API` | Yes | Base URL of the ASP.NET backend API |
