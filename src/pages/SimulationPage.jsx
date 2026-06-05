import { useState } from 'react'
import { MARKET_ASSETS, LEADERBOARD } from '../data/gameData.js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CHART_DATA = [
  { day: 'Day 1', value: 1000 }, { day: 'Day 2', value: 1023 }, { day: 'Day 3', value: 1008 },
  { day: 'Day 4', value: 1061 }, { day: 'Day 5', value: 1049 }, { day: 'Day 6', value: 1095 },
  { day: 'Day 7', value: 1143 },
]

export default function SimulationPage({ gameState, showToast }) {
  const [view, setView] = useState('portfolio')
  const [buyModal, setBuyModal] = useState(null)
  const [qty, setQty] = useState(1)

  const totalValue = gameState.portfolioValue

  function handleBuy(asset) {
    if (!gameState.completedLevels.includes(asset.requiredLevel)) {
      const lvlName = ['', 'Bonds', 'Stocks', 'Crypto', 'Forex', 'Commodities', 'ETFs', 'Mutual Funds'][asset.requiredLevel]
      showToast(`🔒 Complete Level ${asset.requiredLevel}: ${lvlName} to unlock this!`)
      return
    }
    setBuyModal(asset)
    setQty(1)
  }

  function confirmBuy() {
    const cost = buyModal.price * qty
    if (cost > gameState.portfolio.cash) {
      showToast('❌ Not enough virtual cash!')
      return
    }
    gameState.buyAsset(buyModal, qty)
    showToast(`✅ Bought ${qty}× ${buyModal.ticker} for €${(cost).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}!`)
    setBuyModal(null)
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Portfolio Simulator</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
        Practice with virtual money — zero real risk
      </p>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['portfolio', 'market', 'leaderboard'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '9px 8px', border: `1.5px solid ${view === v ? 'var(--teal-400)' : 'var(--border)'}`,
            background: view === v ? 'var(--teal-50)' : 'var(--surface)', color: view === v ? 'var(--teal-600)' : 'var(--muted)',
            borderRadius: 8, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.5px', transition: 'all 0.15s', textTransform: 'uppercase',
          }}>
            {{ portfolio: '📂 Portfolio', market: '📈 Markets', leaderboard: '🏆 Rankings' }[v]}
          </button>
        ))}
      </div>

      {view === 'portfolio' && <PortfolioView gameState={gameState} totalValue={totalValue} />}
      {view === 'market'    && <MarketView assets={MARKET_ASSETS} onBuy={handleBuy} completedLevels={gameState.completedLevels} />}
      {view === 'leaderboard' && <LeaderboardView data={LEADERBOARD} myValue={Math.round(totalValue)} />}

      {/* Buy Modal */}
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
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface2)', fontSize: 18, cursor: 'pointer' }}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--surface2)', fontSize: 18, cursor: 'pointer' }}>+</button>
            </div>
            <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>Total cost</span>
              <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>€{(buyModal.price * qty).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
              Available cash: €{gameState.portfolio.cash.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setBuyModal(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'transparent', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmBuy} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, background: 'var(--teal-400)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer' }}>Confirm Buy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PortfolioView({ gameState, totalValue }) {
  const gain = totalValue - 1000
  const gainPct = ((gain / 1000) * 100).toFixed(2)
  const isUp = gain >= 0

  return (
    <>
      {/* Summary card */}
      <div style={{ background: 'linear-gradient(135deg, #085041, #1D9E75)', borderRadius: 'var(--radius)', padding: 20, color: '#fff', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Total Portfolio Value</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, marginBottom: 4 }}>
          €{totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>
          {isUp ? '+' : ''}€{gain.toFixed(2)} · {isUp ? '+' : ''}{gainPct}% since start
        </div>
        <div style={{ display: 'grid', gridColumns: 'repeat(3,1fr)', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
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

      {/* Chart */}
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
            <YAxis domain={[950, 1200]} tick={{ fontSize: 11, fill: '#5a7a6e' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `€${v}`} />
            <Tooltip formatter={v => [`€${v}`, 'Value']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke="#1D9E75" strokeWidth={2} fill="url(#tealGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Holdings */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.8px', marginBottom: 10 }}>YOUR HOLDINGS</div>
      {gameState.portfolio.holdings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: 14 }}>
          No holdings yet — head to Markets to buy your first asset!
        </div>
      ) : (
        gameState.portfolio.holdings.map(h => (
          <HoldingRow key={h.id} holding={h} />
        ))
      )}
    </>
  )
}

function HoldingRow({ holding }) {
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

function MarketView({ assets, onBuy, completedLevels }) {
  const [filter, setFilter] = useState('all')
  const cats = ['all', 'stock', 'bond', 'crypto', 'forex', 'commodity', 'etf']
  const filtered = filter === 'all' ? assets : assets.filter(a => a.category === filter)

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
            border: `1.5px solid ${filter === c ? 'var(--teal-400)' : 'var(--border)'}`,
            background: filter === c ? 'var(--teal-50)' : 'var(--surface)',
            color: filter === c ? 'var(--teal-600)' : 'var(--muted)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>{c}</button>
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
            <button onClick={() => onBuy(asset)} style={{
              background: unlocked ? 'var(--teal-50)' : '#f5f5f5',
              color: unlocked ? 'var(--teal-600)' : '#aaa',
              border: `1px solid ${unlocked ? 'var(--teal-100)' : '#ddd'}`,
              borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700,
              fontFamily: 'var(--font-display)', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {unlocked ? 'BUY' : '🔒'}
            </button>
          </div>
        )
      })}
    </>
  )
}

function LeaderboardView({ data, myValue }) {
  const updated = data.map(r => r.me ? { ...r, value: myValue } : r)
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  return (
    <>
      <div style={{ background: '#FFF8E1', border: '1px solid #FFD700', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: '#7A5500', fontWeight: 500 }}>
        🏆 Weekly Challenge: <strong>Best Diversified Portfolio</strong> — ends Sunday
      </div>
      {updated.map(r => {
        const rankColors = ['#FFD700','#C0C0C0','#CD7F32']
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
