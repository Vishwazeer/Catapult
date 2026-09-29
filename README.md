# 🚀 Catapult — AI-Powered Real Estate Lead Prioritization & Sales Intelligence

An AI-powered web platform that helps real estate sales teams **prioritize inbound leads**, **extract deep buyer intent**, **simulate customer sales calls**, and **manage property pipelines** — wrapped in a warm, editorial design system.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-orange?logo=google)
![Groq](https://img.shields.io/badge/Groq_Llama_3.3-Chat-purple)

---

## 🎯 What It Does

1. **Lead Intake** — 6-step animated intake form capturing budget, location, BHK, loan readiness, credit score, amenity preferences, deal-breakers, and freeform customer voice message.
2. **AI Intent Analysis** — Google Gemini 2.5 Flash analyzes lead data and returns structured JSON: quality score (0–100), intent tag (Hot/Warm/Cold), key requirements, objections, recommended next action, draft response, and call prep questions.
3. **Priority Dashboard & Views** — Toggle between **List View** and **Card View** (Kanban layout sorted by score). Search, filter by city or property type, and track client status.
4. **Lead Chat Assistant** — Context-aware streaming chat powered by Groq (Llama 3.3 70B), pre-loaded with full lead details and AI analysis. Draft emails, strategize objections, and craft customized pitch points.
5. **🔥 Customer AI Simulator** *(Roleplay Feature)* — Interactive sales call simulator where an AI acts as the specific lead persona (incorporating their exact budget, location preferences, and objections) so salespeople can practice mock sales calls in real time.
6. **Deal Phases Pipeline** — Manage lead progression through pipeline stages (`Incoming`, `Contacted`, `Site Visit`, `Negotiation`, `Closed Won`, `Closed Lost`).
7. **Property Database** — Searchable catalog of properties across major Indian cities (Gurugram, Noida, Mumbai, Bangalore, Hyderabad, Pune) with filterable specs and instant property modal addition.
8. **Insights & Nudge Center** — High-level conversion metrics, intent distribution charts, and bulk AI re-analysis tools to re-engage cold or stagnant leads.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App Router                           │
├─────────────┬─────────────┬─────────────┬───────────────┬──────────────┤
│  Dashboard  │ Lead Intake │ Lead Detail │   Simulator   │  Properties  │
│  (page.tsx) │(multi-step) │ (analysis & │(call-prep AI) │  Database    │
│             │             │   chat)     │               │              │
├─────────────┴─────────────┴─────────────┴───────────────┴──────────────┤
│                            API Routes                                  │
│  /api/leads     /api/leads/[id]           /api/leads/[id]/simulate     │
│  /api/properties /api/leads/[id]/reanalyze /api/leads/[id]/chat        │
├────────────────────────────────────────────────────────────────────────┤
│                            AI Layer                                    │
│  ┌─────────────────────────────┐      ┌─────────────────────────────┐  │
│  │     Gemini 2.5 Flash        │      │    Groq Llama 3.3 70B       │  │
│  │ • Lead Intent Scoring       │      │ • Real-time Lead Chat       │  │
│  │   (generateObject + Zod)    │      │   (streamText)              │  │
│  │ • Customer AI Simulator     │      │                             │  │
│  │   (streamText)              │      │                             │  │
│  └─────────────────────────────┘      └─────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                       Neon Postgres + Drizzle ORM                      │
│     leads  │  leadAnalyses  │  chatMessages  │  properties             │
└────────────────────────────────────────────────────────────────────────┘
```

### Multi-Model Strategy

| Task | Model | Reason |
|------|-------|--------|
| **Lead Scoring & Analysis** | Gemini 2.5 Flash | `generateObject` with strict Zod schema for guaranteed structured JSON output |
| **Real-time Lead Chat** | Groq Llama 3.3 70B | Ultra-low latency streaming (<200ms TTFB) for responsive conversational assistance |
| **Customer AI Simulator** | Gemini 2.5 Flash | Evaluates lead persona details andStreams natural customer responses for sales roleplay |

---

## 🎭 Customer AI Simulator

Designed to solve a major real-estate sales challenge:

> **Problem:** Sales representatives often hesitate or lose high-value leads on initial phone calls due to unhandled objections or lack of practice.
>
> **Solution:** An interactive **Customer AI Simulator** where Gemini assumes the persona of the lead (e.g., *Vikram Malhotra, looking for a 4BHK in Gurugram under ₹4.5 Cr, concerned about high maintenance costs*). The salesperson can practice pitch lines, answer simulated objections, and receive immediate AI feedback.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **AI Engine**: Vercel AI SDK (`generateObject`, `streamText`)
- **LLM Providers**: Google Gemini 2.5 Flash, Groq Cloud (Llama 3.3 70B)
- **Database**: Neon Serverless Postgres + Drizzle ORM
- **UI & Animation**: Tailwind CSS, Framer Motion, Lucide Icons
- **Validation**: Zod Schemas
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Neon Postgres Connection URL ([neon.tech](https://neon.tech))
- Google AI API Key ([aistudio.google.com](https://aistudio.google.com))
- Groq Cloud API Key ([console.groq.com](https://console.groq.com))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Vishwazeer/Catapult.git
cd Catapult

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
```

Set variables in `.env`:
```env
DATABASE_URL=postgresql://...         # Neon Postgres connection string
GOOGLE_GENERATIVE_AI_API_KEY=...      # Google AI Studio key
GROQ_API_KEY=...                      # Groq Cloud key
```

```bash
# 4. Push database schema
npx drizzle-kit push

# 5. Seed sample property database
npx tsx src/db/seed.ts

# 6. Start development server
npm run dev
```

App available at `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── leads/                   # CRUD + AI analysis
│   │   │   └── [id]/
│   │   │       ├── reanalyze/       # AI re-scoring
│   │   │       └── simulate/        # Customer simulator stream
│   │   └── properties/              # Property database endpoints
│   ├── call-prep/                   # Customer Simulator route
│   ├── insights/                    # Analytics & conversion metrics
│   ├── leads/
│   │   ├── [id]/                    # Lead detail page
│   │   └── new/                     # 6-step lead intake form
│   ├── phases/                      # Deal phases pipeline view
│   ├── properties/                  # Property database browser
│   └── page.tsx                     # Main Dashboard (List & Card view)
├── components/
│   ├── add-property-modal.tsx       # Property creation modal
│   ├── analysis-display.tsx         # Score gauge & structured AI breakdown
│   ├── customer-simulator.tsx       # AI persona call roleplay interface
│   ├── lead-card.tsx                # Score tag card component
│   ├── lead-chat.tsx                # Streaming assistant chat
│   ├── lead-form.tsx                # 6-step animated intake form
│   ├── lead-selector-layout.tsx     # Reusable split-panel layout
│   ├── phase-selector.tsx           # Deal phase dropdown
│   └── sidebar.tsx                  # Navigation sidebar
├── db/
│   ├── schema.ts                    # Drizzle ORM schema
│   ├── index.ts                     # Database connection
│   └── seed.ts                      # 35+ Indian property seed data
└── lib/
    ├── ai/
    │   ├── analyze-lead.ts          # Gemini structured analysis
    │   ├── chat.ts                  # Groq streaming chat
    │   ├── customer-simulator.ts    # AI persona simulator engine
    │   └── schemas.ts               # Zod schemas
    ├── constants.ts                 # Cities, options, amenities
    └── utils.ts                     # Currency & score formatting
```

---

## 📊 AI Usage Disclosure

This application uses AI models as core product components:

| Feature | Model | Method | What It Does |
|---------|-------|--------|-------------|
| **Lead Scoring & Analysis** | Gemini 2.5 Flash | `generateObject` + Zod | Structured intent extraction: score (0–100), tag, key requirements, objections, suggested response, call prep questions |
| **Lead Chat Assistant** | Llama 3.3 70B via Groq | `streamText` | Context-aware streaming assistant grounded in customer voice data & lead analysis |
| **Customer AI Simulator** | Gemini 2.5 Flash | `streamText` | Interactive customer persona roleplay simulator for sales call practice |

All AI outputs are strictly typed via Zod schemas or streamed directly to the client. No fine-tuned models — 100% powered via high-performance APIs.

---

## 🎨 Design System

Built on a warm, editorial design language:
- **Canvas**: `#F4EEE8` Warm Editorial Paper Background
- **Accent**: `#059669` Emerald Green (Primary actions & high intent highlights)
- **Cards**: Pure White (`#FFFFFF`) with `rounded-3xl` and `#EADFD5` hairline borders
- **Typography**: Inter (bold display headings) & JetBrains Mono (labels, badges, data)

---

## 📄 License

MIT
