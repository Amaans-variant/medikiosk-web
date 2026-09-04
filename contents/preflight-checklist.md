# 🛫 MediKiosk — Pre-Flight Checklist

> Before writing a single line of code, every item on this list must be ✅.
> Skipping any of these creates bugs, rework, or demo failures later.

---

## Your System Audit Results

| Tool | Status | Version / Notes |
| :--- | :--- | :--- |
| **Machine** | ✅ Excellent | MacBook Pro M5 Pro, 24GB RAM, 844GB free — more than enough |
| **macOS** | ✅ | 26.6.2 |
| **Node.js** | ✅ Installed | v26.8.1 — latest LTS, perfect |
| **npm** | ✅ Installed | 11.19.0 |
| **Python** | ⚠️ Old version | 3.9.6 (system Python). Need 3.11+ for FastAPI with modern typing |
| **pip** | ⚠️ Old | 21.2.4 — ships with system Python |
| **Git** | ✅ Installed | 2.50.1 |
| **Homebrew** | ✅ Installed | 6.0.21 |
| **Docker** | ❌ Not installed | Needed for PostgreSQL + Redis + full-stack dev |
| **pnpm** | ❌ Not installed | Recommended over npm for monorepo (faster, disk-efficient) |
| **PostgreSQL** | ❌ Not installed | Primary database |
| **Redis** | ❌ Not installed | Session cache, real-time pub/sub |
| **Git config** | ❌ Not configured | No .gitconfig found — need name + email |
| **SSH keys** | ❌ Not found | Needed for GitHub push |
| **uv (Python)** | ❌ Not installed | Modern Python package manager (replaces pip + venv) |

---

## What We Need — Complete Checklist

### Category 1: Development Tools (Install Once)

These are the tools that need to be on your machine:

| # | Tool | Why We Need It | How to Install |
| :--- | :--- | :--- | :--- |
| 1 | **pnpm** | Fast monorepo package manager. Shared dependency hoisting means `node_modules` doesn't balloon to 2GB | `npm install -g pnpm` |
| 2 | **Docker Desktop** | Run PostgreSQL + Redis locally without polluting your Mac. One `docker compose up` starts everything | Download from docker.com |
| 3 | **Python 3.12+** | FastAPI requires modern Python for native `dict | None` syntax, async generators, and Pydantic v2 | `brew install python@3.12` |
| 4 | **uv** | 10-100x faster than pip for Python dependency resolution. Creates virtual envs automatically | `brew install uv` |
| 5 | **Git configured** | Version control with proper commit identity | `git config --global user.name` + `user.email` |

### Category 2: Accounts & API Keys (Sign Up Once)

These are external services we integrate with. Sign up now so keys are ready when we need them:

| # | Service | Why | Free Tier? | Sign Up |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **GitHub account** | Code hosting, CI/CD, collaboration | ✅ Free | github.com |
| 2 | **Google AI Studio (Gemini API)** | LLM for clinical summary generation, document OCR, entity extraction | ✅ Free tier (1500 req/day) | aistudio.google.com |
| 3 | **Bhashini API** | Indian language ASR (speech-to-text) and TTS (text-to-speech) — government initiative, SIH judges love it | ✅ Free for development | bhashini.gov.in/ulca |
| 4 | **ABDM Sandbox** | Test ABHA verification and FHIR data push without production access | ✅ Free sandbox | sandbox.abdm.gov.in |
| 5 | **Vercel** (optional) | One-click deployment for SIH demo — free for Next.js projects | ✅ Free hobby tier | vercel.com |

> **For Day 1 coding, only #1 (GitHub) and #2 (Gemini) are blocking.** Bhashini and ABDM can use mock/fallback adapters until keys arrive.

### Category 3: Project Foundation (We Set Up Together)

These are the one-time setup tasks before coding begins:

| # | Task | What It Does |
| :--- | :--- | :--- |
| 1 | **Initialize Git repo** | Version control from commit #1 |
| 2 | **Create monorepo structure** | `apps/kiosk-ui`, `apps/doctor-dashboard`, `packages/api`, `packages/shared` |
| 3 | **pnpm workspace config** | `pnpm-workspace.yaml` linking all packages |
| 4 | **Next.js 14 scaffolding** (kiosk-ui) | App Router, Tailwind, TypeScript — our design system baked in |
| 5 | **Next.js 14 scaffolding** (doctor-dashboard) | Separate app, shared design tokens |
| 6 | **FastAPI project setup** | Python virtual env, FastAPI + Uvicorn + SQLAlchemy + Pydantic |
| 7 | **Docker Compose** | PostgreSQL 16 + Redis 7 + MinIO (object storage) — one command starts all infra |
| 8 | **Database migration** | Alembic initial migration with multi-tenant schema |
| 9 | **ESLint + Prettier** (TypeScript) | Code formatting consistency — no style debates |
| 10 | **Ruff** (Python) | Lightning-fast Python linting + formatting |
| 11 | **Tailwind config** with our design tokens | Colors, fonts, shadows, radii — all from design-system.md |
| 12 | **Noto Sans font** loaded | Google Fonts with Devanagari subset |
| 13 | **`.env.example`** | All API keys documented with placeholder values |
| 14 | **`.gitignore`** | Node modules, Python venv, .env, Docker volumes, OS files |
| 15 | **Makefile** | `make dev`, `make build`, `make test`, `make db-migrate` — team-friendly commands |

### Category 4: Clinical Data Files (We Build Together)

These JSON files ARE the clinical brain of MediKiosk. Code reads from them — they are NOT hardcoded in components:

| # | File | Contents | Why Data, Not Code |
| :--- | :--- | :--- | :--- |
| 1 | **`chief_complaints.json`** | 30+ common complaints with: ID, Hindi label, English label, icon file reference, body region, SNOMED code | Adding a new complaint = adding a JSON entry, not touching React code |
| 2 | **`socrates_templates.json`** | Per-complaint follow-up question trees (onset, character, severity, etc.) | Clinical logic is reviewable by doctors, not buried in code |
| 3 | **`dashavidha_questions.json`** | Dashavidha Pariksha questions: Prakriti, Agni, Koshtha, etc. with options in Hindi + English + icons | AYUSH content is editable by Ayurvedic physicians |
| 4 | **`red_flags.json`** | Emergency symptom patterns + what to trigger (alert type, severity) | Safety-critical rules must be auditable |
| 5 | **`ros_checklist.json`** | Review of Systems questions per body system | Expandable per specialty |
| 6 | **`lab_reference_ranges.json`** | Normal ranges for common lab tests (HbA1c, creatinine, CBC, etc.) | Used by document OCR module to flag abnormals |
| 7 | **`i18n/hi.json`** | Hindi translations for all UI strings | Adding a language = adding a JSON file |
| 8 | **`i18n/en.json`** | English translations | Same |

---

## The Installation Order (What To Do First)

This is the exact sequence. Each step unblocks the next:

```
Step 1: Install Dev Tools (5 minutes)
│
├── pnpm (npm install -g pnpm)
├── Python 3.12 (brew install python@3.12)
├── uv (brew install uv)
├── Docker Desktop (download + install)
└── Git config (name + email)
│
▼
Step 2: Sign Up for APIs (10 minutes, can be parallel)
│
├── GitHub account (if not already)
├── Google AI Studio → get Gemini API key
├── Bhashini ULCA → register for API access
└── ABDM Sandbox → register for sandbox credentials
│
▼
Step 3: Project Scaffolding (We do this together — 30 minutes)
│
├── git init + .gitignore
├── Monorepo structure + pnpm workspace
├── Next.js apps (kiosk + doctor)
├── FastAPI backend + uv virtualenv
├── Docker Compose (Postgres + Redis)
├── Design system tokens in Tailwind config
└── First commit: "🏗️ Initial project scaffolding"
│
▼
Step 4: Clinical Data Files (We do this together — 1 hour)
│
├── chief_complaints.json (30 complaints)
├── socrates_templates.json (branching questions)
├── dashavidha_questions.json (AYUSH intake)
├── red_flags.json (emergency patterns)
└── i18n/hi.json + i18n/en.json (translations)
│
▼
Step 5: First Running Screen (We do this together — 1 hour)
│
├── Language selection screen (first screen a patient sees)
├── Connected to clinical data files
├── Custom icon components (SVG, not emoji)
├── Design system applied (colors, fonts, shadows, spacing)
└── Second commit: "✨ Language selection screen with design system"
```

---

## What We DON'T Need Right Now

Avoid over-preparing. These are **NOT needed before coding starts**:

| ❌ Don't Need Yet | Why |
| :--- | :--- |
| Figma account / designs | We code directly with our design-system.md tokens. Figma comes later for polish. |
| Domain name | Demo runs on localhost / Vercel preview URL |
| SSL certificates | Development is HTTP. Docker handles HTTPS in staging. |
| CI/CD pipeline | Manual deploy is fine for SIH. Add GitHub Actions after Phase 2. |
| Cloud hosting account (AWS/GCP) | Docker Compose locally → Vercel for demo. Cloud comes post-SIH. |
| Testing framework setup | Jest/Vitest added in Phase 2. We write tests alongside features, not before. |
| Icon SVG files | We start with placeholder colored divs in Phase 1, replace with SVGs in Phase 2. The component interface is ready from Day 1. |

---

## Summary: Your Blocking Items

Before we write code, you need to do these **3 things**:

| # | Action | Time | Blocking? |
| :--- | :--- | :--- | :--- |
| **1** | Install Docker Desktop | 5 min download + install | ✅ YES — we need Postgres + Redis |
| **2** | Get a Gemini API key from Google AI Studio | 2 min sign up | ⚠️ Soft block — we can mock it for Day 1, but need it by Day 3 |
| **3** | Tell me your GitHub username + preferred Git email | 10 sec | ✅ YES — I'll configure Git and we push code |

Everything else (pnpm, Python 3.12, uv, project scaffolding, clinical data) — **I will set up for you** once you confirm those 3 items.
