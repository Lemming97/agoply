import { useState } from 'react'
import { PLATFORMS } from '../data/gameData.js'

export default function RealWorldPage({ gameState, showToast }) {
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const levelsCompleted = gameState.completedLevels.length
  const riskScore = Math.min(100, levelsCompleted * 14)

  const riskLabel =
    riskScore < 30 ? 'Cautious' :
    riskScore < 55 ? 'Balanced Growth' :
    riskScore < 80 ? 'Growth' : 'Aggressive Growth'

  const riskColor =
    riskScore < 30 ? 'var(--blue-400)' :
    riskScore < 55 ? 'var(--teal-400)' :
    riskScore < 80 ? 'var(--gold-500)' : 'var(--red-400)'

  const allocation =
    riskScore < 30 ? '70% Bonds · 20% ETFs · 10% Stocks' :
    riskScore < 55 ? '60% ETFs · 30% Stocks · 10% Bonds' :
    riskScore < 80 ? '50% Stocks · 35% ETFs · 15% Crypto' :
    '60% Stocks · 25% Crypto · 15% Commodities'

  function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const url = `https://finance.yahoo.com/search?p=${encodeURIComponent(searchQuery)}`
    window.open(url, '_blank')
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Bridge to Real Investing</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        You've built confidence in the simulator — here's how to start for real
      </p>

      {/* Risk Profile */}
      <Card title="🎯 Your Risk Profile">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Based on your simulation behavior and {levelsCompleted} completed level{levelsCompleted !== 1 ? 's' : ''}:
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 800, color: riskColor }}>{riskLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, marginBottom: 4 }}>
          <span style={{ color: 'var(--teal-400)', fontWeight: 600 }}>Low risk</span>
          <div style={{ flex: 1, height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${riskScore}%`, background: `linear-gradient(90deg, #1D9E75, #FFB300, #E24B4A)`, borderRadius: 4, transition: 'width 0.8s' }} />
          </div>
          <span style={{ color: 'var(--red-400)', fontWeight: 600 }}>High risk</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text)', marginTop: 10 }}>
          Suggested allocation: <strong>{allocation}</strong>
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
          Complete more levels to refine your profile
        </p>
      </Card>

      {/* Platforms */}
      <Card title="🏦 Partner Platforms">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
          Tap a platform to compare features and find the right fit for you.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setSelectedPlatform(selectedPlatform?.id === p.id ? null : p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: selectedPlatform?.id === p.id ? 'var(--teal-50)' : 'var(--surface2)',
                border: `1px solid ${selectedPlatform?.id === p.id ? 'var(--teal-400)' : 'var(--border)'}`,
                borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                color: selectedPlatform?.id === p.id ? 'var(--teal-600)' : 'var(--text)', transition: 'all 0.15s',
              }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: p.color, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
              {p.name}
              {p.beginner && <span style={{ fontSize: 9, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: 8, padding: '1px 5px', fontWeight: 700 }}>BEGINNER</span>}
            </button>
          ))}
        </div>
        {selectedPlatform && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{selectedPlatform.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gold-400)', fontWeight: 700 }}>
                ★ {selectedPlatform.rating}
              </div>
            </div>
            {[
              { label: 'Min. deposit', val: selectedPlatform.min },
              { label: 'Setup time',   val: selectedPlatform.time },
              { label: 'Assets',       val: selectedPlatform.assets.join(', ') },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 500, maxWidth: 220, textAlign: 'right' }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 8, fontSize: 12, color: 'var(--teal-600)', fontWeight: 600 }}>
              ★ {selectedPlatform.perk}
            </div>
          </div>
        )}
      </Card>

      {/* How-to guides */}
      <Card title="📋 Step-by-Step Guides">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Beginner guides tailored to your risk profile and learning progress.
        </p>
        {[
          { emoji: '1️⃣', title: 'Open a brokerage account', desc: 'Compare Revolut, eToro, or Trade Republic. Choose based on min deposit and assets you want to trade.' },
          { emoji: '2️⃣', title: 'Start with an ETF', desc: 'A MSCI World or S&P 500 ETF gives instant diversification across 500–1600 companies for as little as €10/month.' },
          { emoji: '3️⃣', title: 'Set a monthly budget', desc: 'Even €20–50/month invested consistently from age 20 can grow to €50,000+ by age 40 thanks to compounding.' },
          { emoji: '4️⃣', title: 'Understand your taxes', desc: 'In France, capital gains and dividends are taxed at 30% (Prélèvement Forfaitaire Unique). A PEA account can reduce this.' },
        ].map(step => (
          <div key={step.title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{step.emoji}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{step.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Search */}
      <Card title="🔍 Investment Search">
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
          Look up any stock, ETF, or crypto to find current market data on Yahoo Finance.
        </p>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Try: AAPL, Bitcoin, CAC 40 ETF, LVMH..."
            style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }}
            onFocus={e => e.target.style.borderColor = 'var(--teal-400)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" style={{ padding: '10px 18px', background: 'var(--teal-400)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
            Search →
          </button>
        </form>
      </Card>

      {/* Disclaimer */}
      <div style={{ marginTop: 8, padding: '12px 16px', background: '#FFF8E1', border: '1px solid #FFD700', borderRadius: 10, fontSize: 11.5, color: '#7A5500', lineHeight: 1.6 }}>
        ⚠️ <strong>Educational purposes only.</strong> This is not financial advice. Always do your own research and consider speaking with a licensed financial advisor before investing real money.
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, marginBottom: 14 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{title}</h4>
      {children}
    </div>
  )
}
