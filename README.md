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
┌──────────────────────────────────────────────────────┐
│                    Docker Host                       │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Ollama     │  │ Cloud        │  │  Docker     │ │
│  │  (Local LLM) │  │ Computer     │  │  Manager    │ │
│  │  :11434      │  │  :8080       │  │  :9800      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │        │
│         └─────────────────┴─────────────────┘        │
│                     cloudpc-net                      │
└──────────────────────────────────────────────────────┘
```

| Service | Description | Port |
|---------|-------------|------|
| **cloudcomputer** | Main application (Express + Vue 3) | 8080 |
| **docker-manager** | Container lifecycle manager sidecar | 9800 |
| **ollama** | Local LLM inference server (GPU-accelerated) | 11434 |

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

# ── Ollama (Local LLM) ──
OLLAMA_URL=http://cloudpc-ollama:11434   # Internal Docker URL (no change needed)

# ── Optional API Keys ──
FINNHUB_API_KEY=             # Finnhub API key for stock tracker app
```

### 3. Start with Docker Compose

```bash
docker compose up -d
```

This will start three services:
- **Ollama** — Local LLM server (port 11434)
- **Cloud Computer** — Main application (port 8080)
- **Docker Manager** — Container management sidecar (port 9800)

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

| Model | Size | Command |
|-------|------|---------|
| Llama 3.2 (3B) | ~2 GB | `ollama pull llama3.2` |
| Llama 3.1 (8B) | ~4.7 GB | `ollama pull llama3.1` |
| Gemma 3 (4B) | ~3 GB | `ollama pull gemma3` |
| Mistral (7B) | ~4.1 GB | `ollama pull mistral` |
| Phi-4 (14B) | ~9 GB | `ollama pull phi4` |
| DeepSeek-R1 (7B) | ~4.7 GB | `ollama pull deepseek-r1` |
| Qwen 3 (8B) | ~5 GB | `ollama pull qwen3` |
| CodeLlama (7B) | ~3.8 GB | `ollama pull codellama` |

> After pulling a model, it automatically appears in the AI provider dropdown — no configuration needed.

### CPU-Only Mode (No NVIDIA GPU)

Remove the GPU reservation from `docker-compose.yml`:

```yaml
  ollama:
    image: ollama/ollama
    container_name: cloudpc-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    # Remove the entire 'deploy' block for CPU-only mode
    networks:
      - cloudpc-net
    restart: always
```

### Disable Ollama

To run without Ollama, remove or comment out the `ollama` service from `docker-compose.yml` and remove `OLLAMA_URL` from the cloudcomputer environment:

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
| `DOCKER_MANAGER_URL` | `http://docker-manager:9800` | Docker Manager sidecar URL |
| `DM_SECRET` | `cloudpc-docker-manager-secret` | Shared secret between app and Docker Manager |
| `OLLAMA_URL` | `http://cloudpc-ollama:11434` | Ollama server URL (unset to disable) |
| `FINNHUB_API_KEY` | — | API key for stock market data |

### Docker Manager Service

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKER_NETWORK` | `cloudpc-net` | Docker network for managed containers |
| `DM_SECRET` | `cloudpc-docker-manager-secret` | Shared authentication secret |
| `DM_PORT` | `9800` | Docker Manager listen port |
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
├── docker-compose.yml         # Docker stack definition
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

Deploy multiple Cloud Computer instances sharing a single Ollama server:

```bash
# Instance 1
INSTANCE_ID=team-alpha APP_PORT=8080 docker compose up -d

# Instance 2
INSTANCE_ID=team-beta APP_PORT=8081 docker compose up -d
```

Each instance gets:
- Its own data volume (`cloudpc-{INSTANCE_ID}-data`)
- Its own Docker Manager
- Shared access to Ollama (stateless — no data leakage between instances)

---

## 📦 Docker Volumes

| Volume | Purpose |
|--------|---------|
| `cloudpc-ollama-models` | Ollama model weights (shared) |
| `cloudpc-{INSTANCE_ID}-data` | Application data, user files, settings |
| `cloudpc-{INSTANCE_ID}-dm-data` | Docker Manager state |

---

## 🛡️ Security Notes

- Change `jwtSecret` in `desktop.config.json` before production deployment
- Change `DM_SECRET` to a unique value in `docker-compose.yml`
- Use a reverse proxy (nginx, Caddy, Traefik) with HTTPS in production
- Ollama is exposed only within the Docker network by default; remove the `ports` mapping in `docker-compose.yml` to fully isolate it

---

## 📄 License

MIT