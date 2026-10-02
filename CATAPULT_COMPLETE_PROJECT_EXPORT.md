# 🚀 CATAPULT — COMPLETE PROJECT EXPORT & CHAT HISTORY

This document serves as a comprehensive, self-contained export of the entire **Catapult** application development lifecycle, user requests, code architecture, design systems, AI implementations, and deployment history. It is structured specifically to be fed directly to any AI LLM model (Claude, GPT-4, Gemini, DeepSeek, etc.) to give full context of the project.

---

## 1. 📌 PROJECT EXECUTIVE SUMMARY

- **Application Name**: Catapult (Real Estate Lead Intelligence & Prioritization Platform)
- **GitHub Repository**: [https://github.com/Vishwazeer/Catapult](https://github.com/Vishwazeer/Catapult)
- **Live Vercel URL**: `https://catapult-azure.vercel.app` (or custom Vercel domain)
- **Tech Stack**: Next.js 15 (App Router, React 19, TypeScript), Tailwind CSS, Framer Motion, Drizzle ORM, Neon Serverless Postgres, Vercel AI SDK, Google Gemini 2.5 Flash, Groq Llama 3.3 70B.

---

## 2. 🎨 DESIGN SYSTEM & TYPOGRAPHY SPECIFICATIONS

- **Background Canvas**: `#F4EEE8` Warm Editorial Paper Canvas
- **Primary Brand Accent**: `#059669` Emerald Green (Pill toggles, primary buttons, high-intent score badges)
- **Secondary Surfaces**: Pure White (`#FFFFFF`) rounded 3xl cards with `#EADFD5` hairline borders
- **Typography Hierarchy**:
  - **Display & Section Headings**: `Inter` font-black (`font-black tracking-tight text-stone-900`)
  - **Data Badges, Micro Labels, Technical Details**: `JetBrains Mono` (`font-mono text-xs uppercase tracking-wider text-stone-600`)
  - **Body Text**: `Inter` font-sans text-stone-700
- **Theme Constraint**: Kept strictly green/emerald (`#059669`), explicitly avoiding terracotta red accents.

---

## 3. 🤖 MULTI-MODEL AI LAYER ARCHITECTURE

| Feature Component | AI Model | API Method | Purpose & Responsibility |
|---|---|---|---|
| **Lead Scoring & Intent Extraction** | Google Gemini 2.5 Flash | `generateObject` + Zod Schema | Analyzes 6-step lead form submissions. Returns quality score (0–100), tag (hot/warm/cold), intent, objections, recommended action, draft response, and call prep questions. |
| **Real-time Lead Chat Assistant** | Groq Llama 3.3 70B | `streamText` | Sub-200ms TTFB streaming chat assistant pre-loaded with full lead details and AI analysis to answer follow-up sales queries. |
| **Customer AI Simulator** | Google Gemini 2.5 Flash | `streamText` | Interactive WhatsApp-style sales roleplay simulator where Gemini acts as the lead persona (incorporating budget, location, and objections) for mock call practice. |
| **Lead Re-Analyzer & Nudges** | Google Gemini 2.5 Flash | `generateObject` + Zod Schema | Dynamic re-scoring of leads based on simulated salesperson-customer interactions or bulk follow-ups. |

---

## 4. 📜 CHRONOLOGICAL USER REQUESTS & IMPLEMENTATION LOG

### Request 1: View Mode Switcher Overhaul
- **User Request**: "Make this card - list toggle more wider and bold and visible."
- **Implementation**: Redesigned `/` Dashboard view switcher into a wide, bold, pill-shaped toggle container with `List View` and `Card View` text buttons. Updated table headers and client rows to editorial typography.

### Request 2: Insights Page Refinement
- **User Request**: "Remove priority mix from insights section"
- **Implementation**: Removed the 'Priority mix' card section from `src/app/insights/page.tsx`.

### Request 3: Phase Dropdown Overflow Fix
- **User Request**: "The dropdown of phases is hidden inside the name dropdown so fix that."
- **Implementation**: Fixed overflow clipping in `src/app/phases/page.tsx` by removing `overflow-hidden` from client row wrappers and setting `PhaseSelector` dropdown menu z-index to `z-[999]`.

### Request 4: Lead Form Design System Overhaul
- **User Request**: "The font language of the lead form is still the same fix it."
- **Implementation**: Completely updated `src/components/lead-form.tsx` across all 6 steps. Applied `Inter font-black text-stone-900` headings, `JetBrains Mono` uppercase labels, warm paper canvas (`#F4EEE8`), rounded 3xl cards, and `#059669` emerald green inputs, pills, option cards, and buttons.

### Request 5: Step Indicator Alignment Fix
- **User Request**: "Fix the messed up allignment in the form" (attached image showing label collisions).
- **Implementation**: Converted step indicator container in `src/components/lead-form.tsx` to `grid grid-cols-6 gap-1 w-full text-center`. Added `shortTitle` items (`Personal`, `Property`, `Budget`, `Timeline`, `Requirements`, `Voice`) with `truncate` so labels never collide.

### Request 6: Property Database Design System Update
- **User Request**: "Font language change of property database and implement new one"
- **Implementation**: Updated `src/app/properties/page.tsx` and `src/components/add-property-modal.tsx` to match editorial typography, Inter bold headings, JetBrains Mono tags, and emerald green action buttons.

### Request 7: Lead Selection Panel Height Fix
- **User Request**: "No need for the scroll bar you can take the lead entries a few more boxes futher down till where the ai summary content is showing"
- **Implementation**: Removed fixed `h-[650px]` and `overflow-y-auto` from `src/components/lead-selector-layout.tsx`. Left sidebar container now uses `h-fit` and stretches down naturally alongside the AI summary content.

### Request 8: Git Remote & GitHub Push
- **User Request**: "push on github ... https://github.com/Vishwazeer/Catapult"
- **Implementation**: Configured remote `origin` to `https://github.com/Vishwazeer/Catapult.git`, staged all modified/untracked files, committed, and pushed `main` branch to GitHub.

### Request 9: README Revision
- **User Request**: "we had removed call prep. You'd want to revise the whole readme file again. and fix with necessary updates"
- **Implementation**: Updated `README.md` to replace old Call Prep references with **Customer AI Simulator**, documented the 6-step intake form, deal phases pipeline, property database, multi-model AI disclosure table, and Vercel deployment guide.

### Request 10: Vercel Deployment Instructions & Troubleshooting
- **User Request**: "Give me instructions on how to deploy this on vercel" and "What are these error are they solvable?"
- **Implementation**: Explained Vercel setup (`DATABASE_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`), verified successful build status (`Deployment completed`), and explained harmless build logs.

### Request 11: Animated Brand Welcome Loader
- **User Request**: "On first time visit or site refres I want a logo animation that is sort of a welcome screen(loading) that appears before the site completely load... make that slightly bigger logo font... keep it there for atleast 3-4 secs"
- **Implementation**: Created `src/components/welcome-loader.tsx` ("use client") and integrated it in `src/app/layout.tsx`. Styled upscaled launcher icon (`w-36 h-36`), glowing emerald aura ring, `Catapult` heading in `text-6xl sm:text-7xl font-black`, `PRO` badge, `REAL ESTATE LEAD INTELLIGENCE` tagline, and animated progress bar over 3.5s duration on site load/refresh.

### Request 12: Branch Creation & Minimized Nudge Center
- **User Request**: "Create a branch named changes : In there change this- keep the default AI Follow-up Nudge Center minimized as a dropdown, do not change anything in main branch ... Now merge this change with main"
- **Implementation**:
  1. Created branch `changes` (`git checkout -b changes`).
  2. Updated `src/components/bulk-nudge-section.tsx` (`useState(false)`) to minimize accordion by default.
  3. Pushed branch `changes` to GitHub.
  4. Switched back to `main`, merged `changes` into `main`, and pushed `main` to GitHub.

### Request 13: GitHub Metadata & Description
- **User Request**: "Give github description"
- **Implementation**: Provided short repository description (under 350 chars) and relevant topic tags (`nextjs`, `typescript`, `tailwindcss`, `gemini-ai`, `groq`, `drizzle-orm`, `neon-database`, `vercel`, `real-estate`, `ai-agent`).

---

## 5. 📁 KEY FILE PATHS & DIRECTORY STRUCTURE

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
│   ├── layout.tsx                   # Root layout with WelcomeLoader
│   └── page.tsx                     # Main Dashboard (List & Card view)
├── components/
│   ├── add-property-modal.tsx       # Property creation modal
│   ├── analysis-display.tsx         # Score gauge & structured AI breakdown
│   ├── bulk-nudge-section.tsx       # AI Follow-up Nudge Center (collapsible)
│   ├── customer-simulator.tsx       # AI persona call roleplay interface
│   ├── lead-card.tsx                # Score tag card component
│   ├── lead-chat.tsx                # Streaming assistant chat
│   ├── lead-form.tsx                # 6-step animated intake form
│   ├── lead-selector-layout.tsx     # Reusable split-panel layout
│   ├── phase-selector.tsx           # Deal phase dropdown (z-[999])
│   ├── sidebar.tsx                  # Navigation sidebar
│   └── welcome-loader.tsx           # 3.5s brand welcome splash screen
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

## 6. 🛠️ ENVIRONMENT VARIABLES & RUNTIME CONFIGURATION

```env
DATABASE_URL=postgresql://...         # Neon Postgres connection string
GOOGLE_GENERATIVE_AI_API_KEY=...      # Google AI Studio API key
GROQ_API_KEY=...                      # Groq Cloud API key
```

---

*End of Export Document. This file contains complete context for feeding into any AI LLM.*
