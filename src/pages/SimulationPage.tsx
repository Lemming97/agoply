import { useState } from 'react'
import Button from '@mui/material/Button'
import { MARKET_ASSETS, LEADERBOARD } from '../data/gameData'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { GameState, MarketAsset, Holding, LeaderboardEntry } from '../types'

interface SimulationPageProps {
  gameState: GameState
  showToast: (msg: string) => void
}

const CHART_DATA = [
  { day: 'Day 1', value: 1000 }, { day: 'Day 2', value: 1023 }, { day: 'Day 3', value: 1008 },
  { day: 'Day 4', value: 1061 }, { day: 'Day 5', value: 1049 }, { day: 'Day 6', value: 1095 },
  { day: 'Day 7', value: 1143 },
]

type SimView = 'portfolio' | 'market' | 'leaderboard'

export default function SimulationPage({ gameState, showToast }: SimulationPageProps) {
  const [view, setView] = useState<SimView>('portfolio')
  const [buyModal, setBuyModal] = useState<MarketAsset | null>(null)
  const [qty, setQty] = useState(1)

  const totalValue = gameState.portfolioValue

  function handleBuy(asset: MarketAsset) {
    if (!gameState.completedLevels.includes(asset.requiredLevel)) {
      const lvlName = ['', 'Bonds', 'Stocks', 'Crypto', 'Forex', 'Commodities', 'ETFs', 'Mutual Funds'][asset.requiredLevel]
      showToast(`🔒 Complete Level ${asset.requiredLevel}: ${lvlName} to unlock this!`)
      return
    }
    setBuyModal(asset)
    setQty(1)
  }

  function confirmBuy() {
    if (!buyModal) return
    const cost = buyModal.price * qty
    if (cost > gameState.portfolio.cash) {
      showToast('❌ Not enough virtual cash!')
      return
    }
    gameState.buyAsset(buyModal, qty)
    showToast(`✅ Bought ${qty}× ${buyModal.ticker} for €${(cost).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}!`)
    setBuyModal(null)
  }

  const viewLabels: Record<SimView, string> = {
    portfolio: '📂 Portfolio',
    market: '📈 Markets',
    leaderboard: '🏆 Rankings',
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Portfolio Simulator</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Practice with virtual money — zero real risk
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['portfolio', 'market', 'leaderboard'] as SimView[]).map(v => (
          <Button
            key={v}
            onClick={() => setView(v)}
            variant={view === v ? 'contained' : 'outlined'}
            disableElevation
            sx={{
              flex: 1,
              py: '9px',
              px: '8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              borderColor: view === v ? '#1D9E75' : 'var(--border)',
              bgcolor: view === v ? '#E1F5EE' : 'var(--surface)',
              color: view === v ? '#0F6E56' : 'var(--muted)',
              '&:hover': { borderColor: '#1D9E75', bgcolor: '#E1F5EE', color: '#0F6E56' },
            }}
          >
            {viewLabels[v]}
          </Button>
        ))}
      </div>

      {view === 'portfolio'    && <PortfolioView gameState={gameState} totalValue={totalValue} />}
      {view === 'market'       && <MarketView assets={MARKET_ASSETS} onBuy={handleBuy} completedLevels={gameState.completedLevels} />}
      {view === 'leaderboard'  && <LeaderboardView data={LEADERBOARD} myValue={Math.round(totalValue)} />}

      {buyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Buy {buyModal.icon} {buyModal.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
              <span>Price per unit</span>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>€{buyModal.price.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                variant="outlined"
                sx={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', border: '1.5px solid var(--border)', bgcolor: 'var(--surface2)', fontSize: '18px', p: 0, color: 'var(--text)', '&:hover': { bgcolor: 'var(--gray-200)', borderColor: 'var(--border)' } }}
              >−</Button>
              <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{qty}</span>
              <Button
                onClick={() => setQty(q => q + 1)}
                variant="outlined"
                sx={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', border: '1.5px solid var(--border)', bgcolor: 'var(--surface2)', fontSize: '18px', p: 0, color: 'var(--text)', '&:hover': { bgcolor: 'var(--gray-200)', borderColor: 'var(--border)' } }}
              >+</Button>
            </div>
            <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>Total cost</span>
              <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>€{(buyModal.price * qty).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
              Available cash: €{gameState.portfolio.cash.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button onClick={() => setBuyModal(null)} variant="outlined" disableElevation
                sx={{ flex: 1, py: '11px', borderRadius: '10px', border: '1.5px solid var(--border)', fontSize: '14px', fontWeight: 600, textTransform: 'none', color: 'var(--text)', '&:hover': { borderColor: 'var(--gray-600)', bgcolor: 'var(--gray-100)' } }}
              >Cancel</Button>
              <Button onClick={confirmBuy} variant="contained" disableElevation
                sx={{ flex: 1, py: '11px', borderRadius: '10px', bgcolor: '#1D9E75', color: '#fff', fontSize: '14px', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#0F6E56' } }}
              >Confirm Buy</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PortfolioViewProps {
  gameState: GameState
  totalValue: number
}

function PortfolioView({ gameState, totalValue }: PortfolioViewProps) {
  const gain = totalValue - 1000
  const gainPct = ((gain / 1000) * 100).toFixed(2)
  const isUp = gain >= 0

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #085041, #1D9E75)', borderRadius: 'var(--radius)', padding: 20, color: '#fff', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Total Portfolio Value</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, marginBottom: 4 }}>
          €{totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
          {isUp ? '+' : ''}€{gain.toFixed(2)} · {isUp ? '+' : ''}{gainPct}% since start
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Stocks', val: `€${gameState.portfolio.holdings.filter(h => h.category === 'stock').reduce((s, h) => s + h.price * h.shares, 0).toFixed(0)}` },
            { label: 'Bonds',  val: `€${gameState.portfolio.holdings.filter(h => h.category === 'bond').reduce((s, h) => s + h.price * h.shares, 0).toFixed(0)}` },
            { label: 'Cash',   val: `€${gameState.portfolio.cash.toFixed(0)}` },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{s.val}</div>
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 16px 8px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.8px', marginBottom: 12 }}>PORTFOLIO PERFORMANCE</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={CHART_DATA}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5a7a6e' }} axisLine={false} tickLine={false} />
            <YAxis domain={[950, 1200]} tick={{ fontSize: 11, fill: '#5a7a6e' }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v) => [`€${v}`, 'Value']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke="#1D9E75" strokeWidth={2} fill="url(#tealGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.8px', marginBottom: 10 }}>YOUR HOLDINGS</div>
      {gameState.portfolio.holdings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: 14 }}>
          No holdings yet — head to Markets to buy your first asset!
        </div>
      ) : (
        gameState.portfolio.holdings.map(h => <HoldingRow key={h.id} holding={h} />)
      )}
    </>
  )
}

function HoldingRow({ holding }: { holding: Holding }) {
  const value = holding.price * holding.shares
  const isUp = holding.change >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{holding.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{holding.name}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{holding.ticker} · {holding.shares} shares</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>€{value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: isUp ? 'var(--teal-400)' : 'var(--red-400)' }}>{isUp ? '+' : ''}{holding.change}%</div>
      </div>
    </div>
  )
}

interface MarketViewProps {
  assets: MarketAsset[]
  onBuy: (asset: MarketAsset) => void
  completedLevels: number[]
}

type AssetFilter = 'all' | 'stock' | 'bond' | 'crypto' | 'forex' | 'commodity' | 'etf'

function MarketView({ assets, onBuy, completedLevels }: MarketViewProps) {
  const [filter, setFilter] = useState<AssetFilter>('all')
  const cats: AssetFilter[] = ['all', 'stock', 'bond', 'crypto', 'forex', 'commodity', 'etf']
  const filtered = filter === 'all' ? assets : assets.filter(a => a.category === filter)

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <Button
            key={c}
            onClick={() => setFilter(c)}
            variant={filter === c ? 'contained' : 'outlined'}
            size="small"
            disableElevation
            sx={{
              px: '12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderColor: filter === c ? '#1D9E75' : 'var(--border)',
              bgcolor: filter === c ? '#E1F5EE' : 'var(--surface)',
              color: filter === c ? '#0F6E56' : 'var(--muted)',
              '&:hover': { borderColor: '#1D9E75', bgcolor: '#E1F5EE', color: '#0F6E56' },
            }}
          >
            {c}
          </Button>
        ))}
      </div>
      {filtered.map(asset => {
        const unlocked = completedLevels.includes(asset.requiredLevel)
        const isUp = asset.change >= 0
        return (
          <div key={asset.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, gap: 12, opacity: unlocked ? 1 : 0.5 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: unlocked ? 'var(--teal-50)' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{asset.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{asset.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{asset.ticker}</div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>€{asset.price.toLocaleString()}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: isUp ? 'var(--teal-400)' : 'var(--red-400)' }}>{isUp ? '+' : ''}{asset.change}%</div>
            </div>
            <Button
              onClick={() => onBuy(asset)}
              variant="outlined"
              size="small"
              disableElevation
              sx={{
                bgcolor: unlocked ? '#E1F5EE' : '#f5f5f5',
                color: unlocked ? '#0F6E56' : '#aaa',
                borderColor: unlocked ? '#9FE1CB' : '#ddd',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: unlocked ? '#9FE1CB' : '#f5f5f5', borderColor: unlocked ? '#1D9E75' : '#ddd' },
              }}
            >
              {unlocked ? 'BUY' : '🔒'}
            </Button>
          </div>
        )
      })}
    </>
  )
}

interface LeaderboardViewProps {
  data: LeaderboardEntry[]
  myValue: number
}

function LeaderboardView({ data, myValue }: LeaderboardViewProps) {
  const updated = data.map(r => r.me ? { ...r, value: myValue } : r)
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  return (
    <>
      <div style={{ background: '#FFF8E1', border: '1px solid #FFD700', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: '#7A5500', fontWeight: 500 }}>
        🏆 Weekly Challenge: <strong>Best Diversified Portfolio</strong> — ends Sunday
      </div>
      {updated.map(r => {
        const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']
        const rankBg = r.rank <= 3 ? rankColors[r.rank - 1] : '#f0f0f0'
        const rankColor = r.rank === 1 ? '#7A5500' : r.rank <= 3 ? '#444' : '#888'
        return (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 10, marginBottom: 6, gap: 12, fontSize: 13, background: r.me ? 'var(--teal-50)' : 'var(--surface)', border: `1px solid ${r.me ? 'var(--teal-100)' : 'var(--border)'}` }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: rankBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, fontFamily: 'var(--font-display)', color: rankColor, flexShrink: 0 }}>{r.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: r.me ? 700 : 500 }}>{r.name} {r.me && '(you)'}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.school}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: r.me ? 'var(--teal-600)' : 'var(--text)', fontSize: 14 }}>€{r.value.toLocaleString()}</div>
          </div>
        )
      })}
    </>
  )
}
