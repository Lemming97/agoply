import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import {
  IconBarrel, IconCoin, IconTrendingUp, IconTrendingDown, IconArrowDown,
  IconArrowRight, IconTargetArrow, IconAlertTriangle, IconInfoCircle,
  IconLeaf, IconMinus, IconDroplet,
} from '@tabler/icons-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

interface Props {
  isCompleted: boolean
  onComplete: () => void
}

// ── Constants ────────────────────────────────────────────────
const BASE_PRICE       = 80
const COST_PER_BARREL  = 20
const BARRELS_PER_WELL = 1000

function getProductionBonus(wells: number): number {
  if (wells <= 3) return 15
  if (wells <= 6) return 0
  if (wells <= 9) return -10
  return -20
}

function calcRound(wells: number, eventMod: number) {
  const price   = BASE_PRICE + eventMod + getProductionBonus(wells)
  const barrels = wells * BARRELS_PER_WELL
  const revenue = barrels * price
  const costs   = barrels * COST_PER_BARREL
  const profit  = revenue - costs
  return { price, barrels, revenue, costs, profit }
}

// ── Events ───────────────────────────────────────────────────
type EventType = 'positive' | 'negative' | 'neutral'

const EVENTS = [
  {
    title: 'Stable Market',
    description: 'Global demand is steady. Normal trading conditions.',
    priceModifier: 0,
    type: 'neutral' as EventType,
    Icon: IconMinus,
  },
  {
    title: 'OPEC Cuts Production!',
    description: "OPEC announced a surprise 2M barrel/day production cut. Oil prices surge.",
    priceModifier: 25,
    type: 'positive' as EventType,
    Icon: IconTrendingUp,
  },
  {
    title: 'Economic Slowdown',
    description: "China's economy is slowing. Global oil demand drops sharply.",
    priceModifier: -20,
    type: 'negative' as EventType,
    Icon: IconTrendingDown,
  },
  {
    title: 'Middle East Tensions',
    description: 'Geopolitical conflict threatens supply routes. Prices spike on fear.',
    priceModifier: 30,
    type: 'positive' as EventType,
    Icon: IconAlertTriangle,
  },
  {
    title: 'US Shale Boom',
    description: 'American shale producers flood the market with cheap oil.',
    priceModifier: -15,
    type: 'negative' as EventType,
    Icon: IconArrowDown,
  },
  {
    title: 'Green Energy Push',
    description: 'Major economies announce fossil fuel phase-out plans. Long-term demand outlook weakens.',
    priceModifier: -10,
    type: 'negative' as EventType,
    Icon: IconLeaf,
  },
]

const BENCHMARK = EVENTS.reduce((sum, e) => sum + calcRound(5, e.priceModifier).profit, 0)

const HOW_TO_STEPS = [
  'You own 10 oil wells',
  'Each round choose how many wells to operate',
  'More wells = more production = lower price',
  'Fewer wells = less production = higher price',
  'React to market events to maximize profit',
  'After 6 rounds see your total earnings',
]

// ── Types ────────────────────────────────────────────────────
type RoundResult = {
  month: number
  wells: number
  price: number
  barrels: number
  revenue: number
  costs: number
  profit: number
}

function $$(n: number): string {
  return `$${Math.abs(Math.round(n)).toLocaleString()}`
}

// ── Component ─────────────────────────────────────────────────
export default function OilBaron({ isCompleted, onComplete }: Props) {
  const [started,            setStarted]            = useState(false)
  const [currentRound,       setCurrentRound]       = useState(0)
  const [wells,              setWells]              = useState(5)
  const [totalEarnings,      setTotalEarnings]      = useState(0)
  const [roundResults,       setRoundResults]       = useState<RoundResult[]>([])
  const [roundResultVisible, setRoundResultVisible] = useState(false)
  const [gameOver,           setGameOver]           = useState(false)

  const event  = EVENTS[Math.min(currentRound, 5)]
  const bonus  = getProductionBonus(wells)
  const { price, barrels, revenue, costs, profit } = calcRound(wells, event.priceModifier)
  const EventIcon = event.Icon

  const eventColors = {
    positive: { bg: 'var(--teal-50)',  border: 'var(--teal-100)', text: '#1D9E75'  },
    negative: { bg: '#fff8f8',         border: '#fca5a5',         text: '#DC2626'  },
    neutral:  { bg: '#f9f9f9',         border: '#e8e8e8',         text: '#666'     },
  }
  const ec = eventColors[event.type]

  function handleStart() {
    setStarted(true)
  }

  function handleWellClick(i: number) {
    const n = i + 1
    setWells(n === wells ? Math.max(1, n - 1) : n)
  }

  function handleConfirm() {
    const result: RoundResult = {
      month: currentRound + 1,
      wells,
      price,
      barrels,
      revenue,
      costs,
      profit,
    }
    setRoundResults(prev => [...prev, result])
    setTotalEarnings(prev => prev + profit)
    setRoundResultVisible(true)
  }

  function handleNextMonth() {
    if (currentRound >= 5) {
      setGameOver(true)
    } else {
      setCurrentRound(r => r + 1)
      setWells(5)
      setRoundResultVisible(false)
    }
  }

  function handleReset() {
    setStarted(false)
    setCurrentRound(0)
    setWells(5)
    setTotalEarnings(0)
    setRoundResults([])
    setRoundResultVisible(false)
    setGameOver(false)
  }

  // ── Results derived ──
  const latestResult = roundResults[roundResults.length - 1]
  const chartData    = roundResults.map(r => ({ name: `M${r.month}`, profit: r.profit }))
  const totalRevenue = roundResults.reduce((s, r) => s + r.revenue, 0)
  const totalCosts   = roundResults.reduce((s, r) => s + r.costs, 0)
  const bestMonth    = roundResults.length ? roundResults.reduce((a, b) => b.profit > a.profit ? b : a) : null
  const worstMonth   = roundResults.length ? roundResults.reduce((a, b) => b.profit < a.profit ? b : a) : null
  const avgWells     = roundResults.length ? (roundResults.reduce((s, r) => s + r.wells, 0) / roundResults.length).toFixed(1) : '—'
  const beatsBench   = totalEarnings > BENCHMARK

  const perfMsg = totalEarnings > 2200000
    ? 'Oil tycoon! You perfectly timed production to market conditions. OPEC would be jealous.'
    : totalEarnings >= 1500000
    ? 'Solid operator! You understood supply and demand well.'
    : totalEarnings >= 800000
    ? 'Decent returns. Watch market events more closely and adjust production faster.'
    : 'Tough run. Remember: cut production when prices are low, ramp up when events push prices high.'

  const profitColor = (p: number) =>
    p > 500000 ? '#1D9E75' : p >= 200000 ? '#C08B00' : '#DC2626'

  return (
    <Box>
      {/* Header — always visible */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconBarrel size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
        />
        {isCompleted && (
          <Chip label="Completed" size="small" sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600, fontSize: 11 }} />
        )}
      </Stack>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.25 }}>
        Oil Baron
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2 }}>
        Control production, react to markets, maximize profits
      </Typography>

      {/* ── HOW TO PLAY ─────────────────────────── */}
      {!started ? (
        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, mb: 2 }}>
            How to Play
          </Typography>
          {HOW_TO_STEPS.map((step, i) => (
            <Stack key={i} direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'white', lineHeight: 1 }}>{i + 1}</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6, pt: 0.2 }}>{step}</Typography>
            </Stack>
          ))}
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1D9E75', mt: 1.5, mb: 2, textAlign: 'center' }}>
            Goal: earn as much as possible over 6 months!
          </Typography>
          <Button
            fullWidth variant="contained" onClick={handleStart}
            endIcon={<IconArrowRight size={18} strokeWidth={1.5} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25, bgcolor: '#1D9E75', '&:hover': { bgcolor: '#178a62' } }}
          >
            Start Game
          </Button>
        </Box>

      ) : gameOver ? (
        /* ── FINAL RESULTS ──────────────────────── */
        <>
          <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa', mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.75 }}>
              <IconTargetArrow size={20} strokeWidth={1.5} color="#7C3AED" />
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                6 Months Complete!
              </Typography>
            </Stack>
            {([
              { label: 'Total Revenue',   value: $$(totalRevenue),                    color: 'text.primary'  },
              { label: 'Total Costs',     value: `-${$$(totalCosts)}`,               color: '#DC2626'       },
              { label: 'Total Profit',    value: $$(totalEarnings),                  color: totalEarnings > 0 ? '#1D9E75' : '#DC2626' },
              ...(bestMonth  ? [{ label: `Best month`,  value: `Month ${bestMonth.month}  (${$$(bestMonth.profit)})`,   color: '#1D9E75' }] : []),
              ...(worstMonth ? [{ label: `Worst month`, value: `Month ${worstMonth.month}  (${$$(worstMonth.profit)})`, color: '#DC2626' }] : []),
              { label: 'Avg wells operated', value: `${avgWells} wells`, color: 'text.secondary' },
            ] as const).map(({ label, value, color }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Benchmark */}
          <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: beatsBench ? 'var(--teal-50)' : '#fff8f8', border: `1px solid ${beatsBench ? 'var(--teal-100)' : '#fca5a5'}`, mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6, color: beatsBench ? '#1D9E75' : '#DC2626' }}>
              {beatsBench ? 'You beat the benchmark!' : 'You fell below the benchmark.'}{' '}
              Running 5 wells every month would have earned {$$(BENCHMARK)}.
              You earned {$$(totalEarnings)} — {beatsBench ? `${$$(totalEarnings - BENCHMARK)} more` : `${$$(BENCHMARK - totalEarnings)} less`}.
            </Typography>
          </Box>

          {/* Bar chart */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px', mb: 1 }}>
              PROFIT PER MONTH
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={44} />
                <Tooltip formatter={(v: unknown) => [$$(Number(v)), 'Profit']} />
                <ReferenceLine y={0} stroke="#ccc" />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.profit >= 0 ? '#1D9E75' : '#DC2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#f9f9f9', border: '1px solid #e8e8e8' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.65, color: 'text.primary' }}>{perfMsg}</Typography>
          </Box>

          <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--teal-600)', lineHeight: 1.65 }}>
              Real oil producers face these exact decisions. When OPEC cuts production by 2M barrels/day, it can swing the oil price by $20–30/barrel — affecting petrol prices, airline tickets, and the cost of almost everything.
            </Typography>
          </Box>

          <Stack sx={{ gap: 1.5 }}>
            <Button
              fullWidth variant="contained" onClick={onComplete} disabled={isCompleted}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25, bgcolor: '#3AAFA9', '&:hover': { bgcolor: '#2e9a94' }, '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' } }}
            >
              {isCompleted ? 'Already completed' : 'Got it! Supply meets demand. +20 XP'}
            </Button>
            <Button
              fullWidth variant="outlined" onClick={handleReset}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25, borderColor: '#1D9E75', color: '#1D9E75', '&:hover': { bgcolor: 'var(--teal-50)', borderColor: '#1D9E75' } }}
            >
              Play Again
            </Button>
          </Stack>
        </>

      ) : roundResultVisible && latestResult ? (
        /* ── ROUND RESULT ───────────────────────── */
        <>
          <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa', mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, mb: 1.5 }}>
              Month {latestResult.month} Results
            </Typography>
            {([
              { label: 'Wells operated', value: `${latestResult.wells} wells`,        color: 'text.primary'  },
              { label: 'Oil price',      value: `$${latestResult.price}/barrel`,      color: 'text.primary'  },
              { label: 'Barrels sold',   value: latestResult.barrels.toLocaleString(), color: 'text.secondary' },
              { label: 'Revenue',        value: $$(latestResult.revenue),             color: 'text.primary'  },
              { label: 'Costs',          value: `-${$$(latestResult.costs)}`,        color: '#DC2626'       },
            ] as const).map(({ label, value, color }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color }}>{value}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: '1px solid #e8e8e8', mt: 0.75, pt: 0.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>This month's profit</Typography>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: profitColor(latestResult.profit) }}>
                {$$(latestResult.profit)}
              </Typography>
            </Box>
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>Running total</Typography>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1D9E75' }}>
                {$$(totalEarnings)}
              </Typography>
            </Box>
          </Box>

          {/* Running bar chart */}
          {chartData.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px', mb: 1 }}>
                EARNINGS SO FAR
              </Typography>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={44} />
                  <Tooltip formatter={(v: unknown) => [$$(Number(v)), 'Profit']} />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? '#1D9E75' : '#DC2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Button
            fullWidth variant="contained" onClick={handleNextMonth}
            endIcon={<IconArrowRight size={18} strokeWidth={1.5} />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25, bgcolor: '#1D9E75', '&:hover': { bgcolor: '#178a62' } }}
          >
            {currentRound >= 5 ? 'See Final Results' : `Next Month (${EVENTS[currentRound + 1]?.title ?? ''})`}
          </Button>
        </>

      ) : (
        /* ── ACTIVE ROUND ───────────────────────── */
        <>
          {/* Progress */}
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
              Month {currentRound + 1} of 6
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled' }}>
              {6 - currentRound - 1} months left
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(currentRound / 6) * 100}
            sx={{ mb: 2, height: 4, borderRadius: 2, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, var(--teal-100), #1D9E75)', borderRadius: 2 } }}
          />

          {/* Earnings bar */}
          <Box sx={{ p: 1.75, borderRadius: '10px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <IconCoin size={18} strokeWidth={1.5} color="#1D9E75" />
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--teal-600)', fontWeight: 600 }}>
                  Total Earnings
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#1D9E75', lineHeight: 1.2 }}>
                    {$$(totalEarnings)}
                  </Typography>
                  {roundResults.length > 0 && (
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: latestResult?.profit >= 0 ? '#1D9E75' : '#DC2626' }}>
                      last month: {latestResult && latestResult.profit >= 0 ? '+' : ''}{latestResult ? $$(latestResult.profit) : ''}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Event card */}
          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: ec.bg, border: `1px solid ${ec.border}`, mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: ec.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <EventIcon size={24} strokeWidth={1.5} color={ec.text} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: ec.text, letterSpacing: '0.6px', mb: 0.25 }}>
                  MARKET EVENT
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, mb: 0.5 }}>
                  {event.title}
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.6, color: 'text.secondary', mb: 1 }}>
                  {event.description}
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                  {event.priceModifier > 0
                    ? <IconTrendingUp size={16} strokeWidth={1.5} color="#1D9E75" />
                    : event.priceModifier < 0
                    ? <IconTrendingDown size={16} strokeWidth={1.5} color="#DC2626" />
                    : <IconMinus size={16} strokeWidth={1.5} color="#888" />
                  }
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: event.priceModifier > 0 ? '#1D9E75' : event.priceModifier < 0 ? '#DC2626' : '#888' }}>
                    Price impact: {event.priceModifier > 0 ? '+' : ''}{event.priceModifier === 0 ? 'None' : `$${event.priceModifier}/barrel`}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Current price */}
          <Box sx={{ p: 1.5, borderRadius: '10px', border: '1px solid var(--border, #E0E0E0)', bgcolor: 'white', mb: 2, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px', mb: 0.25 }}>
              CURRENT OIL PRICE
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: 1.2 }}>
              ${price}/barrel
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mt: 0.25 }}>
              (Base ${BASE_PRICE}{event.priceModifier !== 0 ? ` ${event.priceModifier > 0 ? '+' : ''}$${event.priceModifier}` : ''}{bonus !== 0 ? ` ${bonus > 0 ? '+' : ''}$${bonus} production` : ''})
            </Typography>
          </Box>

          {/* Production decision */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'text.primary', mb: 1.25 }}>
              How many wells will you operate this month?
            </Typography>

            {/* Well icons */}
            <Box sx={{ display: 'flex', gap: 0.75, mb: 1.25, flexWrap: 'wrap' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <Box
                  key={i}
                  onClick={() => handleWellClick(i)}
                  sx={{ cursor: 'pointer', color: i < wells ? '#1D9E75' : '#D0D0D0', transition: 'color 0.15s', '&:hover': { color: i < wells ? '#178a62' : '#aaa' } }}
                >
                  <IconDroplet size={28} strokeWidth={i < wells ? 2 : 1.5} />
                </Box>
              ))}
            </Box>

            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
              {wells} {wells === 1 ? 'well' : 'wells'} operating
            </Typography>
            <Slider
              value={wells} min={1} max={10} step={1}
              marks={[{ value: 1, label: '1' }, { value: 5, label: '5' }, { value: 10, label: '10' }]}
              valueLabelDisplay="auto"
              onChange={(_, v) => setWells(Array.isArray(v) ? v[0] : v)}
              sx={{ color: '#1D9E75' }}
            />

            {/* Production warnings */}
            {wells > 6 && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 1, p: 1, borderRadius: '8px', bgcolor: '#fff8f0', border: '1px solid #FFCC80' }}>
                <IconAlertTriangle size={16} strokeWidth={1.5} color="#E07B39" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#C05A00' }}>
                  High production is pushing prices down ({bonus > 0 ? '+' : ''}${bonus}/barrel)
                </Typography>
              </Stack>
            )}
            {wells <= 3 && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 1, p: 1, borderRadius: '8px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
                <IconInfoCircle size={16} strokeWidth={1.5} color="#1D9E75" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#1D9E75' }}>
                  Low production keeps prices high (+${bonus}/barrel) but limits volume
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Live profit preview */}
          <Box sx={{ p: 1.75, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa', mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'text.disabled', letterSpacing: '0.5px', mb: 1 }}>
              THIS MONTH'S PREVIEW
            </Typography>
            {([
              { label: 'Production',  value: `${barrels.toLocaleString()} barrels` },
              { label: 'Price',       value: `$${price}/barrel` },
              { label: 'Revenue',     value: $$(revenue) },
              { label: 'Cost',        value: `-${$$(costs)}` },
            ] as const).map(({ label, value }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.35 }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.primary' }}>{value}</Typography>
              </Box>
            ))}
            <Box sx={{ borderTop: '1px solid #e0e0e0', mt: 0.75, pt: 0.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>NET PROFIT</Typography>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: profitColor(profit) }}>
                {$$(profit)}
              </Typography>
            </Box>
          </Box>

          {/* Confirm button */}
          <Button
            fullWidth variant="contained" onClick={handleConfirm}
            endIcon={<IconArrowRight size={18} strokeWidth={1.5} />}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, py: 1.4, bgcolor: '#E07B39', '&:hover': { bgcolor: '#c96a2c' } }}
          >
            Confirm: {wells} {wells === 1 ? 'Well' : 'Wells'} This Month
          </Button>
        </>
      )}
    </Box>
  )
}
