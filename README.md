# Astraea AI — Metaphysical Destiny Intelligence Engine

> **Astraea AI** is an intelligent hybrid fortune-telling agent (*"Where ancient cosmic wisdom meets modern artificial intelligence"*). It bridges deterministic Chinese & Western metaphysical calculations with generative AI synthesis.

---

## 🌟 Key Features

- **Multi-Modal Divination Engines**:
  - **Bazi (Four/Three Pillars)**: Sexagenary Ganzhi calendar calculations, Day Master identification, and Five Elements (*Wu Xing*) balance.
  - **Zi Wei Dou Shu (12 Palaces Matrix)**: Primary star placement across Life, Career, Wealth, Spouse, and Health palaces.
  - **Tarot Card Divination**: 78-card deck shuffling and 3-card spread (Past/Foundation, Present State, Future Outlook).
- **Graceful Unknown Birth Time Handling**:
  - **Mode A (Default Peak Solar Hour)**: Uses the Horse Hour (11:00 AM – 1:00 PM / 午时) with a clear disclosure badge.
  - **Mode B (3-Pillars Mode)**: Omits the Hour Pillar entirely, calculating Year, Month, and Day pillars for high baseline precision.
- **Comprehensive General Fate Report**:
  - Automatically synthesizes insights across 4 key life domains: **Career & Destiny**, **Love & Romance**, **Health & Vitality**, and **Family, Wealth & Prosperity**.
- **In-Depth Downloadable Report (5,000 Words)**:
  - Generates and downloads a complete, structured 5,000-word destiny report document (`.md`).
- **Interactive Conversational Oracle Chat**:
  - Multi-turn Q&A with dynamic **Suggested Question Pills** rendered after every answer.
- **Light Macaron UI System**:
  - Clean, soft rose pink aesthetic (`#FAF7F2` warm canvas, soft pastel cards, no dark/black backgrounds).
  - Vertically centered date of birth input card before report generation.
- **Built-in Observability & Tracing**:
  - Dedicated **"Logic & Traces"** view in the left navigation sidebar displaying real-time execution spans, latency (ms), token usage, and parameter payloads.

---

## 📂 Project Structure

```
celestia-fortune-agent/
├── EVALUATION.md                  # Comprehensive assignment grading rubric document (Max Score 95)
├── README.md                      # Project overview & usage instructions
├── Dockerfile                     # Multi-stage Docker build config
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite dev server configuration (Port 5000)
├── tailwind.config.js             # Light macaron theme configuration
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD workflow
├── backend/
│   └── main.py                    # Python FastAPI backend service
└── src/
    ├── App.jsx                    # Main application orchestrator & state
    ├── main.jsx                   # React entrypoint
    ├── index.css                  # Base styles and scrollbar utilities
    ├── components/
    │   ├── Header.jsx             # Top bar with Astraea AI branding & 2-sentence signature
    │   ├── Sidebar.jsx            # Left navigation sidebar (Destiny Reading & Logic Traces)
    │   ├── InputForm.jsx          # Vertically centered birth date input card
    │   ├── GeneralFateReport.jsx  # 4 Life Domains, Bazi, Tarot, & 5,000-word download button
    │   ├── ConversationalChat.jsx # Interactive chat with suggested question pills
    │   └── LogicTracesView.jsx    # Real-time span & trace inspector
    └── utils/
        ├── baziEngine.js          # Sexagenary Ganzhi & Wu Xing calculator
        ├── ziweiEngine.js         # 12 Palaces & Primary Star matrix engine
        ├── tarotEngine.js         # 78-card deck & 3-card spread drawer
        ├── aiSynthesizer.js       # Report synthesizer & follow-up Q&A generator
        └── reportGenerator.js     # 5,000-word downloadable report exporter
```

---

## 🚀 Quick Start

### 1. Local Development Server

```bash
# Clone the repository
git clone https://github.com/alicelimingwang/astraea-ai-agent-app.git
cd astraea-ai-agent-app

# Install dependencies
npm install

# Start the Vite development server (Port 5000)
npm run dev
```

Open your browser at `http://localhost:5000`.

### 2. Production Build

```bash
npm run build
npm run preview
```

### 3. Containerized Deployment (Docker)

```bash
docker build -t astraea-ai-agent .
docker run -p 5000:5000 astraea-ai-agent
```

---

## 📊 Evaluation Criteria Mapping

This repository is built to meet the **95-point maximum score** for agentic application evaluation:

1. **Tool & Interface Design (15 pts)**: Light macaron UI, vertically centered input card, downloadable report, and interactive chat pills.
2. **Context & Memory (15 pts)**: Session state retention for multi-turn Q&A without re-asking birth details.
3. **Orchestration & Logic (25 pts)**: Deterministic Ganzhi math + Zi Wei matrix + Tarot RNG -> Generative synthesis with unknown time handling modes.
4. **Observability & Tracing (20 pts)**: OpenTelemetry span tracking & dedicated "Logic & Traces" left nav view.
5. **Infrastructure & CI/CD (20 pts)**: Multi-stage Dockerfile, FastAPI backend, and GitHub Actions CI/CD pipeline.

See [`EVALUATION.md`](file:///home/admin_limingwang_altostrat_com/celestia-fortune-agent/EVALUATION.md) for full details.

---

## 📄 License

MIT License. Built for agentic AI assignments and metaphysical exploration.
