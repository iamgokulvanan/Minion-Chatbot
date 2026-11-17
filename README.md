# MINION AI – Next-Generation Intelligent AI Assistant

> **"Your Intelligence. Your Assistant. Your World."**

![MINION AI Mascot](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Overview

**MINION AI** is a full-stack, production-oriented artificial intelligence assistant designed with a futuristic 3D aesthetic, glassmorphic dark interface, and real-time multimodal capabilities. 

Built from the ground up as an independent flagship assistant, MINION AI delivers immediate streaming responses, live AI image generation, voice interaction, document intelligence, and autonomous web research.

---

## 🎨 Visual Identity & Design System

* **Primary Background:** `#08090B` (Deep Cosmic Black)
* **Secondary Background:** `#111318` (Graphite)
* **Card & Stage Container:** `#171A20` & `#0D111A` (Frosted Glassmorphism)
* **Primary Accent:** `#FFD600` (Electric Yellow)
* **Secondary Accent:** `#00D8FF` (Cyan Energy Glow)
* **Typography:**
  * Interface: **Inter**
  * Headings: **Space Grotesk**
  * Code & Terminals: **JetBrains Mono**
* **Themes Supported:**
  * 🌌 Midnight Black
  * ⚡ Electric Yellow
  * ⬛ Pure Dark (OLED Zero-Black)
  * 💎 Cyber Glass (Cyan / Blue-Violet Hologram)

---

## 🤖 3D AI Mascot: "MINION CORE"

Rendered in real-time using **Three.js** with:
* Metallic obsidian spherical core shell with clearcoat reflections
* Front glossy black digital visor with glowing electric yellow/cyan pupils
* Dual gyroscopic holographic orbital rings
* Particle aura field with audio reactivity
* **6 Reactive Animation States:**
  1. **Idle:** Gentle levitation and breathing glow
  2. **Listening:** Voice-reactive pulse and focused digital eyes
  3. **Thinking:** High-speed orbital rotation and processing shimmer
  4. **Responding:** Radiating energy shockwaves
  5. **Success:** Friendly happy curved eyes
  6. **Error:** Warning amber diagnostic pulse

---

## 🚀 Key Features

### 1. 💬 Real-Time Streaming AI Chat
* Instant sub-50ms latency response generation via Server-Sent Events (SSE).
* Provider-independent AI layer supporting OpenAI-compatible endpoints (Groq, DeepSeek, Ollama, OpenAI) + built-in autonomous intelligence reasoning engine.
* Multi-turn session context memory.
* Syntax-highlighted code blocks with line numbers, **Copy code**, and **Download file** buttons.
* Text-to-speech (TTS) speaker playback on all messages.

### 2. 🎨 Live AI Image Generation
* Integrated Flux.1 photoreal visual generator (`/api/image/generate` or via chat prompt).
* Triggers automatically when asking: *"generate an image of...", "draw...", "paint..."* or toggling `🎨 Image Gen` mode.
* Full-bleed lightbox zoom and direct image download.

### 3. 📧 Login Security & Email Notification
* Automatic dispatch of welcome and security alert emails upon user registration or login.
* Displays a real-time toast and built-in **Dispatched Email Viewer** modal in the UI.
* Plug-and-play SMTP configuration for production mail servers.

### 4. 🎙️ Voice Assistant
* Speech-to-text with continuous interim results and animated audio waveform visualizer.
* Real-time audio pitch and rate customization.

### 5. 📄 Document & PDF Intelligence
* Drag-and-drop file upload for PDF, TXT, MD, CSV, and code files.
* Text extraction via `pypdf` with executive synthesis, word counts, and key takeaway bullets.

### 6. 🌐 Autonomous Web Research
* Real-time search query aggregation with authentic citations, domain badges, and clickable reference sources.

---

## 🏗️ Architecture

```
minion-ai/
├── api/
│   └── index.py            # Vercel serverless entrypoint
├── backend/
│   ├── app/
│   │   ├── config.py       # Pydantic environment settings
│   │   ├── main.py         # FastAPI application & SPA mounting
│   │   ├── database/       # SQLAlchemy engine & session manager
│   │   ├── models/         # Users, Conversations, Messages, Files, Preferences
│   │   ├── routes/         # Auth, Chat, Uploads, Research, Image, Settings
│   │   ├── services/       # AI, Document, Vision, Search, Image, Email
│   │   └── middleware/     # JWT authentication & passwords
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Mascot 3D, LeftRailDock, TopBar, Chat, Modals
│   │   ├── contexts/       # AuthContext, ChatContext, ThemeContext
│   │   ├── services/       # API client & SSE streaming reader
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main stage container
│   ├── package.json
│   └── vite.config.ts
├── vercel.json             # Vercel deployment configuration
└── README.md
```

---

## ⚡ Quickstart (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

* **Frontend UI:** `http://localhost:5173`
* **Full-Stack Application:** `http://localhost:8000`
* **Swagger API Docs:** `http://localhost:8000/docs`

---

## 🌐 Vercel Deployment

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: MINION AI full-stack launch"
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com):
   * Click **New Project**
   * Import the **Minion-Chatbot** repository
   * Vercel will automatically detect `vercel.json` and deploy both the Vite frontend and Python FastAPI backend serverless functions!

---

## 📜 License & Credits

Designed and engineered for **MINION AI**.  
*Brand: MINION AI — Your Intelligence. Your Assistant. Your World.*
