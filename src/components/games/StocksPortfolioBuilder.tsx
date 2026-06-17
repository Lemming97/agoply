import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IconChartPie, IconBuildingSkyscraper } from '@tabler/icons-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'

interface Props {
  isCompleted: boolean
  onComplete: () => void
}

const STOCKS = [
  { id: 'AAPL',  name: 'Apple',          ticker: 'AAPL',  sector: 'Tech',      ret: 24  },
  { id: 'MC',    name: 'LVMH',           ticker: 'MC',    sector: 'Luxury',    ret: 18  },
  { id: 'TTE',   name: 'TotalEnergies',  ticker: 'TTE',   sector: 'Energy',    ret: 12  },
  { id: 'BNP',   name: 'BNP Paribas',   ticker: 'BNP',   sector: 'Banking',   ret: 8   },
  { id: 'AIR',   name: 'Airbus',         ticker: 'AIR',   sector: 'Aerospace', ret: 31  },
  { id: 'BN',    name: 'Danone',         ticker: 'BN',    sector: 'Consumer',  ret: 5   },
  { id: 'STLAM', name: 'Stellantis',     ticker: 'STLAM', sector: 'Auto',      ret: -8  },
  { id: 'WLN',   name: 'Worldline',      ticker: 'WLN',   sector: 'Fintech',   ret: -15 },
]

const PIE_COLORS = ['#1D9E75', '#2E86AB', '#7B5FD4']

function initAllocations(ids: string[]): Record<string, number> {
  const base = Math.floor(1000 / 3)
  return { [ids[0]]: base, [ids[1]]: base, [ids[2]]: 1000 - base * 2 }
}

export default function StocksPortfolioBuilder({ isCompleted, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})

  function toggleStock(id: string) {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  function goToStep2() {
    setAllocations(initAllocations(selectedIds))
    setStep(2)
  }

  function handleAllocation(stockId: string, newVal: number) {
    const others = selectedIds.filter(id => id !== stockId)
    const othersTotal = others.reduce((s, id) => s + (allocations[id] ?? 0), 0)
    const capped = Math.min(newVal, Math.max(100, 1000 - othersTotal))
    setAllocations(prev => ({ ...prev, [stockId]: capped }))
  }

  const totalAllocated = selectedIds.reduce((s, id) => s + (allocations[id] ?? 0), 0)

  // Results
  const results = selectedIds.map(id => {
    const stock = STOCKS.find(s => s.id === id)!
    const alloc = allocations[id] ?? 0
    return { ...stock, alloc, gain: Math.round(alloc * stock.ret / 100) }
  })
  const totalGain = results.reduce((s, r) => s + r.gain, 0)
  const finalValue = 1000 + totalGain
  const portfolioPct = Math.round((totalGain / 1000) * 100 * 10) / 10
  const best = results.reduce((a, b) => a.ret > b.ret ? a : b, results[0])
  const worst = results.reduce((a, b) => a.ret < b.ret ? a : b, results[0])

  const insightMsg = portfolioPct > 15
    ? 'Great diversification! Your mix of sectors paid off.'
    : portfolioPct >= 0
    ? 'Solid start. Diversifying across sectors protected you from big swings.'
    : 'Tough market! This is why diversification matters — one bad pick hurt less because you spread your risk.'

  function reset() { setStep(1); setSelectedIds([]); setAllocations({}) }

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconChartPie size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
        />
        {isCompleted && (
          <Chip label="Completed" size="small" sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600, fontSize: 11 }} />
        )}
      </Stack>

      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.25 }}>
        Portfolio Builder
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2.5 }}>
        Build your first stock portfolio with €1,000
      </Typography>

      {/* ── Step 1: Stock selection ── */}
      {step === 1 && (
        <>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, mb: 1.5 }}>
            Select 3 stocks ({selectedIds.length} chosen)
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            {STOCKS.map(s => {
              const selected = selectedIds.includes(s.id)
              const disabled = !selected && selectedIds.length >= 3
              return (
                <Box
                  key={s.id}
                  onClick={() => !disabled && toggleStock(s.id)}
                  sx={{
                    p: '10px 12px', borderRadius: '10px', cursor: disabled ? 'default' : 'pointer',
                    border: `1.5px solid ${selected ? '#1D9E75' : 'var(--border, #E0E0E0)'}`,
                    bgcolor: selected ? 'var(--teal-50)' : '#fafafa',
                    opacity: disabled ? 0.45 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                    <IconBuildingSkyscraper size={14} strokeWidth={1.5} color={selected ? '#1D9E75' : '#aaa'} />
                    <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
                      {s.ticker}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.secondary', mb: 0.5 }}>
                    {s.name}
                  </Typography>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={s.sector} size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#f0f0f0' }} />
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: s.ret >= 0 ? '#1D9E75' : '#DC2626' }}>
                      {s.ret >= 0 ? '+' : ''}{s.ret}%
                    </Typography>
                  </Stack>
                </Box>
              )
            })}
          </Box>
          <Button
            fullWidth variant="contained" disabled={selectedIds.length < 3} onClick={goToStep2}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', bgcolor: '#1D9E75', '&:hover': { bgcolor: '#0f6e56' }, '&.Mui-disabled': { bgcolor: '#e0e0e0' } }}
          >
            Allocate funds →
          </Button>
        </>
      )}

      {/* ── Step 2: Allocation ── */}
      {step === 2 && (
        <>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, mb: 0.5 }}>
            Allocate your €1,000
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: totalAllocated === 1000 ? '#1D9E75' : 'text.secondary', mb: 2 }}>
            {totalAllocated === 1000 ? 'Perfect — €1,000 allocated' : `€${1000 - totalAllocated} remaining`}
          </Typography>
          {selectedIds.map(id => {
            const stock = STOCKS.find(s => s.id === id)!
            return (
              <Box key={id} sx={{ mb: 2.5 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13 }}>
                    {stock.name} ({stock.ticker})
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1D9E75' }}>
                    €{allocations[id] ?? 0}
                  </Typography>
                </Stack>
                <Slider
                  value={allocations[id] ?? 0}
                  min={100} max={800} step={50}
                  onChange={(_, v) => handleAllocation(id, Array.isArray(v) ? v[0] : v)}
                  sx={{ color: '#1D9E75' }}
                />
              </Box>
            )
          })}
          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setStep(1)} variant="outlined" sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontFamily: 'var(--font-body)', borderColor: '#1D9E75', color: '#1D9E75' }}>
              ← Back
            </Button>
            <Button
              onClick={() => setStep(3)} variant="contained" disabled={totalAllocated !== 1000}
              sx={{ flex: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', bgcolor: '#1D9E75', '&:hover': { bgcolor: '#0f6e56' }, '&.Mui-disabled': { bgcolor: '#e0e0e0' } }}
            >
              See my returns →
            </Button>
          </Stack>
        </>
      )}

      {/* ── Step 3: Results ── */}
      {step === 3 && (
        <>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, mb: 1.5 }}>
            Your 1-Year Simulation
          </Typography>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={results.map(r => ({ name: r.ticker, gain: r.gain }))} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `€${v}`} tick={{ fontSize: 11 }} width={44} />
              <Tooltip formatter={(v: unknown) => [`€${Number(v)}`, 'Gain/Loss']} />
              <Bar dataKey="gain" radius={[4, 4, 0, 0]}>
                {results.map((r, i) => (
                  <Cell key={i} fill={r.ret >= 0 ? '#1D9E75' : '#DC2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Summary card */}
          <Box sx={{ mt: 2, p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa', mb: 2 }}>
            {[
              ['Starting amount', '€1,000'],
              ['Portfolio return', `${portfolioPct >= 0 ? '+' : ''}${portfolioPct}%`],
              ['Final value', `€${Math.round(finalValue).toLocaleString()}`],
              ['Best performer', best ? `${best.name} (+${best.ret}%)` : '—'],
              ['Worst performer', worst ? `${worst.name} (${worst.ret}%)` : '—'],
            ].map(([label, val]) => (
              <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', py: 0.5 }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{val}</Typography>
              </Stack>
            ))}
          </Box>

          {/* Allocation pie */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <PieChart width={200} height={160}>
              <Pie data={results.map(r => ({ name: r.ticker, value: r.alloc }))} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                {results.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => [`€${v}`, 'Allocated']} />
            </PieChart>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: '#f8f9fa', border: '1px solid var(--border, #E0E0E0)', mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
              {insightMsg}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button onClick={reset} variant="outlined" sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontFamily: 'var(--font-body)', borderColor: '#1D9E75', color: '#1D9E75' }}>
              Try again
            </Button>
            <Button
              onClick={onComplete} variant="contained" disabled={isCompleted}
              sx={{ flex: 2, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', bgcolor: '#1D9E75', '&:hover': { bgcolor: '#0f6e56' }, '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' } }}
            >
              {isCompleted ? 'Already completed ✓' : 'Complete game +20 XP'}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  )
}