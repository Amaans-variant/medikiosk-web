# 🏗️ MediKiosk — System Architecture

> **Version:** 1.0
> **Date:** 2026-09-04
> **Architecture Style:** Modular Monolith (evolves to microservices at scale)

---

## 1. Architecture Philosophy

We do NOT start with microservices. That's over-engineering for a hackathon and early deployment. We use a **modular monolith** — clean module boundaries, shared database, single deployment unit — that can be split into services later when we have real traffic patterns to justify it.

```
Why Modular Monolith (Not Microservices):
├── Single deployment = simpler ops for hospital IT teams
├── Shared database = no distributed transaction headaches for patient data
├── Module boundaries via Python packages = clean separation without network overhead
├── Can split any module into a service later by extracting the package + adding API
└── SIH demo: one `docker-compose up` and everything works
```

---

## 2. High-Level System Architecture

```
                          PATIENT DEVICES
                    ┌──────────────────────────┐
                    │   Kiosk Tablet (PWA)     │
                    │   Patient Mobile (PWA)   │
                    └──────────┬───────────────┘
                               │ HTTPS / WSS
                               ▼
                    ┌──────────────────────────┐
                    │     NGINX / Caddy        │
                    │   (Reverse Proxy + TLS)  │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌─────────────────┐ ┌──────────┐ ┌─────────────────┐
    │  Next.js SSR    │ │ FastAPI  │ │  Next.js SSR    │
    │  Kiosk UI       │ │ Backend  │ │  Doctor Panel   │
    │  (Port 3000)    │ │(Port 8000│ │  (Port 3001)    │
    └─────────────────┘ └────┬─────┘ └─────────────────┘
                             │
            ┌────────────────┼────────────────────┐
            ▼                ▼                    ▼
    ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
    │  PostgreSQL  │ │    Redis     │  │   Object Store   │
    │  (Primary DB)│ │  (Sessions,  │  │  (MinIO / S3)    │
    │              │ │   Cache,     │  │  Document Images  │
    │              │ │   Pub/Sub)   │  │  (encrypted,     │
    │              │ │              │  │   auto-expiring)  │
    └──────────────┘ └──────────────┘  └──────────────────┘
                             │
            ┌────────────────┼────────────────────┐
            ▼                ▼                    ▼
    ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
    │  Bhashini    │ │  Gemini /    │  │  Google Cloud    │
    │  ASR + TTS   │ │  LLM API    │  │  Vision / OCR    │
    │  (External)  │ │  (External)  │  │  (External)      │
    └──────────────┘ └──────────────┘  └──────────────────┘
```

---

## 3. Monorepo Structure

```
medikiosk/
├── apps/
│   ├── kiosk-ui/                    # Next.js 14 — Patient-facing kiosk PWA
│   │   ├── app/
│   │   │   ├── (auth)/              # ABHA login & consent screens
│   │   │   │   ├── login/
│   │   │   │   └── consent/
│   │   │   ├── (intake)/            # Clinical history interview flow
│   │   │   │   ├── chief-complaint/
│   │   │   │   ├── hpi/
│   │   │   │   ├── past-history/
│   │   │   │   ├── medications/
│   │   │   │   ├── family-history/
│   │   │   │   ├── review-of-systems/
│   │   │   │   └── ayush-assessment/  # Dashavidha Pariksha
│   │   │   ├── (documents)/         # Document scanning flow
│   │   │   │   ├── capture/
│   │   │   │   └── review/
│   │   │   ├── (summary)/           # Patient-facing confirmation
│   │   │   │   └── confirm/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                  # Design system (large touch targets)
│   │   │   │   ├── BigButton.tsx
│   │   │   │   ├── IconCard.tsx
│   │   │   │   ├── VoiceInput.tsx
│   │   │   │   ├── AudioPrompt.tsx
│   │   │   │   ├── BodyPartSelector.tsx
│   │   │   │   ├── SeveritySlider.tsx
│   │   │   │   └── LanguageSelector.tsx
│   │   │   ├── intake/              # Clinical interview components
│   │   │   └── scanner/             # Document capture components
│   │   ├── hooks/
│   │   │   ├── useVoiceInput.ts     # Bhashini ASR integration
│   │   │   ├── useAudioPrompt.ts    # TTS playback
│   │   │   └── useIntakeSession.ts  # Session state management
│   │   ├── lib/
│   │   │   ├── api-client.ts        # Type-safe API client
│   │   │   ├── fhir-types.ts        # FHIR R4 TypeScript types
│   │   │   └── clinical-ontology.ts # Chief complaints, symptom mappings
│   │   ├── public/
│   │   │   ├── icons/               # Medical iconography (SVG)
│   │   │   └── audio/               # Fallback audio prompts (offline)
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── doctor-dashboard/            # Next.js 14 — Physician OPD screen
│       ├── app/
│       │   ├── (auth)/              # Doctor login
│       │   ├── (opd)/               # OPD queue & patient summaries
│       │   │   ├── queue/           # Patient queue list
│       │   │   └── patient/[id]/    # Individual patient summary view
│       │   └── layout.tsx
│       ├── components/
│       │   ├── summary/             # Clinical summary display
│       │   │   ├── SummaryCard.tsx
│       │   │   ├── AyushCard.tsx
│       │   │   ├── TimelineView.tsx
│       │   │   ├── FlaggedValues.tsx
│       │   │   └── EditableField.tsx
│       │   └── queue/               # OPD queue components
│       └── package.json
│
├── packages/
│   ├── api/                         # FastAPI Backend (Python)
│   │   ├── medikiosk/
│   │   │   ├── __init__.py
│   │   │   ├── main.py              # FastAPI app entry point
│   │   │   ├── config.py            # Settings (env-based)
│   │   │   ├── dependencies.py      # Dependency injection
│   │   │   │
│   │   │   ├── modules/
│   │   │   │   ├── auth/            # ABHA authentication & consent
│   │   │   │   │   ├── router.py
│   │   │   │   │   ├── service.py
│   │   │   │   │   ├── schemas.py   # Pydantic models
│   │   │   │   │   └── abha_client.py
│   │   │   │   │
│   │   │   │   ├── intake/          # Clinical history intake engine
│   │   │   │   │   ├── router.py
│   │   │   │   │   ├── service.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   │   ├── dialogue_manager.py   # Adaptive question logic
│   │   │   │   │   ├── clinical_ontology.py  # SOCRATES, ROS, Red flags
│   │   │   │   │   └── ayush_ontology.py     # Dashavidha Pariksha logic
│   │   │   │   │
│   │   │   │   ├── documents/       # Document OCR & entity extraction
│   │   │   │   │   ├── router.py
│   │   │   │   │   ├── service.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   │   ├── ocr_engine.py         # OCR adapter (Vision API / PaddleOCR)
│   │   │   │   │   └── entity_extractor.py   # LLM-based clinical entity extraction
│   │   │   │   │
│   │   │   │   ├── summary/         # Clinical summary generation
│   │   │   │   │   ├── router.py
│   │   │   │   │   ├── service.py
│   │   │   │   │   ├── schemas.py
│   │   │   │   │   ├── generator.py          # LLM summary synthesizer
│   │   │   │   │   └── fhir_builder.py       # FHIR R4 Bundle assembly
│   │   │   │   │
│   │   │   │   └── doctor/          # Doctor dashboard API
│   │   │   │       ├── router.py
│   │   │   │       ├── service.py
│   │   │   │       └── schemas.py
│   │   │   │
│   │   │   ├── adapters/            # External service adapters (Strategy pattern)
│   │   │   │   ├── asr/
│   │   │   │   │   ├── base.py      # Abstract ASR interface
│   │   │   │   │   ├── bhashini.py  # Bhashini implementation
│   │   │   │   │   ├── whisper.py   # OpenAI Whisper fallback
│   │   │   │   │   └── webspeech.py # Browser Web Speech API (dev only)
│   │   │   │   ├── tts/
│   │   │   │   │   ├── base.py
│   │   │   │   │   ├── bhashini.py
│   │   │   │   │   └── gtts.py      # Google TTS fallback
│   │   │   │   ├── llm/
│   │   │   │   │   ├── base.py
│   │   │   │   │   ├── gemini.py
│   │   │   │   │   └── ollama.py    # Local Llama fallback (offline)
│   │   │   │   ├── ocr/
│   │   │   │   │   ├── base.py
│   │   │   │   │   ├── google_vision.py
│   │   │   │   │   └── paddleocr.py
│   │   │   │   └── abdm/
│   │   │   │       ├── base.py
│   │   │   │       ├── sandbox.py   # ABDM sandbox integration
│   │   │   │       └── mock.py      # Mock for development
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── engine.py        # SQLAlchemy async engine
│   │   │   │   ├── models.py        # ORM models
│   │   │   │   └── migrations/      # Alembic migrations
│   │   │   │
│   │   │   └── middleware/
│   │   │       ├── security.py      # Rate limiting, CORS, CSP
│   │   │       ├── logging.py       # Structured logging (no PHI)
│   │   │       └── session.py       # Redis session management
│   │   │
│   │   ├── tests/
│   │   │   ├── test_intake.py
│   │   │   ├── test_documents.py
│   │   │   ├── test_summary.py
│   │   │   ├── test_fhir.py
│   │   │   └── test_red_flags.py
│   │   │
│   │   ├── pyproject.toml
│   │   └── Dockerfile
│   │
│   └── shared/                      # Shared constants & types
│       ├── clinical/
│       │   ├── chief_complaints.json       # Standardized complaint list (EN + HI)
│       │   ├── socrates_templates.json     # Branching questions per complaint
│       │   ├── dashavidha_questions.json   # Ayurvedic intake question bank
│       │   ├── red_flags.json             # Emergency symptom patterns
│       │   ├── ros_checklist.json          # Review of Systems template
│       │   └── namaste_codes.json         # NAMASTE portal terminology
│       ├── fhir/
│       │   ├── profiles/                  # FHIR R4 structure definitions
│       │   └── examples/                  # Sample FHIR Bundles
│       └── i18n/
│           ├── hi.json                    # Hindi translations
│           ├── en.json                    # English translations
│           ├── ta.json                    # Tamil translations
│           └── ...                        # Other language packs
│
├── infrastructure/
│   ├── docker-compose.yml           # Full stack: API + DB + Redis + MinIO + UI
│   ├── docker-compose.dev.yml       # Dev overrides (hot reload, debug)
│   ├── nginx/
│   │   └── default.conf             # Reverse proxy config
│   └── scripts/
│       ├── seed-clinical-data.py    # Seed DB with clinical ontology data
│       └── generate-test-patients.py # Generate synthetic test patients
│
├── docs/
│   ├── api-reference.md
│   ├── deployment-guide.md
│   ├── abdm-integration-guide.md
│   └── clinical-ontology-guide.md
│
├── .env.example
├── .gitignore
├── README.md
└── Makefile                         # make dev, make build, make test, make seed
```

---

## 4. Data Model & Database Schema

### 4.1 PostgreSQL Schema (Core Tables — Multi-Tenant from Day 1)

Every table includes `hospital_id` for logical data isolation. This enables the same codebase to serve 1 hospital or 1,000 hospitals without re-architecture.

```sql
-- Hospital / Tenant (multi-tenancy root)
CREATE TABLE hospitals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    abdm_facility_id VARCHAR(50),                  -- ABDM facility registry ID
    type            VARCHAR(30) NOT NULL,           -- 'ayush' | 'allopathic' | 'both'
    departments     JSONB DEFAULT '[]',             -- List of OPD departments
    config          JSONB DEFAULT '{}',             -- Hospital-specific config (logo, OPD timings, etc.)
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Patient identity (linked to ABHA)
CREATE TABLE patients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id),
    abha_id         VARCHAR(17),                    -- 14-digit ABHA or null
    aadhaar_hash    VARCHAR(64),                    -- SHA-256 hash, never raw Aadhaar
    name            VARCHAR(255) NOT NULL,
    age             INTEGER,
    gender          VARCHAR(20),
    language_pref   VARCHAR(10) DEFAULT 'hi',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hospital_id, abha_id)                    -- ABHA unique per hospital
);
CREATE INDEX idx_patients_hospital ON patients(hospital_id);

-- Kiosk session (ephemeral intake session)
CREATE TABLE intake_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id),
    patient_id      UUID REFERENCES patients(id),
    session_type    VARCHAR(20) NOT NULL,           -- 'allopathic' | 'ayush' | 'both'
    status          VARCHAR(20) DEFAULT 'active',   -- active | completed | abandoned | triage_alert
    language        VARCHAR(10) NOT NULL,
    consent_granted BOOLEAN DEFAULT FALSE,
    consent_ts      TIMESTAMPTZ,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    purged_at       TIMESTAMPTZ                    -- when temp data was wiped
);
CREATE INDEX idx_sessions_hospital ON intake_sessions(hospital_id, status);
CREATE INDEX idx_sessions_patient ON intake_sessions(patient_id);

-- Clinical history responses (structured intake data)
CREATE TABLE history_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES intake_sessions(id) ON DELETE CASCADE,
    category        VARCHAR(50) NOT NULL,           -- 'chief_complaint' | 'hpi' | 'past_medical' | 'medications' | 'allergies' | 'family' | 'personal' | 'ros' | 'dashavidha'
    question_id     VARCHAR(100) NOT NULL,           -- Reference to clinical_ontology question
    question_text   TEXT NOT NULL,
    response_mode   VARCHAR(10) NOT NULL,            -- 'voice' | 'touch' | 'typed'
    raw_response    TEXT,                             -- Raw voice transcript or button label
    structured_data JSONB,                            -- Parsed/structured response
    confidence      FLOAT,                            -- ASR or parsing confidence
    answered_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_history_session ON history_entries(session_id);

-- Scanned documents
CREATE TABLE scanned_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES intake_sessions(id) ON DELETE CASCADE,
    doc_type        VARCHAR(30),                     -- 'prescription' | 'lab_report' | 'discharge_summary' | 'imaging' | 'other'
    image_url       TEXT NOT NULL,                    -- Encrypted object store URL (auto-expiring)
    ocr_raw_text    TEXT,
    extracted_data  JSONB,                            -- Structured entities (meds, labs, diagnoses)
    document_date   DATE,                             -- Extracted date from document
    confidence      FLOAT,
    scanned_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_documents_session ON scanned_documents(session_id);

-- Generated clinical summaries
CREATE TABLE clinical_summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id),
    session_id      UUID REFERENCES intake_sessions(id) ON DELETE CASCADE,
    summary_json    JSONB NOT NULL,                   -- Structured summary
    fhir_bundle     JSONB,                            -- FHIR R4 Bundle
    ayush_assessment JSONB,                           -- Dashavidha Pariksha results
    doctor_status   VARCHAR(20) DEFAULT 'pending',   -- pending | reviewed | accepted | amended | rejected
    doctor_notes    TEXT,
    reviewed_by     UUID,                             -- Doctor user ID
    reviewed_at     TIMESTAMPTZ,
    generated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_summaries_hospital ON clinical_summaries(hospital_id, doctor_status);

-- Red-flag alerts
CREATE TABLE triage_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id),
    session_id      UUID REFERENCES intake_sessions(id),
    patient_id      UUID REFERENCES patients(id),
    alert_type      VARCHAR(50) NOT NULL,             -- 'cardiac' | 'stroke' | 'respiratory' | 'anaphylaxis' | 'psychiatric'
    symptoms        JSONB NOT NULL,
    severity        VARCHAR(10) NOT NULL,              -- 'critical' | 'urgent'
    acknowledged    BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alerts_hospital ON triage_alerts(hospital_id, acknowledged);
```

**Multi-Tenancy Note:** API middleware extracts `hospital_id` from the authenticated JWT token. Every database query is automatically scoped: `WHERE hospital_id = :current_hospital_id`. A doctor at Hospital A can never see data from Hospital B — enforced at both application and database (Row Level Security) layers.

### 4.2 Redis Usage

| Key Pattern | Purpose | TTL |
| :--- | :--- | :--- |
| `session:{session_id}:state` | Current question index, accumulated answers, progress % | 30 min |
| `session:{session_id}:audio_buffer` | Temporary ASR audio chunks | 5 min |
| `kiosk:{kiosk_id}:active_session` | Which session is active on a given kiosk | 30 min |
| `doctor:queue:{dept_id}` | Sorted set of patient tokens awaiting review | 8 hours |
| `alert:{alert_id}` | Pub/Sub channel for real-time triage alerts | Until acknowledged |

---

## 5. Adapter Pattern for AI Services

Every external AI service is accessed through an abstract interface. This is the single most important architectural decision for long-term viability:

```python
# packages/api/medikiosk/adapters/asr/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ASRResult:
    text: str                    # Transcribed text
    language: str                # Detected language code
    confidence: float            # 0.0 - 1.0
    duration_ms: int             # Audio duration processed
    alternatives: list[str]      # Alternative transcriptions


class ASRAdapter(ABC):
    """Abstract interface for Automatic Speech Recognition.

    Implementations: BhashiniASR, WhisperASR, WebSpeechASR.
    Swap providers by changing config — zero business logic change.
    """

    @abstractmethod
    async def transcribe(
        self,
        audio_bytes: bytes,
        language_hint: str | None = None,
        domain: str = "medical"
    ) -> ASRResult:
        ...

    @abstractmethod
    async def is_available(self) -> bool:
        ...
```

```python
# Same pattern for LLM, OCR, TTS, ABDM:

class LLMAdapter(ABC):
    async def generate_structured(self, prompt: str, schema: dict) -> dict: ...
    async def summarize_history(self, history: dict) -> str: ...

class OCRAdapter(ABC):
    async def extract_text(self, image_bytes: bytes) -> OCRResult: ...

class TTSAdapter(ABC):
    async def synthesize(self, text: str, language: str) -> bytes: ...

class ABDMAdapter(ABC):
    async def verify_abha(self, abha_id: str) -> PatientIdentity: ...
    async def push_fhir_bundle(self, bundle: dict, consent_token: str) -> str: ...
```

---

## 6. API Design (Key Endpoints)

```yaml
# Auth & Consent
POST   /api/v1/auth/abha/verify          # Verify ABHA ID, return patient info
POST   /api/v1/auth/consent/grant         # Record patient consent

# Intake Session
POST   /api/v1/intake/sessions            # Create new intake session
GET    /api/v1/intake/sessions/{id}        # Get session state
POST   /api/v1/intake/sessions/{id}/next   # Get next question (adaptive)
POST   /api/v1/intake/sessions/{id}/answer # Submit answer (voice transcript or touch selection)

# Voice
POST   /api/v1/voice/transcribe           # Send audio chunk, get text back
POST   /api/v1/voice/synthesize            # Text to speech audio

# Documents
POST   /api/v1/documents/upload            # Upload document image
GET    /api/v1/documents/{id}/extracted     # Get extracted entities
GET    /api/v1/documents/session/{sid}/timeline  # Get chronological timeline

# Summary
POST   /api/v1/summary/generate            # Generate clinical summary for session
GET    /api/v1/summary/{id}                 # Get generated summary
GET    /api/v1/summary/{id}/fhir            # Get FHIR R4 Bundle

# Doctor
GET    /api/v1/doctor/queue                 # Get OPD patient queue
GET    /api/v1/doctor/patient/{id}/summary  # Get patient summary for review
PATCH  /api/v1/doctor/summary/{id}/review   # Accept / Amend / Reject summary

# Alerts
GET    /api/v1/alerts/active                # Get active triage alerts (WebSocket preferred)
PATCH  /api/v1/alerts/{id}/acknowledge      # Acknowledge triage alert
```

---

## 7. Real-Time Communication

```
Patient Kiosk ──── WebSocket ──── FastAPI ──── Redis Pub/Sub ──── Doctor Dashboard

Events:
├── kiosk → server: audio_chunk (streaming ASR)
├── server → kiosk: transcription_result, next_question, tts_audio
├── server → doctor: new_patient_ready, triage_alert
└── doctor → server: summary_reviewed (triggers ABDM push)
```

---

## 8. Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│ Layer 1: Network                                         │
│   • TLS 1.3 everywhere (NGINX terminates)               │
│   • CORS restricted to known kiosk/dashboard origins     │
│   • Rate limiting: 100 req/min per kiosk, 500 per doctor │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Authentication                                  │
│   • Kiosk: ABHA ID + OTP (patient) / Device token       │
│   • Doctor: Hospital SSO / JWT with role-based claims    │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Authorization                                   │
│   • RBAC: patient, doctor, nurse, admin                  │
│   • Doctor can only see patients in their dept/queue     │
│   • Patient data access requires active consent token    │
├─────────────────────────────────────────────────────────┤
│ Layer 4: Data Protection                                 │
│   • AES-256 encryption at rest (DB + Object Store)       │
│   • PHI scrubbed from all application logs               │
│   • Document images: pre-signed URLs, 1-hour expiry      │
│   • Kiosk session data: purged within 30s of completion  │
├─────────────────────────────────────────────────────────┤
│ Layer 5: Audit                                           │
│   • Every data access logged with who/when/what/why      │
│   • Consent grants/revocations are immutable audit trail │
│   • FHIR AuditEvent resources for ABDM compliance        │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Deployment Architecture (Production)

```
                    ┌─────────────────────┐
                    │   Cloud Load        │
                    │   Balancer (HTTPS)  │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │  App Pod 1 │ │  App Pod 2 │ │  App Pod 3 │
       │  FastAPI   │ │  FastAPI   │ │  FastAPI   │
       │  + Next.js │ │  + Next.js │ │  + Next.js │
       └────────────┘ └────────────┘ └────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │ PostgreSQL │ │   Redis    │ │   MinIO    │
       │  Primary   │ │  Cluster   │ │  (S3-compat│
       │  + Replica │ │            │ │   storage) │
       └────────────┘ └────────────┘ └────────────┘

       Kubernetes / Docker Swarm orchestration
       Horizontal pod autoscaling on CPU/memory
       Health checks on /api/v1/health
```

### SIH Demo Deployment (Simplified)

```bash
# Single command to run everything:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Exposes:
#   http://localhost:3000  → Kiosk UI
#   http://localhost:3001  → Doctor Dashboard
#   http://localhost:8000  → API (Swagger at /docs)
```

---

## 10. Technology Decision Matrix

| Component | Primary Choice | Fallback | Why |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | — | SSR, PWA, excellent DX, works on kiosk + tablet |
| **Styling** | TailwindCSS + shadcn/ui | — | Rapid iteration, consistent design system |
| **Backend Framework** | FastAPI (Python 3.12) | — | Async, Pydantic validation, native AI/ML integration |
| **Database** | PostgreSQL 16 | — | JSONB for FHIR, proven in healthcare |
| **Cache/Sessions** | Redis 7 | — | Ephemeral sessions, Pub/Sub for real-time |
| **Object Storage** | MinIO (dev) / S3 (prod) | Local filesystem | S3-compatible, auto-expiring pre-signed URLs |
| **ASR** | Bhashini API | OpenAI Whisper / Web Speech API | Best Indic language support, SIH-aligned |
| **TTS** | Bhashini TTS | Google TTS / Browser SpeechSynthesis | Native Indic voice quality |
| **LLM** | Google Gemini 2.0 Flash | Llama 3 via Ollama (offline) | Sub-second latency, structured JSON, large context |
| **OCR** | Gemini Vision + Google Cloud Vision | PaddleOCR | Handles handwritten prescriptions, multilingual |
| **FHIR Library** | fhir.resources (Python) | Custom FHIR builder | Validated FHIR R4 model generation |
| **ORM** | SQLAlchemy 2.0 (async) | — | Mature, async support, Alembic migrations |
| **Containerization** | Docker + docker-compose | — | Single-command deployment for demo and production |
| **CI/CD** | GitHub Actions | — | Free for open-source, standard |
