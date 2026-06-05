# Agoply

**Experience real-time investing through learning & play.**

Agoply is a gamified investment education app built for students and beginners. It combines structured lessons, a virtual portfolio simulator, and a bridge to real-world investing — all in one progressive learning experience.

---

## What it does

### Learn
Work through a locked curriculum of investment topics. Each level teaches a new asset class with a short lesson and a multiple-choice quiz. Completing a level unlocks that asset class in the Simulator.

| Level | Topic | Covers |
|-------|-------|--------|
| 1 | Bonds | Yield, duration, credit ratings, interest rate risk |
| 2 | Stocks | P/E ratios, dividends, market cap, EPS |
| 3 | Crypto | Blockchain, Bitcoin, Ethereum, volatility |
| 4 | Forex | Currency pairs, exchange rates, macro drivers |
| 5 | Commodities | Gold, oil, agriculture, futures |
| 6 | ETFs | Index funds, passive investing, expense ratios |
| 7 | Mutual Funds | Active management, NAV, fund selection |
| 8 | Topicality ✦ | AI-generated lessons from live market events *(coming soon)* |

### Simulate
Practice with €1,000 of virtual cash — no real money at risk. Browse a live-style market of stocks, bonds, crypto, forex, ETFs, and commodities. Buy assets you've unlocked, track your portfolio performance on an interactive chart, and compete on a weekly leaderboard against other students.

### Invest
Once you've built confidence in the simulator, the Invest tab bridges the gap to real markets. It calculates a risk profile based on your simulation behaviour, recommends an asset allocation, and lets you compare beginner-friendly brokers (Revolut, eToro, Trade Republic, BNP Paribas). A built-in Yahoo Finance search lets you look up any stock, ETF, or crypto in real time.

---

## Tech stack

- **React 19** + **Vite**
- **Recharts** — portfolio performance chart
- **React Router** — navigation
- **Google Fonts (Roboto)** — typography
- CSS custom properties for the design system (teal/gold palette, spacing, shadows)

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

---

> **Disclaimer:** Agoply is for educational purposes only and does not constitute financial advice. Always do your own research before investing real money.
