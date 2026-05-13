# Skate Math — Product Spec for Claude Code

## Overview

A mobile-first web app that helps an 11-year-old practice math facts over the summer.
Skate culture theme throughout. Two user roles: **Kid** and **Parent**.
Deployed on Vercel, data persisted in Supabase.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Backend / DB | Supabase (Postgres + Auth) |
| Hosting | Vercel |
| State | React Context + `useState` / `useReducer` |

No Redux. No unnecessary dependencies. Keep it lean.

---

## Aesthetic Direction

**Skate culture — gritty, bold, kinetic.**

- Dark backgrounds (#0d0d0d, #111) with chalk/spray-paint style typography
- Accent colors: safety orange (#FF5F1F) and electric yellow (#FFE600)
- Font pairing: a chunky display font (e.g. `Barlow Condensed` or `Black Han Sans`) for headings + `Space Mono` for numbers/scores
- Subtle grain/noise texture overlays
- Bold motion: card flips for question transitions, satisfying bounce animations on correct answers
- Streak combos use a skate trick naming system (see below)
- Mobile-first: designed for iPhone, thumb-friendly tap targets (min 48px)
- No purple gradients, no Inter, no generic AI aesthetics

---

## Authentication

Use **Supabase Auth** (email + password).

Two accounts are pre-created manually in Supabase dashboard (no self-signup needed):
- `kid` account — logs into the Game view
- `parent` account — logs into the Dashboard view

After login, redirect based on role:
- Role stored in a `profiles` table with a `role` column (`kid` | `parent`)

---

## Database Schema (Supabase / Postgres)

### `profiles`
| column | type | notes |
|---|---|---|
| id | uuid (FK → auth.users) | primary key |
| role | text | `'kid'` or `'parent'` |
| username | text | display name |

### `sessions`
| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid (FK → profiles) | |
| operation | text | `'multiply'`, `'divide'`, `'add'`, `'subtract'` |
| started_at | timestamptz | |
| ended_at | timestamptz | |
| questions_answered | int | |
| correct | int | |
| xp_earned | int | |

### `question_results`
| column | type | notes |
|---|---|---|
| id | uuid | primary key |
| session_id | uuid (FK → sessions) | |
| user_id | uuid (FK → profiles) | |
| operation | text | |
| operand_a | int | |
| operand_b | int | |
| correct | boolean | |
| response_time_ms | int | milliseconds to answer |
| answered_at | timestamptz | |

### `kid_profile`
| column | type | notes |
|---|---|---|
| user_id | uuid (FK → profiles) | primary key |
| total_xp | int | default 0 |
| current_level | int | default 1 |
| current_streak_days | int | default 0 |
| last_session_date | date | for streak tracking |
| unlocked_decks | text[] | array of deck IDs |

---

## XP & Leveling System

- Each correct answer: **+10 XP**
- Speed bonus: answer under 3s → **+5 XP**, under 5s → **+2 XP**
- Streak combo multiplier (consecutive correct answers within a session):
  - 3-in-a-row: **"Kickflip"** — 1.5× XP
  - 6-in-a-row: **"Heelflip"** — 2× XP
  - 10-in-a-row: **"900"** — 3× XP
  - Combo resets on any wrong answer

**Level thresholds** (total XP):

| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Beginner |
| 2 | 200 | Poser |
| 3 | 500 | Street Rat |
| 4 | 1000 | Park Regular |
| 5 | 2000 | Tech Skater |
| 6 | 3500 | Sponsored |
| 7 | 5500 | Pro |
| 8 | 8000 | Legend |

---

## Unlockable Deck Skins

Decks are purely cosmetic — SVG illustrations shown during gameplay.
Unlock thresholds (total XP):

| Deck ID | Name | Unlock XP |
|---|---|---|
| `default` | Scratched Wood | 0 (default) |
| `flames` | Flame Deck | 200 |
| `galaxy` | Galaxy Deck | 500 |
| `checker` | Checkerboard | 1000 |
| `neon` | Neon Spray | 2000 |
| `gold` | Gold Foil | 5500 |

Deck SVGs can be simple geometric/illustrated skateboard shapes with distinct color schemes. Implement as React SVG components.

---

## Kid Game View

### Session Start Screen
- Select operation: **×  ÷  +  −** (large tap targets)
- Show current level, XP, streak, and active deck
- "DROP IN" button to start

### Gameplay Loop

Each session = **20 questions**.

- Operand ranges scale by level for Multiply / Divide:
  - Level 1 (Beginner): 1–5 × 1–9 (max answer 45)
  - Level 2: 1–7 × 1–7 (max answer 49)
  - Level 3: 1–9 × 1–9 (max answer 81)
  - Level 4: 1–10 × 1–10 (max answer 100)
  - Level 5+: 1–12 × 1–12 (max answer 144)
  - Add / Subtract: 1–20 operands, no negative results (fixed)
- Question display: large, centered, bold — e.g. `7 × 8 = ?`
- Answer input: **number pad** (custom, big buttons — no native keyboard)
- Timer bar at top: counts down from **20 seconds** per question
  - If timer expires → marked wrong, next question
- On correct answer: bounce/flash animation + skate trick name popup if combo active
- On wrong answer: shake animation, brief flash of correct answer (1s)
- Running score / combo shown at top

### Session End Screen
- XP earned this session (with breakdown: base + speed bonus + combo)
- Accuracy % and questions answered
- Level-up animation if threshold crossed
- Deck unlock notification if newly unlocked
- "SKATE AGAIN" and "GO HOME" buttons

---

## Spaced Repetition (Weak Facts)

Track per-fact accuracy in `question_results`. A fact (`operand_a`, `operand_b`, `operation`) is **weak** if:
- Answered at least 5 times AND
- Accuracy < 70% OR average response time > 6000ms

Weak facts are surfaced **3× more frequently** during question selection (weighted random).

---

## Parent Dashboard View

Mobile-friendly read-only dashboard. Pulls data from Supabase.

### Sections

**Overview Card**
- Kid's current level + title
- Total XP
- Current daily streak
- Total sessions played

**Accuracy by Operation** (bar chart)
- One bar per operation showing overall accuracy %
- Use `recharts` library

**Recent Sessions** (last 7)
- Date, operation, score, XP earned — displayed as a scrollable card list

**Weak Facts Panel**
- List of facts where accuracy < 70%
- Grouped by operation
- Shows accuracy % and avg response time

**Session History Chart**
- Line chart: XP earned per session over last 30 days
- Use `recharts`

---

## Routing

```
/                → redirect based on role after auth check
/login           → Login page
/game            → Session start screen (kid only)
/game/play       → Active gameplay (kid only)
/game/results    → Session results (kid only)
/dashboard       → Parent dashboard (parent only)
```

Route guards: redirect to `/login` if not authenticated. Redirect to correct view based on role.

---

## Project Structure

```
skate-math/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── .env.example              # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── src/
│   ├── main.jsx
│   ├── App.jsx               # Router + AuthProvider wrapper
│   ├── supabaseClient.js     # createClient() singleton
│   ├── context/
│   │   └── AuthContext.jsx   # user, role, loading
│   ├── hooks/
│   │   ├── useKidProfile.js
│   │   └── useSessionData.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── GameHome.jsx
│   │   ├── GamePlay.jsx
│   │   ├── GameResults.jsx
│   │   └── ParentDashboard.jsx
│   ├── components/
│   │   ├── NumberPad.jsx
│   │   ├── TimerBar.jsx
│   │   ├── ComboPopup.jsx
│   │   ├── DeckDisplay.jsx
│   │   ├── XPBar.jsx
│   │   └── decks/
│   │       ├── DefaultDeck.jsx
│   │       ├── FlamesDeck.jsx
│   │       └── ...etc
│   └── utils/
│       ├── xp.js             # XP calculation, level lookup
│       ├── questions.js      # Question generation + weak fact weighting
│       └── streaks.js        # Daily streak logic
```

---

## Environment Variables

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Vercel Deployment

- Standard Vite SPA deployment on Vercel
- Add `vercel.json` with rewrite rule so React Router works:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- Set env vars in Vercel project settings

---

## Implementation Order for Claude Code

1. **Scaffold** — Vite + React + Tailwind + React Router + Supabase client
2. **Auth** — Login page, AuthContext, role-based routing
3. **Database** — Create all tables in Supabase with RLS policies
4. **Game core** — Question generation, number pad, timer, session state
5. **XP + combos** — Scoring logic, combo detection, level system
6. **Session persistence** — Write session + question_results to Supabase on completion
7. **Deck system** — SVG deck components + unlock logic
8. **Animations** — Correct/wrong feedback, level-up, combo popups
9. **Parent dashboard** — Charts, weak facts, session history
10. **Polish** — Skate aesthetic, fonts, grain texture, mobile tuning
11. **Deploy** — Vercel config + env vars

---

## Notes

- All Supabase queries should use RLS. Kid can only read/write their own rows. Parent can read kid rows (set up via RLS policy using role from `profiles`).
- The number pad must be custom (not native mobile keyboard) — native keyboard causes layout jumps on iOS.
- Prioritize feel on iPhone: 60fps animations, no layout shift, fast Supabase queries.
- Keep bundle small — no heavy dependencies beyond `recharts` and `@supabase/supabase-js`.
