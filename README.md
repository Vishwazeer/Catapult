# 🚀 Catapult — AI-Powered Real Estate Lead Prioritization

An AI-powered web app that helps real-estate salespersons **prioritize inbound leads**, **analyze customer intent**, and **prepare for calls** — all in one dark-themed, premium dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-orange?logo=google)
![Groq](https://img.shields.io/badge/Groq_Llama_3.3-Chat-purple)

## 🎯 What It Does

1. **Lead Intake** — A detailed, multi-step animated form captures every data point: budget, location, BHK, loan readiness, credit score, amenity preferences, deal-breakers, and a freeform message
2. **AI Analysis** — Google Gemini analyzes the lead and returns structured output: summary, intent, score (0-100), tag (hot/warm/cold), objections, recommended next action, suggested response, and call prep questions
3. **Priority Dashboard** — Leads displayed in a Kanban-style board (Hot / Warm / Cold), sorted by score. Search, filter, toggle board/list view
4. **Lead Chat** — Context-aware AI chat (Groq Llama 3.3 70B) grounded in lead data and analysis. Ask follow-up questions, draft emails, strategize
5. **🔥 AI Call Prep** *(Custom Feature)* — During a live call, type natural queries like `"location Gurugram budget 1 CR"` and get matching properties from the database + AI-powered recommendations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 15 App Router             │
├──────────┬──────────┬───────────┬───────────────────┤
│ Dashboard│ Lead Form│Lead Detail│  Properties Page   │
│ (page)   │(multi-   │(tabs:     │  (search/filter)   │
│          │ step)    │analysis,  │                     │
│          │          │chat, prep)│                     │
├──────────┴──────────┴───────────┴───────────────────┤
│                   API Routes                         │
│  /api/leads  /api/leads/[id]  /api/leads/[id]/chat  │
│  /api/call-prep  /api/properties                     │
├──────────────────────────────────────────────────────┤
│              AI Layer                                │
│  ┌─────────────────┐  ┌────────────────┐            │
│  │ Gemini 2.5 Flash │  │  Groq Llama    │            │
│  │ • Lead Analysis  │  │  3.3 70B       │            │
│  │   (generateObject)│  │  • Lead Chat   │            │
│  │ • Call Prep      │  │    (streamText) │            │
│  │   (streamText)   │  │                │            │
│  └─────────────────┘  └────────────────┘            │
├──────────────────────────────────────────────────────┤
│          Neon Postgres + Drizzle ORM                 │
│  leads │ leadAnalyses │ chatMessages │ properties    │
└──────────────────────────────────────────────────────┘
```

### Why Two LLMs?

| Task | Model | Reason |
|------|-------|--------|
| Lead Analysis | Gemini 2.5 Flash | `generateObject` with Zod schema — structured JSON output with guaranteed shape |
| Lead Chat | Groq Llama 3.3 70B | Fastest streaming inference — sub-200ms TTFB for real-time chat UX |
| Call Prep | Gemini 2.5 Flash | Needs property DB context injection + structured recommendations |

This isn't a demo gimmick — each model is chosen for a specific strength. Gemini excels at structured extraction, Groq at raw streaming speed.

## 🔥 Custom Feature: AI Call Prep

The "own feature" — designed for a real workflow:

**Problem:** During a live call, a salesperson needs to check property availability and pricing *instantly*. Switching between CRM, spreadsheets, and chat tools loses the customer's attention.

**Solution:** A split-panel interface where:
- **Left panel**: AI chat that understands natural queries (`"3 BHK in Noida under 80L"`)
- **Right panel**: Real-time property matches from the database
- Pre-call checklist of AI-generated questions
- AI recommends the best property match with reasoning

The chatbot parses location, budget, BHK, and property type from natural language, queries the database, and feeds matching properties into the LLM context for intelligent recommendations.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **AI**: Vercel AI SDK (`generateObject`, `streamText`)
- **LLMs**: Google Gemini 2.5 Flash, Groq Llama 3.3 70B
- **Database**: Neon Postgres (serverless) + Drizzle ORM
- **Styling**: Tailwind CSS + Framer Motion animations
- **Validation**: Zod schemas for AI output
- **Deploy**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Neon Postgres database ([neon.tech](https://neon.tech) — free tier works)
- Google AI API key ([aistudio.google.com](https://aistudio.google.com))
- Groq API key ([console.groq.com](https://console.groq.com))

### Setup

```bash
# Clone
git clone https://github.com/Vishwazeer/Catapult.git
cd Catapult

# Install
npm install

# Environment
cp .env.example .env
# Fill in your keys in .env

# Push schema to database
npx drizzle-kit push

# Seed property database (35 Indian properties)
npx tsx src/db/seed.ts

# Run dev server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://...         # Neon Postgres connection string
GOOGLE_GENERATIVE_AI_API_KEY=...      # Google AI Studio API key
GROQ_API_KEY=...                      # Groq Cloud API key
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── leads/          # CRUD + AI analysis
│   │   ├── call-prep/      # Property search + AI prep
│   │   └── properties/     # Property database API
│   ├── leads/
│   │   ├── new/            # Multi-step lead form
│   │   └── [id]/           # Lead detail (analysis + chat + call prep)
│   ├── properties/         # Property database browser
│   └── page.tsx            # Dashboard (kanban board)
├── components/
│   ├── sidebar.tsx         # Collapsible navigation
│   ├── lead-form.tsx       # 6-step animated intake form
│   ├── lead-card.tsx       # Lead card with score + tag
│   ├── analysis-display.tsx # AI analysis sections + score gauge
│   ├── lead-chat.tsx       # Streaming chat interface
│   └── call-prep.tsx       # Split-panel call prep + property search
├── db/
│   ├── schema.ts           # Drizzle schema (4 tables)
│   ├── index.ts            # Lazy DB connection
│   └── seed.ts             # 35 Indian properties
└── lib/
    ├── ai/
    │   ├── schemas.ts      # Zod schema for lead analysis
    │   ├── analyze-lead.ts # Gemini generateObject
    │   ├── chat.ts         # Groq streamText
    │   └── call-prep.ts    # Property search + Gemini streaming
    ├── constants.ts        # Form options, cities, amenities
    └── utils.ts            # Formatting, colors, classnames
```

## 📊 AI Usage Disclosure

This application uses AI models as core product components:

| Feature | Model | Method | What It Does |
|---------|-------|--------|-------------|
| Lead Scoring | Gemini 2.5 Flash | `generateObject` + Zod | Structured analysis: score, tag, intent, requirements, objections, suggested response, call prep questions |
| Lead Chat | Llama 3.3 70B via Groq | `streamText` | Context-aware streaming chat grounded in lead data + analysis |
| Call Prep | Gemini 2.5 Flash | `streamText` | Property recommendations based on DB results + lead requirements |

All AI outputs are validated through Zod schemas (lead analysis) or streamed directly (chat). No fine-tuned models — all via API.

## 🎨 Design

Dark theme inspired by Linear's design language:
- Surface ladder: `#0a0a0b` → `#111213` → `#1a1b1d`
- Teal accent: `#2dd4bf` (primary actions)
- Typography: Cinzel (display), Inter (body), JetBrains Mono (data)
- Framer Motion animations throughout
- Glass-card components with hairline borders

## License

MIT
