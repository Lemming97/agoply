import { useState, useEffect } from 'react'

const INITIAL_STATE = {
  xp: 340,
  streak: 5,
  completedLevels: [1],
  activeLesson: 2,
  portfolio: {
    cash: 200,
    holdings: [
      { id: 'aapl',    name: 'Apple Inc.',       ticker: 'AAPL',  icon: '🍎', shares: 2,  price: 215.40, change: 2.3,  category: 'stock' },
      { id: 'eurgb',   name: 'EUR Gov Bond 2027', ticker: 'EURGB', icon: '🏛️', shares: 5,  price: 102.40, change: 0.4,  category: 'bond'  },
      { id: 'lvmh',    name: 'LVMH',              ticker: 'MC',    icon: '💎', shares: 1,  price: 694.50, change: -1.1, category: 'stock' },
    ],
  },
  riskProfile: 'Balanced Growth',
}

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('agoply_state')
      return saved ? JSON.parse(saved) : INITIAL_STATE
    } catch {
      return INITIAL_STATE
    }
  })

  useEffect(() => {
    localStorage.setItem('agoply_state', JSON.stringify(state))
  }, [state])

  function completeLevel(levelId) {
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

  function buyAsset(asset, quantity) {
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

  function resetState() {
    setState(INITIAL_STATE)
  }

  const portfolioValue = state.portfolio.holdings.reduce(
    (sum, h) => sum + h.price * h.shares, 0
  ) + state.portfolio.cash

  return { ...state, portfolioValue, completeLevel, buyAsset, resetState }
}
