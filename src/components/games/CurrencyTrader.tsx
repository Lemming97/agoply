import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import {
  IconCurrencyEuro, IconWallet, IconTrendingUp, IconTrendingDown,
  IconArrowRight, IconTargetArrow, IconBriefcase, IconCamera,
  IconSchool, IconHome, IconBackpack, IconChevronDown, IconChevronUp,
  IconMinus,
} from '@tabler/icons-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'

interface Props {
  isCompleted: boolean
  onComplete: () => void
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',       symbol: '$',    baseRate: 1.08,  decimals: 4 },
  { code: 'GBP', name: 'British Pound',   symbol: '£',    baseRate: 0.85,  decimals: 4 },
  { code: 'JPY', name: 'Japanese Yen',    symbol: '¥',    baseRate: 161.5, decimals: 1 },
  { code: 'CHF', name: 'Swiss Franc',     symbol: 'CHF',  baseRate: 0.96,  decimals: 4 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$',  baseRate: 1.46,  decimals: 4 },
]

const TRAVELLERS = [
  { name: 'Business Traveller', currency: 'USD', Icon: IconBriefcase },
  { name: 'Tourist',            currency: 'JPY', Icon: IconCamera    },
  { name: 'Student',            currency: 'GBP', Icon: IconSchool    },
  { name: 'Family',             currency: 'CHF', Icon: IconHome      },
  { name: 'Backpacker',         currency: 'CAD', Icon: IconBackpack  },
]

const HOW_TO_STEPS = [
  'A traveller arrives needing foreign currency',
  'Check if today\'s rate is BETTER or WORSE than the base rate',
  'Exchange euros if the rate is favorable',
  'Skip if the rate is not worth it',
  'After 5 travellers, see your total profit',
]

type RoundResult = {
  round: number
  traveller: string
  currency: string
  action: 'buy' | 'skip'
  rate: number
  baseRate: number
  amount: number
  profit: number
}

function generateRatesForRound(): Record<string, number> {
  return Object.fromEntries(
    CURRENCIES.map(c => [c.code, c.baseRate * (0.97 + Math.random() * 0.06)])
  )
}

export default function CurrencyTrader({ isCompleted, onComplete }: Props) {
  const [started,      setStarted]      = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [euros,        setEuros]        = useState(1000)
  const [allRates,     setAllRates]     = useState<Record<string, number>[]>([])
  const [exchangeAmt,  setExchangeAmt]  = useState(200)
  const [showRates,    setShowRates]    = useState(false)
  const [gameOver,     setGameOver]     = useState(false)
  const [roundResults, setRoundResults] = useState<RoundResult[]>([])

  const traveller    = TRAVELLERS[Math.min(currentRound, 4)]
  const currencyInfo = CURRENCIES.find(c => c.code === traveller.currency)!
  const rates        = allRates[currentRound] ?? {}
  const currentRate  = rates[traveller.currency] ?? currencyInfo.baseRate
  const pctDiff      = (currentRate - currencyInfo.baseRate) / currencyInfo.baseRate * 100
  const estProfit    = exchangeAmt * (currentRate / currencyInfo.baseRate - 1)
  const totalProfit  = euros - 1000
  const TravellerIcon = traveller.Icon

  const rateStatus = pctDiff > 1 ? 'favorable' : pctDiff < -1 ? 'unfavorable' : 'neutral'

  function handleStart() {
    setAllRates(Array.from({ length: 5 }, generateRatesForRound))
    setStarted(true)
  }

  function advance(result: RoundResult) {
    setRoundResults(prev => [...prev, result])
    if (currentRound >= 4) {
      setGameOver(true)
    } else {
      setCurrentRound(r => r + 1)
      setExchangeAmt(200)
      setShowRates(false)
    }
  }

  function handleBuy() {
    const profit = exchangeAmt * (currentRate / currencyInfo.baseRate - 1)
    setEuros(e => e + profit)
    advance({
      round: currentRound + 1,
      traveller: traveller.name,
      currency: traveller.currency,
      action: 'buy',
      rate: currentRate,
      baseRate: currencyInfo.baseRate,
      amount: exchangeAmt,
      profit,
    })
  }

  function handleSkip() {
    advance({
      round: currentRound + 1,
      traveller: traveller.name,
      currency: traveller.currency,
      action: 'skip',
      rate: currentRate,
      baseRate: currencyInfo.baseRate,
      amount: 0,
      profit: 0,
    })
  }

  function handleReset() {
    setStarted(false)
    setCurrentRound(0)
    setEuros(1000)
    setAllRates([])
    setExchangeAmt(200)
    setShowRates(false)
    setGameOver(false)
    setRoundResults([])
  }

  // Results
  const finalEuros   = euros
  const finalProfit  = finalEuros - 1000
  const finalPct     = (finalProfit / 1000) * 100
  const trades       = roundResults.filter(r => r.action === 'buy')
  const bestTrade    = trades.length ? trades.reduce((a, b) => b.profit > a.profit ? b : a) : null
  const worstTrade   = trades.length ? trades.reduce((a, b) => b.profit < a.profit ? b : a) : null
  const chartData    = roundResults.map(r => ({ name: `R${r.round}`, profit: parseFloat(r.profit.toFixed(2)) }))
  const perfMsg = finalProfit > 100
    ? 'Brilliant trader! You spotted favorable rates and maximized every opportunity.'
    : finalProfit >= 50
    ? 'Solid trading! You made consistent profits by reading the rates well.'
    : finalProfit >= 0
    ? 'Small profit — you played it safe. Taking more positions could have earned more.'
    : 'Currency trading is trickier than it looks! Watch for rates above the base rate — those are your best opportunities.'

  const fmt = (code: string, rate: number) => {
    const c = CURRENCIES.find(x => x.code === code)!
    return rate.toFixed(c.decimals)
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconCurrencyEuro size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
        />
        {isCompleted && (
          <Chip label="Completed" size="small" sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600, fontSize: 11 }} />
        )}
      </Stack>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.25 }}>
        Currency Trader
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2 }}>
        Run your airport currency exchange booth
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
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'white', lineHeight: 1 }}>
                  {i + 1}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6, pt: 0.2 }}>
                {step}
              </Typography>
            </Stack>
          ))}
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1D9E75', mt: 1.5, mb: 2, textAlign: 'center' }}>
            You start with €1,000. Make as much as possible!
          </Typography>
          <Button
            fullWidth variant="contained" onClick={handleStart}
            endIcon={<IconArrowRight size={18} strokeWidth={1.5} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25, bgcolor: '#1D9E75', '&:hover': { bgcolor: '#178a62' } }}
          >
            Start Game
          </Button>
        </Box>

      ) : !gameOver ? (
        /* ── ACTIVE GAME ────────────────────────── */
        <>
          {/* Progress */}
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
              Round {currentRound + 1} of 5
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled' }}>
              {5 - currentRound - 1} travellers left
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(currentRound / 5) * 100}
            sx={{ mb: 2, height: 4, borderRadius: 2, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, var(--teal-100), #1D9E75)', borderRadius: 2 } }}
          />

          {/* Portfolio bar */}
          <Box sx={{ p: 1.75, borderRadius: '10px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <IconWallet size={18} strokeWidth={1.5} color="#1D9E75" />
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--teal-600)', fontWeight: 600 }}>
                  Your Balance
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1 }}>
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#1D9E75', lineHeight: 1.2 }}>
                    €{euros.toFixed(2)}
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: totalProfit >= 0 ? '#1D9E75' : '#DC2626' }}>
                    {totalProfit >= 0 ? '+' : ''}€{totalProfit.toFixed(2)} so far
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Traveller card */}
          <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: 'white', mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TravellerIcon size={24} strokeWidth={1.5} color="#555" />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', mb: 0.125 }}>
                  Arriving now
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
                  A {traveller.name.toLowerCase()} arrives!
                </Typography>
              </Box>
            </Stack>

            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', mb: 1.5 }}>
              They want to exchange{' '}
              <strong style={{ color: '#1D1D1D' }}>€{exchangeAmt}</strong>
              {' '}into{' '}
              <strong style={{ color: '#1D1D1D' }}>{currencyInfo.code} ({currencyInfo.name})</strong>
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
              <Box sx={{ p: 1.25, borderRadius: '8px', bgcolor: '#f9f9f9', border: '1px solid #e8e8e8' }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'text.disabled', mb: 0.25, fontWeight: 700, letterSpacing: '0.5px' }}>
                  TODAY'S RATE
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                  €1 = {currencyInfo.symbol}{fmt(traveller.currency, currentRate)}
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: '8px', bgcolor: '#f9f9f9', border: '1px solid #e8e8e8' }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'text.disabled', mb: 0.25, fontWeight: 700, letterSpacing: '0.5px' }}>
                  BASE RATE (normal)
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'text.secondary' }}>
                  €1 = {currencyInfo.symbol}{fmt(traveller.currency, currencyInfo.baseRate)}
                </Typography>
              </Box>
            </Box>

            {/* Rate indicator */}
            {rateStatus === 'favorable' && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 1.25, borderRadius: '8px', bgcolor: '#d1fae5', border: '1px solid #6ee7b7' }}>
                <IconTrendingUp size={18} strokeWidth={1.5} color="#1D9E75" style={{ flexShrink: 0 }} />
                <Box>
                  <Chip label="FAVORABLE RATE" size="small" sx={{ bgcolor: '#1D9E75', color: 'white', fontWeight: 700, fontSize: 10, height: 18, mb: 0.5 }} />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>
                    Better than usual — consider trading! (+{pctDiff.toFixed(1)}%)
                  </Typography>
                </Box>
              </Stack>
            )}
            {rateStatus === 'unfavorable' && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 1.25, borderRadius: '8px', bgcolor: '#fee2e2', border: '1px solid #fca5a5' }}>
                <IconTrendingDown size={18} strokeWidth={1.5} color="#DC2626" style={{ flexShrink: 0 }} />
                <Box>
                  <Chip label="UNFAVORABLE RATE" size="small" sx={{ bgcolor: '#DC2626', color: 'white', fontWeight: 700, fontSize: 10, height: 18, mb: 0.5 }} />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                    Worse than usual — maybe skip this one ({pctDiff.toFixed(1)}%)
                  </Typography>
                </Box>
              </Stack>
            )}
            {rateStatus === 'neutral' && (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, p: 1.25, borderRadius: '8px', bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                <IconMinus size={18} strokeWidth={1.5} color="#888" style={{ flexShrink: 0 }} />
                <Box>
                  <Chip label="NEUTRAL RATE" size="small" sx={{ bgcolor: '#888', color: 'white', fontWeight: 700, fontSize: 10, height: 18, mb: 0.5 }} />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#555', fontWeight: 600 }}>
                    About average — small profit possible ({pctDiff >= 0 ? '+' : ''}{pctDiff.toFixed(1)}%)
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>

          {/* Amount slider */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', mb: 0.25 }}>
              Exchange amount
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1D9E75', mb: 0.5 }}>
              €{exchangeAmt}
            </Typography>
            <Slider
              value={exchangeAmt} min={50} max={200} step={50}
              marks={[{ value: 50, label: '€50' }, { value: 100, label: '€100' }, { value: 150, label: '€150' }, { value: 200, label: '€200' }]}
              valueLabelDisplay="off"
              onChange={(_, v) => setExchangeAmt(Array.isArray(v) ? v[0] : v)}
              sx={{ color: '#1D9E75' }}
            />
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              You'll receive{' '}
              <strong>{(exchangeAmt * currentRate).toFixed(currencyInfo.decimals)} {currencyInfo.code}</strong>
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, mt: 0.5, color: estProfit >= 0 ? '#1D9E75' : '#DC2626' }}>
              Estimated {estProfit >= 0 ? 'profit' : 'loss'}: {estProfit >= 0 ? '+' : ''}€{estProfit.toFixed(2)}
            </Typography>
          </Box>

          {/* BUY / SKIP */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Button
              variant="contained" onClick={handleBuy}
              sx={{ bgcolor: '#1D9E75', borderRadius: '12px', textTransform: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, py: 1.5, '&:hover': { bgcolor: '#178a62' } }}
            >
              Exchange €{exchangeAmt} → {traveller.currency}
            </Button>
            <Button
              variant="outlined" onClick={handleSkip}
              sx={{ borderRadius: '12px', textTransform: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, py: 1.5, borderColor: '#ccc', color: '#666', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bbb' } }}
            >
              Skip this traveller
            </Button>
          </Box>

          {/* Collapsible rates table */}
          <Button
            fullWidth variant="text" onClick={() => setShowRates(s => !s)}
            endIcon={showRates ? <IconChevronUp size={16} strokeWidth={1.5} /> : <IconChevronDown size={16} strokeWidth={1.5} />}
            sx={{ textTransform: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', justifyContent: 'space-between', px: 0.5, mb: 0.5 }}
          >
            See all current rates
          </Button>
          {showRates && (
            <Box sx={{ borderRadius: '10px', border: '1px solid var(--border, #E0E0E0)', overflow: 'hidden', mb: 1 }}>
              {/* Header row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 72px', gap: 0, bgcolor: '#f9f9f9', px: 1.5, py: 0.75, borderBottom: '1px solid #f0f0f0' }}>
                {['Code', "Today's", 'Base', 'Diff'].map(h => (
                  <Typography key={h} sx={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'text.disabled', letterSpacing: '0.5px' }}>
                    {h.toUpperCase()}
                  </Typography>
                ))}
              </Box>
              {CURRENCIES.map(c => {
                const r    = (allRates[currentRound] ?? {})[c.code] ?? c.baseRate
                const diff = (r - c.baseRate) / c.baseRate * 100
                return (
                  <Box key={c.code} sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 72px', px: 1.5, py: 0.875, borderBottom: '1px solid #f7f7f7', '&:last-child': { borderBottom: 'none' }, bgcolor: c.code === traveller.currency ? 'var(--teal-50)' : 'white' }}>
                    <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>{c.code}</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>{r.toFixed(c.decimals)}</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled' }}>{c.baseRate.toFixed(c.decimals)}</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: diff > 0 ? '#1D9E75' : '#DC2626' }}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          )}
        </>

      ) : (
        /* ── RESULTS ────────────────────────────── */
        <>
          {/* Results card */}
          <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa', mb: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.75 }}>
              <IconTargetArrow size={20} strokeWidth={1.5} color="#7C3AED" />
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                Game Over!
              </Typography>
            </Stack>
            {([
              { label: 'Starting balance', value: '€1,000.00',                                                          color: 'text.primary'   },
              { label: 'Final balance',    value: `€${finalEuros.toFixed(2)}`,                                          color: finalProfit >= 0 ? '#1D9E75' : '#DC2626' },
              { label: 'Total profit',     value: `${finalProfit >= 0 ? '+' : ''}€${finalProfit.toFixed(2)} (${finalProfit >= 0 ? '+' : ''}${finalPct.toFixed(1)}%)`, color: finalProfit >= 0 ? '#1D9E75' : '#DC2626' },
              ...(bestTrade  ? [{ label: 'Best trade',  value: `Round ${bestTrade.round}: ${bestTrade.currency} +€${bestTrade.profit.toFixed(2)}`,   color: '#1D9E75' }] : []),
              ...(worstTrade && worstTrade.profit < 0 ? [{ label: 'Worst trade', value: `Round ${worstTrade.round}: ${worstTrade.currency} €${worstTrade.profit.toFixed(2)}`, color: '#DC2626' }] : []),
            ] as const).map(({ label, value, color }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Bar chart */}
          {chartData.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled', fontWeight: 700, letterSpacing: '0.5px', mb: 1 }}>
                PROFIT / LOSS PER ROUND
              </Typography>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tickFormatter={v => `€${v}`} tick={{ fontSize: 11 }} width={44} />
                  <Tooltip formatter={(v: unknown) => [`€${Number(v).toFixed(2)}`, 'Profit']} />
                  <ReferenceLine y={0} stroke="#ccc" />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.profit >= 0 ? '#1D9E75' : '#DC2626'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Transaction history */}
          <Box sx={{ mb: 2, borderRadius: '10px', border: '1px solid var(--border, #E0E0E0)', overflow: 'hidden' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '36px 1fr 72px 64px 64px', px: 1.5, py: 0.75, bgcolor: '#f9f9f9', borderBottom: '1px solid #f0f0f0' }}>
              {['#', 'Traveller', 'Currency', 'Rate', 'Profit'].map(h => (
                <Typography key={h} sx={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700, color: 'text.disabled', letterSpacing: '0.5px' }}>
                  {h}
                </Typography>
              ))}
            </Box>
            {roundResults.map((r, i) => {
              const c = CURRENCIES.find(x => x.code === r.currency)!
              return (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '36px 1fr 72px 64px 64px', px: 1.5, py: 0.875, borderBottom: '1px solid #f7f7f7', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled' }}>{r.round}</Typography>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>{r.traveller}</Typography>
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>{r.currency}</Typography>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>
                    {r.action === 'buy' ? r.rate.toFixed(c.decimals) : '—'}
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: r.action === 'skip' ? 'text.disabled' : r.profit >= 0 ? '#1D9E75' : '#DC2626' }}>
                    {r.action === 'skip' ? 'Skipped' : `${r.profit >= 0 ? '+' : ''}€${r.profit.toFixed(2)}`}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          {/* Performance message */}
          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#f9f9f9', border: '1px solid #e8e8e8' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.65, color: 'text.primary' }}>
              {perfMsg}
            </Typography>
          </Box>

          {/* Insight */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--teal-600)', lineHeight: 1.65 }}>
              Real forex traders make millions of these micro-trades every day. The global forex market trades over $7 trillion daily — the largest market in the world.
            </Typography>
          </Box>

          <Stack sx={{ gap: 1.5 }}>
            <Button
              fullWidth variant="contained" onClick={onComplete} disabled={isCompleted}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25, bgcolor: '#3AAFA9', '&:hover': { bgcolor: '#2e9a94' }, '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' } }}
            >
              {isCompleted ? 'Already completed' : 'Got it! I understand forex. +20 XP'}
            </Button>
            <Button
              fullWidth variant="outlined" onClick={handleReset}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25, borderColor: '#1D9E75', color: '#1D9E75', '&:hover': { bgcolor: 'var(--teal-50)', borderColor: '#1D9E75' } }}
            >
              Play Again
            </Button>
          </Stack>
        </>
      )}
    </Box>
  )
}
