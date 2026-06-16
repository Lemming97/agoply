import { useState, useEffect, useRef, useCallback } from 'react'
import { MARKET_ASSETS } from '../data/gameData'
import { fetchQuotes } from '../services/fmpApi'
import type { MarketAsset } from '../types'

const SYMBOLS = ['AAPL', 'NVDA', 'MC.PA', 'BTCUSD', 'ETHUSD', 'EURUSD', 'GCUSD', 'IWDA', 'VOO']

// Maps FMP symbol → MARKET_ASSETS id
const SYMBOL_TO_ID: Record<string, string> = {
  AAPL:    'aapl',
  NVDA:    'nvda',
  'MC.PA': 'mc',
  BTCUSD:  'btc',
  ETHUSD:  'eth',
  EURUSD:  'eurusd',
  GCUSD:   'gold',
  IWDA:    'msci',
  VOO:     'sp500',
}

export function useLiveMarketData() {
  const [assets, setAssets] = useState<MarketAsset[]>(MARKET_ASSETS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const quotes = await fetchQuotes(SYMBOLS)
      if (!Array.isArray(quotes) || quotes.length === 0) throw new Error('Empty response')

      const quoteMap: Record<string, typeof quotes[0]> = {}
      for (const q of quotes) quoteMap[q.symbol] = q

      setAssets(MARKET_ASSETS.map(asset => {
        const fmpSymbol = Object.entries(SYMBOL_TO_ID).find(([, id]) => id === asset.id)?.[0]
        if (fmpSymbol && quoteMap[fmpSymbol]) {
          const q = quoteMap[fmpSymbol]
          return { ...asset, price: q.price, change: parseFloat(q.changesPercentage.toFixed(2)) }
        }
        return asset
      }))
      setIsLive(true)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
      setIsLive(false)
      // Leaves assets unchanged — static fallback stays in place
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    function start() {
      intervalRef.current = setInterval(fetchData, 60_000)
    }
    function stop() {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    }

    start()

    function onVisibility() {
      if (document.hidden) { stop() } else { fetchData(); start() }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [fetchData])

  return { assets, loading, error, isLive }
}
