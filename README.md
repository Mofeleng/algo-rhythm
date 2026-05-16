# Algo Rhythm

A full-stack web application that lets users listen to community-generated music and create their own AI-generated tracks. Songs are generated asynchronously in the background — just submit a request, watch your track process in real time, and it's ready to play, share, or download when done.

---

## What It Does

- **Browse & listen** to songs published by other users without an account
- **Create an account** to generate your own AI music tracks
- **Submit a generation request** — the app handles everything in the background
- **Watch your song process live** — the UI updates in real time via SignalR when generation completes
- **Manage your library** — rename, play, publish/unpublish, download, or delete your songs

---

## How It Works

```
User submits a song request
        │
        ▼
  .NET Backend (ASP.NET)
        │
        ▼
  Hangfire Background Job
  (selects the right Modal endpoint)
        │
        ▼
  Modal (Python 3.12)
  AI model generates audio + thumbnail
        │
        ▼
  .NET Backend receives result
  (stores R2 key for audio + thumbnail)
        │
        ▼
  SignalR pushes real-time notification
        │
        ▼
  Next.js Frontend updates the UI
  (song flips from "Processing" → ready to play)
```

1. A user submits a song generation request from the **Next.js** frontend.
2. The **ASP.NET** backend receives the request and queues a **Hangfire** background job.
3. Hangfire decides which **Modal** endpoint to call based on the generation parameters.
4. The **Python/Modal** model runs the AI generation and stores the output (audio file + thumbnail) in **Cloudflare R2**.
5. Modal returns the R2 keys to the .NET backend, which updates the song record in the database.
6. The backend sends a **SignalR** message to the frontend, and the processing song card dynamically updates — no page refresh needed.

---

## Repository Structure

```
/
├── model/                  # Python 3.12 — Modal AI model endpoints
│   └── README.md           # Setup instructions for the Modal project
│
├── backend/
│   └── Api/                # ASP.NET — REST API, Hangfire jobs, SignalR hub
│       └── README.md       # Setup instructions for the .NET API
│
└── frontend/
    └── web/                # Next.js — UI, real-time updates, media playback
        └── README.md       # Setup instructions for the Next.js app
```

Each folder contains its own `README.md` with detailed setup instructions specific to that layer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI / Model | Python 3.12, Modal |
| Backend | ASP.NET, Hangfire, SignalR |
| Frontend | Next.js |
| Storage | Cloudflare R2 |

---

## Getting Started

Each part of the application runs independently. Refer to the README in each folder for environment variables, dependencies, and how to run locally:

- **Model** → [`model/README.md`](./model/README.md)
- **Backend API** → [`backend/Api/README.md`](./backend/Api/README.md)
- **Frontend** → [`frontend/web/README.md`](./frontend/web/README.md)

> **Tip:** Start with the model layer first to get your Modal endpoints deployed, then configure the backend with those endpoint URLs, and finally point the frontend at the backend.
