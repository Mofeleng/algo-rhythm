# Model — AI Music & Image Generation (Modal + Python 3.12)

This folder contains the AI generation layer for Algo-Rhythm. It runs on [Modal](https://modal.com) and exposes a set of HTTP endpoints that the .NET backend calls to generate music and thumbnail images. All heavy GPU work happens here — the rest of the stack stays lightweight.

---

## What It Does

- Generates full songs (audio `.wav`) from a text description, custom lyrics, or a described lyric style
- Generates album cover thumbnails using Stable Diffusion XL Turbo
- Generates tags/categories for a song based on its description
- Uploads all outputs directly to **Cloudflare R2** and returns the R2 keys — no audio bytes travel back to the .NET backend

---

## Models Used

| Model | Purpose |
|---|---|
| [ACE-Step](https://github.com/ace-step/ACE-Step) | Music generation |
| [Qwen2-7B-Instruct](https://huggingface.co/Qwen/Qwen2-7B-Instruct) | Prompt generation, lyric writing, category tagging |
| [SDXL-Turbo](https://huggingface.co/stabilityai/sdxl-turbo) | Album cover / thumbnail generation |

All models run on a single **L40S GPU** instance managed by Modal, with model weights cached in Modal Volumes so cold starts don't re-download.

---

## Endpoints

All endpoints require Modal proxy authentication (`requires_proxy_auth=True`). The .NET backend must include the appropriate auth token in its requests.

### `POST /generate`
Quick test endpoint. Generates a hardcoded song and returns raw base64 audio. Useful for smoke-testing the pipeline.

### `POST /generate_from_description`
The main generation flow for most users. Accepts a plain-English song description and handles everything automatically.

**Request:**
```json
{
  "song_description": "An upbeat summer road trip song with electric guitar",
  "instrumental": false,
  "audio_duration": 120,
  "infer_step": 60,
  "guidance_scale": 15,
  "seed": 42
}
```

**Flow:** Description → Qwen generates a music prompt → Qwen writes lyrics (if not instrumental) → ACE-Step generates audio → SDXL-Turbo generates thumbnail → both uploaded to R2

### `POST /generate_with_lyrics`
For users who write their own lyrics. Accepts a music style prompt and the full lyrics directly.

**Request:**
```json
{
  "prompt": "Hip Hop, RnB, Melodic, Trap",
  "lyrics": "[verse]\nYour custom lyrics here...",
  "instrumental": false,
  "audio_duration": 120,
  "infer_step": 60,
  "guidance_scale": 15,
  "seed": 42
}
```

### `POST /generate_with_described_lyrics`
Middle ground — the user provides a music style prompt and describes the lyric content/theme, and Qwen writes the actual lyrics.

**Request:**
```json
{
  "prompt": "Lo-fi, Chill, Jazz",
  "described_lyrics": "A reflective late-night song about missing home",
  "instrumental": false,
  "audio_duration": 120,
  "infer_step": 60,
  "guidance_scale": 15,
  "seed": 42
}
```

**Response (all R2 endpoints):**
```json
{
  "r2_key": "uuid.wav",
  "cover_image_r2_key": "uuid.png",
  "categories": ["Lo-fi", "Jazz", "Chill", "Nostalgic"]
}
```

---

## Project Structure

```
model/
├── main.py                  # Modal app, MusicGenerationServer class, all endpoints
├── requirements.txt         # Python dependencies
├── prompts.py               # Qwen prompt templates (lyrics & music prompt generation)
└── models/
    └── dtos/
        ├── request_dto.py   # Pydantic request models
        └── response_dto.py  # Pydantic response models
```

---

## Prerequisites

- [Python 3.12](https://www.python.org/downloads/)
- A [Modal](https://modal.com) account
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket

---

## Setup

### 1. Install the Modal CLI

```bash
pip install modal
modal setup
```

This opens a browser to authenticate your Modal account.

### 2. Install dependencies locally (optional, for IDE support)

```bash
pip install -r requirements.txt
```

> Note: The actual execution environment is built inside Modal — you don't need a local GPU. Local install is only needed if you want autocomplete/linting in your editor.

### 3. Create the Modal Volumes

The app uses two persistent volumes to cache model weights between runs — this avoids re-downloading several GB of models on every cold start.

```bash
modal volume create ace-step-models
modal volume create qwen-hf-cache
```

### 4. Configure Secrets

Create a Modal secret named `music-generation-secrets` with the following keys:

```
R2_ENDPOINT_URL        # e.g. https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID       # Cloudflare R2 access key
R2_SECRET_ACCESS_KEY   # Cloudflare R2 secret key
R2_BUCKET_NAME         # Name of your R2 bucket
```

You can add these via the [Modal dashboard](https://modal.com/secrets) or the CLI:

```bash
modal secret create music-generation-secrets \
  R2_ENDPOINT_URL=https://... \
  R2_ACCESS_KEY_ID=... \
  R2_SECRET_ACCESS_KEY=... \
  R2_BUCKET_NAME=...
```

### 5. Deploy

```bash
modal deploy main.py
```

Modal will build the Docker image, install dependencies, and deploy the app. When finished, it prints the live endpoint URLs — copy these into the .NET backend's configuration.

---

## First Deploy Notes

- The first deploy will take a few minutes to build the image and download model weights onto the volumes.
- Subsequent deploys are fast since the volumes and image layers are cached.
- The server has a `scaledown_window` of 10 seconds, meaning it stays warm briefly after a request before scaling down. Adjust this in `main.py` if you want longer warm windows.

---

## Running Locally (for testing only)

You can run a function directly without deploying:

```bash
modal run main.py::MusicGenerationServer.generate
```

This spins up a temporary Modal container, runs the function, and exits.
