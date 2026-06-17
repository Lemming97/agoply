# Agoply

**Experience real-time investing through learning & play.**

Agoply is a gamified investment education app built for students and beginners (ages 14–25). It combines a structured lesson curriculum, interactive mini-games, drag-and-drop exercises, flashcard study, a virtual portfolio simulator, and a bridge to real brokers — all in one progressive learning experience that rewards progress with XP.

---

## Features

### Learn — Structured Curriculum

Work through a locked curriculum of 7 investment levels. Each level contains sub-lessons with rich inline content, tappable glossary terms, a drag-and-drop sorting exercise, an embedded interactive mini-game, and a multiple-choice quiz. Completing a level unlocks that asset class in the Simulator.

| Level | Topic | Covers |
|-------|-------|--------|
| 1 | Bonds | Yield, duration, credit ratings, interest rate risk |
| 2 | Stocks | P/E ratios, dividends, market cap, EPS |
| 3 | Crypto | Blockchain, Bitcoin, Ethereum, volatility |
| 4 | Forex | Currency pairs, exchange rates, macro drivers |
| 5 | Commodities | Gold, oil, agriculture, futures |
| 6 | ETFs | Index funds, passive investing, expense ratios |
| 7 | Mutual Funds | Active management, NAV, load fees, fund selection |
| 8 | Topicality ✦ | AI-generated lessons from live market events *(coming soon)* |

**Sub-lesson features:**
- Inline glossary terms (tap to reveal definition + save to My Glossary)
- Bold keyword highlighting, callout blocks, and important flags
- Progress bar showing position within the level
- Embedded drag-and-drop sorting exercise per lesson
- Embedded mini-game behind a "Try It Yourself" divider
- Mark Complete flow with XP award toast

---

### Mini-Games — Learn by Doing

Seven interactive mini-games, one per level (plus standalone access from the Games tab). Each game teaches a core financial concept through hands-on interaction.

| Game | Level | Mechanic |
|------|-------|----------|
| **Yield Calculator** | Bonds | Drag an interest rate slider; watch bond price move in real time with a live area chart and insight callout |
| **Portfolio Builder** | Stocks | Pick 3 stocks from a roster, allocate % with auto-cap sliders, see simulated 1-year returns in a BarChart + PieChart |
| **Crypto Rollercoaster** | Crypto | Manual day-advance BTC trading game — buy/sell at the right moment across 20 days; chart annotations mark every trade |
| **Currency Trader** | Forex | Run an airport currency booth across 5 rounds; set exchange rates, see profit/loss per customer |
| **Oil Baron** | Commodities | Manage 1–10 oil wells across 6 rounds; supply/demand price mechanic + pre-defined market events (OPEC cuts, shale booms) |
| **Fee Impact Calculator** | ETFs | Four expense-ratio sliders; dual LineChart over 20 years; hero "You lost €X,XXX to fees" stat |
| **Fee Destroyer** | Mutual Funds | HTML Canvas arcade shooter — block falling fee bullets with a shield to protect your portfolio; 3 rounds of increasing difficulty with countdown overlays and between-round comparison cards |

**Shared game patterns:**
- How to Play onboarding card before every game
- XP awarded once on completion (persisted to localStorage)
- Play Again resets without re-awarding XP
- Recharts result charts with benchmark comparisons
- Educational insight callout at the end of every game

---

### Drag-and-Drop Exercises

10 sorting exercises embedded in lessons and accessible standalone from the level detail pages. Users drag items into correct order (e.g. rank assets by risk, sequence an investment process). Built with `@dnd-kit`.

- Grip-handle drag with per-item correct/wrong feedback
- Correct order revealed on failure
- First-try vs retry XP rewards (+20 first try, +5 on retry)
- Available across Levels 1, 2, 3, 6, and 7

---

### Flashcard Study Mode

Launch from My Glossary (FAB button). Study any saved term or all terms by level.

- Swipe left/right or use keyboard (arrow keys / space) to flip and advance
- First-try vs review-again tracking per session
- Completion screen with score summary and XP award
- Scope picker: study all terms or filter by level

---

### My Glossary

Save any tappable term from any lesson. Browse saved terms grouped by level, search by keyword.

- Terms saved with level context and timestamp
- Remove individual terms
- Launch flashcard study from within the glossary

---

### Simulate — Virtual Portfolio

Practice with €1,000 of virtual cash. Browse a live-style market across all unlocked asset classes.

- Buy and sell assets with a configurable amount input
- Portfolio performance tracked on an interactive Recharts line chart (1D / 1W / 1M / 1Y views)
- Weekly leaderboard against other students
- Assets locked until the corresponding level is completed in Education

---

### Invest — Bridge to Real Markets

Analyse your simulation behaviour and take the next step into real investing.

- Risk profile calculated from simulator activity (conservative / balanced / growth)
- Recommended asset allocation (stocks / bonds / alternatives %) based on risk profile
- Broker comparison cards: Revolut, eToro, Trade Republic, BNP Paribas — with fees, minimums, and strengths
- Yahoo Finance-powered search: look up any stock, ETF, or crypto in real time

---

### XP & Progression System

- XP earned for completing sub-lessons, quizzes, drag-and-drop exercises, mini-games, and flashcard sessions
- Completed levels, sub-lessons, and games persisted to localStorage
- XP awarded only once per item (no grinding)
- Level locking enforces a learning sequence — Simulator assets unlock as levels complete
- Games tab shows locked/unlocked/completed state for every game

---

## Tech Stack

| Layer | Library / Tool |
|-------|---------------|
| Framework | React 19 + Vite 8 + TypeScript 6 |
| UI Components | MUI v9 (Material UI) |
| Icons | Tabler Icons (`@tabler/icons-react` v3.44.0) |
| Charts | Recharts v3 |
| Drag-and-drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Canvas games | HTML Canvas + `requestAnimationFrame` (no extra lib) |
| Animations | Lottie React |
| Routing | React Router DOM v7 |
| Styling | MUI `sx` prop + CSS custom properties |
| Persistence | `localStorage` (no backend) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

---

## Project Structure

```
src/
├── components/
│   ├── games/               # Mini-game components (one per level)
│   │   ├── BondsYieldCalculator.tsx
│   │   ├── StocksPortfolioBuilder.tsx
│   │   ├── CryptoRollercoaster.tsx
│   │   ├── CurrencyTrader.tsx
│   │   ├── OilBaron.tsx
│   │   ├── ETFsFeeCalculator.tsx
│   │   └── FeeDestroyer.tsx
│   └── DragDropGame.tsx     # Shared drag-and-drop exercise component
├── data/
│   ├── gameData.ts          # Curriculum content, levels, glossary, quiz questions
│   └── dragDropExercises.ts # 10 sorting exercises
├── hooks/
│   ├── useGameState.ts      # XP, progress, completions (localStorage)
│   └── useDragDropState.ts  # Drag-and-drop completion tracking
├── pages/                   # One file per screen
│   ├── EducationPage.tsx    # Learning Path / Games toggle
│   ├── SubLessonPage.tsx    # Lesson content + embedded game
│   ├── LevelDetailPage.tsx  # Level overview with standalone exercises
│   ├── QuizPage.tsx
│   ├── GamesPage.tsx        # Standalone games hub
│   ├── GamePage.tsx         # Individual game wrapper with back button
│   ├── GlossaryPage.tsx
│   ├── FlashcardPage.tsx
│   ├── SimulationPage.tsx
│   ├── RealWorldPage.tsx    # Invest tab
│   └── EditProfilePage.tsx
└── types.ts                 # Shared TypeScript interfaces
```

---

> **Disclaimer:** Agoply is for educational purposes only and does not constitute financial advice. Always do your own research before investing real money.
