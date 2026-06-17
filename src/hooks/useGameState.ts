import { useState, useEffect } from 'react'
import type { GameStateData, GameState, MarketAsset, GlossaryEntry } from '../types'

const GLOSSARY_KEY = 'agoply_glossary'

const STATE_KEY = (email: string) => `agoply_state_${email}`

// Pre-loaded demo data for the test account
const DEMO_STATE: GameStateData = {
  xp: 340,
  streak: 5,
  completedLevels: [1],
  completedSubLessons: ['bonds-1', 'bonds-2', 'bonds-3'],
  activeLesson: 2,
  portfolio: {
    cash: 200,
    holdings: [
      { id: 'aapl',  name: 'Apple Inc.',        ticker: 'AAPL',  icon: '🍎', shares: 2, price: 215.40, change: 2.3,  category: 'stock' },
      { id: 'eurgb', name: 'EUR Gov Bond 2027',  ticker: 'EURGB', icon: '🏛️', shares: 5, price: 102.40, change: 0.4,  category: 'bond'  },
      { id: 'lvmh',  name: 'LVMH',              ticker: 'MC',    icon: '💎', shares: 1, price: 694.50, change: -1.1, category: 'stock' },
    ],
  },
  riskProfile: 'Balanced Growth',
}

// Blank starting state for new registered users
const FRESH_STATE: GameStateData = {
  xp: 0,
  streak: 0,
  completedLevels: [],
  completedSubLessons: [],
  activeLesson: 1,
  portfolio: { cash: 1000, holdings: [] },
  riskProfile: '',
}

const TEST_EMAIL = 'test@agoply.com'

export function useGameState(userEmail: string): GameState {
  const key = STATE_KEY(userEmail)

  const [savedGlossary, setSavedGlossary] = useState<GlossaryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(GLOSSARY_KEY) || '[]') as GlossaryEntry[] } catch { return [] }
  })

  const [state, setState] = useState<GameStateData>(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved) as GameStateData
        return { ...parsed, completedSubLessons: parsed.completedSubLessons ?? [] }
      }
    } catch { /* ignore */ }
    return userEmail === TEST_EMAIL ? DEMO_STATE : FRESH_STATE
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [state, key])

  function completeLevel(levelId: number): void {
    setState(s => ({
      ...s,
      xp: s.xp + 50,
      streak: s.streak + 1,
      completedLevels: [...new Set([...s.completedLevels, levelId])],
      activeLesson: levelId + 1,
      portfolio: {
        ...s.portfolio,
        cash: s.portfolio.cash + 100,
      },
    }))
  }

  function buyAsset(asset: MarketAsset, quantity: number): void {
    const cost = asset.price * quantity
    setState(s => {
      if (s.portfolio.cash < cost) return s
      const existingIdx = s.portfolio.holdings.findIndex(h => h.id === asset.id)
      let newHoldings
      if (existingIdx >= 0) {
        newHoldings = s.portfolio.holdings.map((h, i) =>
          i === existingIdx ? { ...h, shares: h.shares + quantity } : h
        )
      } else {
        newHoldings = [...s.portfolio.holdings, { ...asset, shares: quantity }]
      }
      return {
        ...s,
        portfolio: { cash: s.portfolio.cash - cost, holdings: newHoldings },
      }
    })
  }

  function sellAsset(holdingId: string, quantity: number): void {
    setState(s => {
      const holding = s.portfolio.holdings.find(h => h.id === holdingId)
      if (!holding) return s
      const proceeds = holding.price * quantity
      const newShares = holding.shares - quantity
      const newHoldings = newShares <= 0
        ? s.portfolio.holdings.filter(h => h.id !== holdingId)
        : s.portfolio.holdings.map(h => h.id === holdingId ? { ...h, shares: newShares } : h)
      return {
        ...s,
        portfolio: { cash: s.portfolio.cash + proceeds, holdings: newHoldings },
      }
    })
  }

  function completeSubLesson(id: string): void {
    setState(s => ({
      ...s,
      completedSubLessons: [...new Set([...s.completedSubLessons, id])],
    }))
  }

  function addXP(amount: number): void {
    setState(s => ({ ...s, xp: s.xp + amount }))
  }

  function resetState(): void {
    setState(userEmail === TEST_EMAIL ? DEMO_STATE : FRESH_STATE)
  }

  function saveGlossaryTerm(entry: GlossaryEntry): void {
    setSavedGlossary(prev => {
      if (prev.some(e => e.term === entry.term)) return prev
      const next = [...prev, entry]
      try { localStorage.setItem(GLOSSARY_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function removeSavedTerm(term: string): void {
    setSavedGlossary(prev => {
      const next = prev.filter(e => e.term !== term)
      try { localStorage.setItem(GLOSSARY_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const portfolioValue = state.portfolio.holdings.reduce(
    (sum, h) => sum + h.price * h.shares, 0
  ) + state.portfolio.cash

  return { ...state, portfolioValue, completeLevel, completeSubLesson, buyAsset, sellAsset, addXP, resetState, savedGlossary, saveGlossaryTerm, removeSavedTerm }
}
