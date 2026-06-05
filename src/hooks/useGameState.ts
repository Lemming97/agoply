import { useState, useEffect } from 'react'
import type { GameStateData, GameState, MarketAsset } from '../types'

const INITIAL_STATE: GameStateData = {
  xp: 340,
  streak: 5,
  completedLevels: [1],
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

export function useGameState(): GameState {
  const [state, setState] = useState<GameStateData>(() => {
    try {
      const saved = localStorage.getItem('agoply_state')
      return saved ? (JSON.parse(saved) as GameStateData) : INITIAL_STATE
    } catch {
      return INITIAL_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('agoply_state', JSON.stringify(state))
  }, [state])

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

  function resetState(): void {
    setState(INITIAL_STATE)
  }

  const portfolioValue = state.portfolio.holdings.reduce(
    (sum, h) => sum + h.price * h.shares, 0
  ) + state.portfolio.cash

  return { ...state, portfolioValue, completeLevel, buyAsset, sellAsset, resetState }
}
