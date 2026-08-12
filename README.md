# Astraea AI — Metaphysical Destiny Intelligence Engine (v3.0.0)

> **Astraea AI** is an intelligent hybrid fortune-telling agent (*"Where ancient cosmic wisdom meets modern artificial intelligence"*). It bridges deterministic Chinese & Western metaphysical calculations with generative AI synthesis, OpenTelemetry distributed tracing, async memory, and guided LLM tool execution.

---

## 🌟 Key Architectural Features (v3.0.0)

- **Tool & Interface Design**:
  - Explicit Pydantic v2 JSON Schemas for LLM Tool Calling (`BaziCalculationInput`, `ZiWeiCalculationInput`, `TarotDrawInput`) exported at `/api/tools/schema`.
  - Comprehensive Google-style docstrings and parameter descriptions across all tool modules.
  - Guided Error Recovery (`ToolErrorRecovery`) returning step-by-step instructions and suggested fallback arguments upon tool validation failure.
- **Context & Memory**:
  - Production System Prompts (`ASTRAEA_SYSTEM_PROMPT`) for persona, guardrails, and tool usage rules.
  - Async SQLite Database using SQLAlchemy (`UserSession`, `ConversationHistory`, `UserProfile`, `MemorySummary`).
  - History Compaction (`HistoryCompactor`) compressing long chat turns (>10) into semantic memory summaries.
- **Orchestration & Logic**:
  - Google Gemini LLM API integration (`gemini-2.5-flash` / `gemini-2.5-pro`) via `google-genai` with fallback engine.
  - Multi-Agent Specialist Pattern (`BaziSpecialistAgent`, `ZiWeiSpecialistAgent`, `TarotDivinationAgent`, `MasterSynthesisAgent`, `GuardrailAgent`).
  - Dynamic Model Router (`ModelRouter`) selecting fast vs deep synthesis model routes.
  - Human-in-the-Loop (HITL) confirmation manager (`/api/hitl-confirm`).
- **Observability & Tracing**:
  - Structured JSON Logging using `pythonjsonlogger` with PII redaction.
  - Explicit Intent vs Outcome Tracking (`log_intent_vs_outcome`).
  - Real OpenTelemetry Distributed Tracing exported via `/api/traces` and displayed in the UI.
  - Automated PII Redaction Engine (`PIIRedactor`) masking emails, phone numbers, SSNs, and credit cards.
- **Infrastructure & CI/CD**:
  - Automated Pytest Agent Regression Harness (`tests/`): 16 tests passing 100%.
  - Infrastructure as Code (IaC): Terraform directory (`terraform/`) provisioning Cloud Run, Secret Manager, and IAM.
  - Secure Secret Management via Google Cloud Secret Manager for `GEMINI_API_KEY`.
  - GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`).

---

## 📂 Project Structure

```
celestia-fortune-agent/
├── EVALUATION.md                  # Comprehensive evaluation & architecture specification document
├── README.md                      # Project overview & usage instructions
├── Dockerfile                     # Multi-stage Python + React Docker build
├── package.json                   # React dependencies and scripts
├── vite.config.js                 # Vite dev server configuration
├── terraform/                     # Infrastructure as Code (IaC)
│   ├── main.tf                    # Cloud Run, Secret Manager, IAM resources
│   ├── variables.tf               # Terraform variable definitions
│   ├── outputs.tf                 # Cloud Run service URL outputs
│   └── terraform.tfvars.example   # Example variables
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD workflow
├── backend/                       # Python FastAPI Backend
│   ├── main.py                    # FastAPI application API entrypoint
│   ├── config.py                  # Configuration & Secret Manager integration
│   ├── schemas/                   # Pydantic tool, memory, and orchestration schemas
│   ├── tools/                     # Bazi, Zi Wei, Tarot tools & ToolRegistry
│   ├── memory/                    # Async SQLite DB, HistoryCompactor, AsyncMemoryManager
│   ├── agent/                     # System prompts, Guardrails, Router, HITL, Orchestrator
│   └── observability/             # JSON Logger, PII Redactor, OpenTelemetry Tracing
├── tests/                         # Pytest Agent Regression Harness
│   ├── test_tools.py
│   ├── test_memory.py
│   ├── test_orchestration.py
│   ├── test_observability.py
│   └── test_regression.py
└── src/                           # React Frontend Application
```

---

## 🚀 Quick Start

### 1. Backend Server & Virtualenv Setup

```bash
# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Start FastAPI backend server
uvicorn backend.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000` (OpenAPI Docs at `http://localhost:8000/docs`).

### 2. Frontend Development Server

```bash
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5000`.

### 3. Run Automated Agent Test Harness

```bash
PYTHONPATH=. ./venv/bin/pytest tests/ -v
```

### 4. Deploy Infrastructure via Terraform

```bash
cd terraform
terraform init
terraform plan -var-file="terraform.tfvars.example"
terraform apply -var-file="terraform.tfvars.example"
```

---

## 📄 License

MIT License. Built for agentic AI assignments and metaphysical exploration.
