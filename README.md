# ☁️ Aysi Cloud Computer

A full-featured web-based desktop operating system built with **Node.js**, **Express**, **Vue 3**, and **WebSocket**. Run your own personal cloud PC in the browser — complete with 140+ applications, AI assistant, Docker container management, multi-language support, and a community platform.

![Node.js](https://img.shields.io/badge/Node.js-20-green) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![Apps](https://img.shields.io/badge/Apps-140+-purple) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- **Desktop Environment** — Draggable, resizable windows with taskbar, start menu, system tray, and wallpaper support
- **140+ Applications** — 16 built-in + 126 store apps (file manager, code editor, terminal, browser, music player, office tools, games, and more)
- **AI Assistant** — Multi-provider AI chat with support for OpenAI, Anthropic, Google Gemini, DeepSeek, Groq, Mistral, Cohere, xAI, GitHub Copilot, OpenRouter, Perplexity, and **Ollama (local LLM)**
- **Docker Integration** — Install and manage containerized apps (PostgreSQL, MongoDB, Redis, Elasticsearch, etc.) via a built-in Docker Manager
- **Community Platform** — Cross-instance networking with anonymous profiles, chat rooms, forums, and multiplayer games
- **Multi-Language** — 12+ languages (Turkish, English, German, French, Spanish, Russian, Chinese, Japanese, Italian, Arabic, Korean, Hindi, Portuguese)
- **Security** — JWT authentication, two-factor auth (2FA), per-user data isolation
- **Responsive** — Desktop and mobile layouts

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Docker Host                              │
│                                                                  │
│  ┌──────────────┐   ┌───────────────────────────────────────┐    │
│  │   Ollama     │   │  Instance (per team / user group)     │    │
│  │  (Shared)    │   │                                       │    │
│  │  :11434      │   │  ┌──────────────┐  ┌──────────────┐   │    │
│  │              │   │  │ Cloud        │  │  Docker      │   │    │
│  │              │   │  │ Computer     │  │  Manager     │   │    │
│  │              │   │  │  :8080       │  │  :8081       │   │    │
│  │              │   │  └──────┬───────┘  └──────┬───────┘   │    │
│  └──────┬───────┘   │         └─────────────────┘           │    │
│         │           └───────────────────┬───────────────────┘    │
│         └───────────────────────────────┘                        │
│                        cloudpc-net                               │
└──────────────────────────────────────────────────────────────────┘
```

| Service            | Compose File                  | Description                                  | Port  |
|--------------------|-------------------------------|----------------------------------------------|-------|
| **ollama**         | `docker-compose.ollama.yml`   | Shared local LLM server (GPU-accelerated)    | 11434 |
| **cloudcomputer**  | `docker-compose.yml`          | Main application (Express + Vue 3)           | 8080  |
| **docker-manager** | `docker-compose.yml`          | Container lifecycle manager sidecar          | 8081  |

---

## 📋 Prerequisites

- **Docker** ≥ 20.10 & **Docker Compose** ≥ 2.0
- **NVIDIA GPU + drivers** (optional, for GPU-accelerated Ollama)
- **NVIDIA Container Toolkit** (optional, for GPU passthrough)

> If you don't have an NVIDIA GPU, Ollama will run on CPU (slower but functional). Remove the GPU reservation block from `docker-compose.yml`.

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/anthropics/cloudcomputer.git
cd cloudcomputer
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# ── Instance Settings ──
INSTANCE_ID=default          # Unique ID for this instance (for multi-instance deployments)
APP_PORT=8080                # Host port to expose the web UI

# ── Docker App Port Range ──
DM_PORT_START=9000           # Start of port range for Docker-managed apps
DM_PORT_END=9999             # End of port range (use non-overlapping ranges for multi-instance)

# ── Optional API Keys ──
FINNHUB_API_KEY=             # Finnhub API key for stock tracker app
```

### 3. Start with Docker Compose

```bash
# Start Ollama (shared infrastructure, run once)
docker compose -f docker-compose.ollama.yml up -d

# Start Cloud Computer instance
docker compose up -d --build
```

This will start three services:
- **Ollama** — Shared local LLM server (port 11434) — runs independently
- **Cloud Computer** — Main application (port 8080)
- **Docker Manager** — Container management sidecar (port 8081)

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:8080
```

Default credentials:
- **Username:** `admin`
- **Password:** Set on first login via the setup wizard

---

## 🦙 Ollama (Local LLM) Setup

Cloud Computer includes **Ollama** as an infrastructure-level service for local AI inference. It's shared across all users and requires no API keys.

### Pull a Model

After starting the stack, pull a model into Ollama:

```bash
# Pull a model (run from host machine)
docker exec -it cloudpc-ollama ollama pull llama3.2
docker exec -it cloudpc-ollama ollama pull gemma3

# List available models
docker exec -it cloudpc-ollama ollama list
```

### Popular Models

| Model            | Size    | Command                   |
|------------------|---------|---------------------------|
| Llama 3.2 (3B)   | ~2 GB   | `ollama pull llama3.2`    |
| Llama 3.1 (8B)   | ~4.7 GB | `ollama pull llama3.1`    |
| Gemma 3 (4B)     | ~3 GB   | `ollama pull gemma3`      |
| Mistral (7B)     | ~4.1 GB | `ollama pull mistral`     |
| Phi-4 (14B)      | ~9 GB   | `ollama pull phi4`        |
| DeepSeek-R1 (7B) | ~4.7 GB | `ollama pull deepseek-r1` |
| Qwen 3 (8B)      | ~5 GB   | `ollama pull qwen3`       |
| CodeLlama (7B)   | ~3.8 GB | `ollama pull codellama`   |

> After pulling a model, it automatically appears in the AI provider dropdown — no configuration needed.

### CPU-Only Mode (No NVIDIA GPU)

Ollama runs in its own compose file (`docker-compose.ollama.yml`). For CPU-only mode, simply leave the `deploy` block commented out (default).

For GPU acceleration, uncomment the GPU reservation block in `docker-compose.ollama.yml`:

```yaml
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

### Disable Ollama

To run without Ollama, simply don't start it and remove `OLLAMA_URL` from the cloudcomputer environment:

```yaml
  cloudcomputer:
    environment:
      # - OLLAMA_URL=http://cloudpc-ollama:11434   # ← comment out
```

---

## ⚙️ Environment Variables

### Cloud Computer Service

| Variable | Default | Description |
|----------|---------|-------------|
| `INSTANCE_ID` | `default` | Unique identifier for this instance |
| `APP_PORT` | `8080` | Host port for the web UI |
| `IS_DOCKER` | `true` | Set automatically in Docker |
| `DOCKER_MANAGER_URL` | `http://docker-manager:8081` | Docker Manager sidecar URL |
| `DM_SECRET` | `cloudpc-docker-manager-secret` | Shared secret between app and Docker Manager |
| `OLLAMA_URL` | `http://cloudpc-ollama:11434` | Ollama server URL (unset to disable) |
| `FINNHUB_API_KEY` | — | API key for stock market data |

### Docker Manager Service

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKER_NETWORK` | `cloudpc-net` | Docker network for managed containers |
| `DM_SECRET` | `cloudpc-docker-manager-secret` | Shared authentication secret |
| `DM_PORT` | `8081` | Docker Manager listen port |
| `DM_PORT_START` | `9000` | Start of port range for managed containers |
| `DM_PORT_END` | `9999` | End of port range for managed containers |

---

## 🤖 AI Providers

Users can configure cloud AI providers from **Settings → AI** by entering API keys:

| Provider | Model Example | API Key Required |
|----------|--------------|-----------------|
| OpenAI | gpt-4o | ✅ |
| Anthropic | claude-sonnet-4-20250514 | ✅ |
| Google Gemini | gemini-2.5-flash | ✅ |
| DeepSeek | deepseek-chat | ✅ |
| Groq | llama-3.3-70b-versatile | ✅ |
| Mistral | mistral-large-latest | ✅ |
| Cohere | command-r-plus | ✅ |
| xAI (Grok) | grok-3 | ✅ |
| GitHub Copilot | claude-sonnet-4 | ✅ |
| OpenRouter | auto | ✅ |
| Perplexity | sonar-pro | ✅ |
| **Ollama (Local)** | llama3.2, gemma3 | ❌ (auto-detected) |

---

## 🗂️ Project Structure

```
cloudcomputer/
├── desktop.js                 # Main Express server (~10K lines)
├── desktop.config.json        # Server configuration
├── docker-compose.yml         # Instance stack (Cloud Computer + Docker Manager)
├── docker-compose.ollama.yml  # Shared Ollama LLM server
├── Dockerfile                 # Main app container
├── Dockerfile.docker-manager  # Docker Manager sidecar container
├── docker-manager.js          # Docker Manager service
├── package.json               # Node.js dependencies
├── index.html                 # Desktop UI (Vue 3 SPA)
├── mobile.html                # Mobile UI
├── login.html                 # Login page
├── setup.html                 # First-run setup wizard
├── apps/
│   ├── builtin/               # 16 built-in apps (always available)
│   │   ├── aichat/            # Desktop AI assistant panel
│   │   ├── appstore/          # App Store
│   │   ├── browser/           # Web browser
│   │   ├── calc/              # Calculator
│   │   ├── calendar/          # Calendar
│   │   ├── contacts/          # Contacts
│   │   ├── fileman/           # File manager
│   │   ├── notepad/           # Notepad
│   │   ├── settings/          # System settings
│   │   ├── terminal/          # Terminal emulator
│   │   ├── todo/              # Todo list
│   │   ├── weather/           # Weather widget
│   │   └── ...
│   └── store/                 # 126+ installable apps
│       ├── chatgpt/           # Full AI chat app
│       ├── codeeditor/        # Code editor (Monaco)
│       ├── postgres/          # PostgreSQL manager
│       ├── music-player/      # Music player
│       ├── paint/             # Drawing app
│       └── ...
├── data/
│   ├── ai/
│   │   └── agents/            # AI agent definitions (Markdown)
│   ├── appdata/               # Per-app data storage
│   ├── downloads/             # User downloads
│   ├── music/                 # Music library
│   ├── photos/                # Photo library
│   ├── users/                 # Per-user settings & data
│   └── videos/                # Video library
└── backups/                   # System backups
```

---

## 🔧 Development (Without Docker)

```bash
# Install dependencies
npm install

# Start the server
npm start
# or
node desktop.js
```

The app runs on `http://localhost:8080` by default (configurable in `desktop.config.json`).

> Note: Docker Manager and Ollama features require Docker. Without Docker, the app runs standalone with cloud AI providers only.

---

## 🐳 Multi-Instance Deployment

Deploy multiple Cloud Computer instances sharing a single Ollama server. Each instance needs a unique `INSTANCE_ID`, `APP_PORT`, and **port range** for Docker-managed apps.

```bash
# 1. Start shared Ollama (once)
docker compose -f docker-compose.ollama.yml up -d

# 2. Instance 1
INSTANCE_ID=team-alpha APP_PORT=8080 DM_PORT_START=9000 DM_PORT_END=9099 \
  docker compose -p team-alpha up -d --build

# 3. Instance 2
INSTANCE_ID=team-beta APP_PORT=8082 DM_PORT_START=9100 DM_PORT_END=9199 \
  docker compose -p team-beta up -d --build

# 4. Instance 3
INSTANCE_ID=team-gamma APP_PORT=8083 DM_PORT_START=9200 DM_PORT_END=9299 \
  docker compose -p team-gamma up -d --build
```

> **Important:** Use `-p <name>` (project name) to isolate each instance's containers. Without it, the second `up` would replace the first.

Each instance gets:
- Its own data volume (`cloudpc-{INSTANCE_ID}-data`)
- Its own Docker Manager with isolated port range
- Shared access to Ollama (stateless — no data leakage between instances)

### Using .env Files

For convenience, create a `.env` file per instance:

```bash
# team-alpha.env
INSTANCE_ID=team-alpha
APP_PORT=8080
DM_PORT_START=9000
DM_PORT_END=9099
```

```bash
docker compose -p team-alpha --env-file team-alpha.env up -d --build
```

### Reset an Instance

To fully reset an instance (deletes all user data):

```bash
INSTANCE_ID=team-alpha docker compose -p team-alpha down -v
```

---

## 📦 Docker Volumes

| Volume                          | Compose File               | Purpose                                |
|---------------------------------|----------------------------|----------------------------------------|
| `cloudpc-ollama-models`         | `docker-compose.ollama.yml`| Ollama model weights (shared)          |
| `cloudpc-{INSTANCE_ID}-data`    | `docker-compose.yml`       | Application data, user files, settings |
| `cloudpc-{INSTANCE_ID}-dm-data` | `docker-compose.yml`       | Docker Manager state                   |

---

## 🛡️ Security Notes

- Change `jwtSecret` in `desktop.config.json` before production deployment
- Change `DM_SECRET` to a unique value in `docker-compose.yml`
- Use a reverse proxy (nginx, Caddy, Traefik) with HTTPS in production
- Ollama is exposed only within the Docker network by default; remove the `ports` mapping in `docker-compose.yml` to fully isolate it

---

## ❤️ Sponsor

If you find Cloud Computer useful, please consider supporting its development through **GitHub Sponsors**.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github-sponsors&style=for-the-badge)](https://github.com/sponsors/aysinet)

### Why Sponsor?

Aysi Cloud Computer is a free and open-source project maintained with passion. Your sponsorship helps:

- 🚀 **New Features** — Development of new apps, AI integrations, and platform improvements
- 🐛 **Bug Fixes & Maintenance** — Keeping dependencies up to date and fixing issues
- 📖 **Documentation** — Better guides, tutorials, and examples
- 🌍 **Community** — Growing the community and supporting contributors
- ☁️ **Infrastructure** — Hosting, CI/CD, and testing resources

### How to Sponsor

1. Visit the [GitHub Sponsors page](https://github.com/sponsors/aysinet)
2. Choose a sponsorship tier or set a custom amount
3. Your profile will be featured in the **Sponsors** section (if opted in)

Every contribution, no matter the size, makes a difference. Thank you for supporting open source! 🙏

---

## 📄 License

MIT