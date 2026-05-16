# Backend: ASP.NET API

This folder contains the REST API for Algo-Rhythm. It handles authentication, song management, background job processing via Hangfire, real-time notifications via SignalR, and communication with both the Modal AI endpoints and Cloudflare R2.

---

## What It Does

- **Authentication** — JWT-based sign up, sign in, and token validation
- **Song management** — create, rename, publish/unpublish, download, and delete songs
- **Background job processing** — Hangfire queues and runs generation jobs, deciding which Modal endpoint to call based on the request type
- **Real-time notifications** — SignalR hub pushes song status updates to the frontend when generation completes
- **R2 integration** — reads and serves audio/thumbnail assets stored in Cloudflare R2
- **Database** — Entity Framework Core with migrations for all persistent data

---

## Project Structure

```
backend/Api/
├── Controllers/         # API route handlers (auth, songs, etc.)
├── Data/                # EF Core DbContext
├── Dtos/                # Request and response data transfer objects
├── Hubs/                # SignalR hub(s) for real-time song status updates
├── Migrations/          # EF Core database migrations
├── Models/              # Entity models (User, Song, etc.)
├── Properties/          # Launch settings
├── Repositories/        # Data access layer
├── Services/            # Business logic (auth, Modal calls, R2, Hangfire jobs)
├── Program.cs           # App entry point — service registration, middleware pipeline
├── Api.csproj           # Project file
├── Api.http             # HTTP test file for manual endpoint testing
├── Api.slnx             # Solution file
└── appsettings.json     # Configuration (do not commit secrets — use user secrets or env vars)
```

---

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- A running SQL Server, PostgreSQL, or SQLite instance (whichever your `DbContext` is configured for)
- Modal endpoints deployed (see `model/README.md`) — you'll need the endpoint URLs
- A Cloudflare R2 bucket set up with API credentials

---

## Setup

### 1. Restore dependencies

```bash
cd backend/Api
dotnet restore
```

### 2. Configure app settings

Do **not** put secrets directly in `appsettings.json`. Use [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) for local development:

```bash
dotnet user-secrets init
```

Then set each key:

```bash
dotnet user-secrets set "ConnectionStrings:Default" "your-connection-string"
dotnet user-secrets set "JWT:SecretKey" "your-64-char-secret"

dotnet user-secrets set "Modal:Modal-Key" "your-modal-key"
dotnet user-secrets set "Modal:Modal-Secret" "your-modal-secret"
dotnet user-secrets set "Modal:GenerateFromSongDescription" "https://..."
dotnet user-secrets set "Modal:GenerateFromLyricsDescription" "https://..."
dotnet user-secrets set "Modal:GenerateWithLyrics" "https://..."

dotnet user-secrets set "Cloudflare:AccessKeyId" "your-access-key-id"
dotnet user-secrets set "Cloudflare:SecretAccessKey" "your-secret-access-key"
dotnet user-secrets set "Cloudflare:AuthToken" "your-auth-token"
dotnet user-secrets set "Cloudflare:R2Api" "https://<account_id>.r2.cloudflarestorage.com"
dotnet user-secrets set "Cloudflare:BucketName" "your-bucket-name"
```

> In production, provide these as environment variables or through your hosting platform's secret management (e.g. Azure App Configuration, Railway variables, etc.).

### 3. Apply database migrations

```bash
dotnet ef database update
```

If you don't have the EF CLI tools installed:

```bash
dotnet tool install --global dotnet-ef
```

### 4. Run the API

```bash
dotnet run
```

The API will start on `https://localhost:70xx` by default (check `Properties/launchSettings.json` for the exact port). This URL is what goes in the frontend's `NEXT_PUBLIC_BACKEND_API` environment variable.

---

## Configuration Reference

All configuration lives under `appsettings.json` but should be overridden via user secrets locally or environment variables in production.

### `ConnectionStrings`

| Key | Description |
|---|---|
| `Default` | Database connection string |

### `JWT`

| Key | Description |
|---|---|
| `SecretKey` | Secret used to sign JWT tokens — must be at least 64 characters |

### `Modal`

| Key | Description |
|---|---|
| `Modal-Key` | Modal proxy auth key |
| `Modal-Secret` | Modal proxy auth secret |
| `GenerateFromSongDescription` | Endpoint URL for `generate_from_description` |
| `GenerateFromLyricsDescription` | Endpoint URL for `generate_with_described_lyrics` |
| `GenerateWithLyrics` | Endpoint URL for `generate_with_lyrics` |

> These URLs are printed to the console after running `modal deploy main.py` in the `model/` folder.

### `Cloudflare`

| Key | Description |
|---|---|
| `AccessKeyId` | R2 API access key ID |
| `SecretAccessKey` | R2 API secret access key |
| `AuthToken` | Cloudflare API token |
| `R2Api` | R2 endpoint URL (`https://<account_id>.r2.cloudflarestorage.com`) |
| `BucketName` | Name of the R2 bucket storing audio and thumbnails |

---

## How Background Jobs Work

When a song generation request comes in:

1. The controller receives the request and creates a `Processing` song record in the database.
2. It enqueues a **Hangfire** background job and immediately returns a response to the frontend.
3. The Hangfire job inspects the request type and selects the correct Modal endpoint (`GenerateFromSongDescription`, `GenerateFromLyricsDescription`, or `GenerateWithLyrics`).
4. It calls the Modal endpoint, which runs the AI generation and uploads files to R2, returning the R2 keys.
5. The job updates the song record in the database with the `r2_key` and `cover_image_r2_key`.
6. The SignalR hub notifies the connected frontend client, which dynamically updates the song card from `Processing` to playable.

The Hangfire dashboard is available at `/hangfire` when running locally — useful for monitoring job status and retrying failures.
