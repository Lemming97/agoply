import { useState, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconCurrencyBitcoin, IconShoppingCart, IconArrowUpRight, IconArrowDownRight,
  IconArrowRight, IconArrowDown, IconTargetArrow, IconWallet,
} from '@tabler/icons-react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine,
} from 'recharts'

interface Props {
  isCompleted: boolean
  onComplete: () => void
}

const PRICE_DATA = [
  { day: 1,  price: 1000 },
  { day: 2,  price: 1180 },
  { day: 3,  price: 1420 },
  { day: 4,  price: 1350 },
  { day: 5,  price: 1680 },
  { day: 6,  price: 2100 },
  { day: 7,  price: 1850 },
  { day: 8,  price: 1400 },
  { day: 9,  price: 900  },
  { day: 10, price: 650  },
  { day: 11, price: 780  },
  { day: 12, price: 1100 },
  { day: 13, price: 1450 },
  { day: 14, price: 1900 },
  { day: 15, price: 2400 },
  { day: 16, price: 2100 },
  { day: 17, price: 1600 },
  { day: 18, price: 1200 },
  { day: 19, price: 800  },
  { day: 20, price: 950  },
]

const HOW_TO_STEPS = [
  'You start with €1,000 cash',
  'Watch the Bitcoin price change each day',
  'BUY Bitcoin when price is low',
  'SELL Bitcoin when price is high',
  'After 20 days, see your profit',
]

type Transaction = {
  day: number
  type: 'buy' | 'sell'
  btcAmount: number
  cashAmount: number
  price: number
}

const BEST_BUY  = PRICE_DATA.reduce((min, d) => d.price < min.price ? d : min, PRICE_DATA[0])
const BEST_SELL = PRICE_DATA.reduce((max, d) => d.price > max.price ? d : max, PRICE_DATA[0])

export default function CryptoRollercoaster({ isCompleted, onComplete }: Props) {
  const [started,      setStarted]      = useState(false)
  const [showHint,     setShowHint]     = useState(false)
  const [dayIndex,     setDayIndex]     = useState(0)
  const [cash,         setCash]         = useState(1000)
  const [btcHeld,      setBtcHeld]      = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [gameOver,     setGameOver]     = useState(false)
  const [flashDir,     setFlashDir]     = useState<'up' | 'down' | null>(null)
  const [toast,        setToast]        = useState<string | null>(null)
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPoint   = PRICE_DATA[dayIndex]
  const currentPrice   = currentPoint.price
  const prevPrice      = dayIndex > 0 ? PRICE_DATA[dayIndex - 1].price : null
  const priceChange    = prevPrice !== null ? currentPrice - prevPrice : 0
  const priceChangePct = prevPrice !== null ? (priceChange / prevPrice) * 100 : 0
  const totalValue     = cash + btcHeld * currentPrice
  const chartData      = PRICE_DATA.slice(0, dayIndex + 1)
  const isLastDay      = dayIndex === PRICE_DATA.length - 1

  const holdingBtc  = btcHeld > 0 && cash === 0
  const holdingCash = cash > 0 && btcHeld === 0

  function flash(dir: 'up' | 'down') {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    setFlashDir(dir)
    flashTimeoutRef.current = setTimeout(() => setFlashDir(null), 600)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleStart() {
    setStarted(true)
    setShowHint(true)
  }

  function handleNextDay() {
    setShowHint(false)
    if (isLastDay) {
      setGameOver(true)
      return
    }
    const next = dayIndex + 1
    flash(PRICE_DATA[next].price >= currentPrice ? 'up' : 'down')
    setDayIndex(next)
  }

  function handleBuy() {
    if (cash < currentPrice * 0.01) return
    setShowHint(false)
    const btcBought = cash / currentPrice
    setTransactions(t => [...t, { day: currentPoint.day, type: 'buy', btcAmount: btcBought, cashAmount: cash, price: currentPrice }])
    showToast(`Bought ${btcBought.toFixed(4)} BTC at €${currentPrice.toLocaleString()}`)
    setBtcHeld(btcHeld + btcBought)
    setCash(0)
  }

  function handleSell() {
    if (btcHeld === 0) return
    const cashReceived = btcHeld * currentPrice
    setTransactions(t => [...t, { day: currentPoint.day, type: 'sell', btcAmount: btcHeld, cashAmount: cashReceived, price: currentPrice }])
    showToast(`Sold all BTC for €${cashReceived.toFixed(2)}`)
    setCash(cash + cashReceived)
    setBtcHeld(0)
  }

  function handleReset() {
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current)
    setStarted(false)
    setShowHint(false)
    setDayIndex(0)
    setCash(1000)
    setBtcHeld(0)
    setTransactions([])
    setGameOver(false)
    setFlashDir(null)
    setToast(null)
  }

  const finalReturn = ((totalValue - 1000) / 1000) * 100

  const performanceMsg = totalValue > 1800
    ? 'Incredible timing! You bought the dip and sold near the peak. Real crypto traders dream of returns like this.'
    : totalValue >= 1200
    ? 'Nice work! You made a profit but missed some of the bigger swings.'
    : totalValue >= 1000
    ? 'You beat holding cash — but just barely. Timing crypto is harder than it looks!'
    : 'Crypto got you this time. This is why volatility is so dangerous — even experienced traders lose money.'

  const totalColor = totalValue > 1000 ? '#1D9E75' : totalValue < 1000 ? '#DC2626' : 'text.secondary'

  const renderDot = (props: Record<string, unknown>) => {
    const { cx, cy, index } = props as { cx: number; cy: number; index: number }
    if (index !== chartData.length - 1) return <circle key={index} cx={cx} cy={cy} r={0} />
    return <circle key={index} cx={cx} cy={cy} r={6} fill="#1D9E75" stroke="white" strokeWidth={2} />
  }

  return (
    <Box>
      {/* Header — always visible */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconCurrencyBitcoin size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
        />
        {isCompleted && (
          <Chip label="Completed" size="small" sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600, fontSize: 11 }} />
        )}
      </Stack>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.25 }}>
        Crypto Rollercoaster
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2 }}>
        Buy low, sell high — if you can time it right
      </Typography>

      {/* ── HOW TO PLAY ─────────────────────────────────── */}
      {!started ? (
        <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, mb: 2 }}>
            How to Play
          </Typography>

          {HOW_TO_STEPS.map((step, i) => (
            <Stack key={i} direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, mb: 1.25 }}>
              <Box sx={{
                width: 24, height: 24, borderRadius: '50%', bgcolor: '#1D9E75',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'white', lineHeight: 1 }}>
                  {i + 1}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.6, pt: 0.2, color: 'text.primary' }}>
                {step}
              </Typography>
            </Stack>
          ))}

          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#1D9E75', mt: 1.5, mb: 2, textAlign: 'center' }}>
            Goal: end with more than €1,000!
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleStart}
            endIcon={<IconArrowRight size={18} strokeWidth={1.5} />}
            sx={{
              borderRadius: '10px', textTransform: 'none', fontWeight: 700,
              fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25,
              bgcolor: '#1D9E75', '&:hover': { bgcolor: '#178a62' },
            }}
          >
            Start Game
          </Button>
        </Box>

      ) : (
        /* ── ACTIVE GAME ────────────────────────────────── */
        <>
          {/* Toast */}
          {toast && (
            <Box sx={{ mb: 1.5, px: 2, py: 0.75, borderRadius: '8px', bgcolor: '#1D1D1D', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'white' }}>{toast}</Typography>
            </Box>
          )}

          {/* Stats bar */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
            {([
              { label: 'Cash',  value: `€${cash === 0 ? '0.00' : cash.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text.primary' },
              { label: 'BTC',   value: `${btcHeld.toFixed(4)} BTC`, color: '#F7931A' },
              { label: 'Total', value: `€${totalValue.toFixed(2)}`, color: totalColor },
            ] as const).map(({ label, value, color }) => (
              <Box key={label} sx={{ p: 1.25, borderRadius: '10px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa', textAlign: 'center' }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'text.disabled', mb: 0.25 }}>{label}</Typography>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Current price display */}
          <Box sx={{
            textAlign: 'center', mb: 1.5, py: 1.5, borderRadius: '12px',
            transition: 'background-color 0.3s',
            bgcolor: flashDir === 'up' ? '#d1fae5' : flashDir === 'down' ? '#fee2e2' : 'transparent',
          }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', mb: 0.25 }}>
              Day {currentPoint.day} of 20
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1.2 }}>
              €{currentPrice.toLocaleString()}
            </Typography>
            {dayIndex > 0 && (
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.25 }}>
                {priceChange >= 0
                  ? <IconArrowUpRight size={16} strokeWidth={1.5} color="#1D9E75" />
                  : <IconArrowDownRight size={16} strokeWidth={1.5} color="#DC2626" />
                }
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: priceChange >= 0 ? '#1D9E75' : '#DC2626' }}>
                  {priceChange >= 0 ? '+' : ''}€{Math.abs(priceChange).toLocaleString()} ({priceChange >= 0 ? '+' : ''}{priceChangePct.toFixed(1)}%)
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cryptoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tickFormatter={v => `€${v}`} tick={{ fontSize: 11 }} width={52} domain={[400, 2600]} />
              <Tooltip
                formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, 'BTC Price']}
                labelFormatter={l => `Day ${l}`}
              />
              {/* Starting price reference line */}
              <ReferenceLine
                y={1000}
                stroke="#94a3b8"
                strokeDasharray="4 3"
                label={{ value: 'Your start', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }}
              />
              <Area type="monotone" dataKey="price" fill="url(#cryptoAreaGrad)" stroke="none" isAnimationActive={false} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#1D9E75"
                strokeWidth={2.5}
                dot={renderDot as any}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              {/* Buy / Sell markers */}
              {transactions.map((tx, i) => (
                <ReferenceDot
                  key={i}
                  x={tx.day}
                  y={tx.price}
                  r={6}
                  fill={tx.type === 'buy' ? '#1D9E75' : '#DC2626'}
                  stroke="white"
                  strokeWidth={1.5}
                  label={{ value: tx.type === 'buy' ? 'B' : 'S', position: 'top', fill: tx.type === 'buy' ? '#1D9E75' : '#DC2626', fontSize: 10, fontWeight: 700 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Buy / Sell + Next Day buttons */}
          {!gameOver && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>

              {/* Fix 3 — Status pill */}
              {holdingBtc ? (
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 1.5, py: 0.875, borderRadius: '8px', bgcolor: '#FFF8E1', border: '1px solid #FFB300' }}>
                  <IconCurrencyBitcoin size={16} strokeWidth={1.5} color="#FFB300" style={{ flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#9A6F00' }}>
                    Holding {btcHeld.toFixed(4)} BTC worth €{(btcHeld * currentPrice).toFixed(2)} — tap SELL to cash out
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 1.5, py: 0.875, borderRadius: '8px', bgcolor: 'white', border: '1px solid #1D9E75' }}>
                  <IconWallet size={16} strokeWidth={1.5} color="#1D9E75" style={{ flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#1D9E75' }}>
                    Holding €{cash.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cash — tap BUY to invest
                  </Typography>
                </Stack>
              )}

              {/* Fix 4 — Day 1 hint arrow */}
              {showHint && (
                <Stack direction="row" sx={{
                  alignItems: 'center', justifyContent: 'center', gap: 0.5,
                  '@keyframes cryptoHintPulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.35 },
                  },
                  animation: 'cryptoHintPulse 1.2s ease-in-out infinite',
                }}>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--teal-600)' }}>
                    Start by buying Bitcoin!
                  </Typography>
                  <IconArrowDown size={16} strokeWidth={1.5} color="var(--teal-400)" />
                </Stack>
              )}

              {/* Fix 2 — BUY / SELL with contextual labels */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {/* BUY column */}
                <Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleBuy}
                    disabled={cash < currentPrice * 0.01}
                    sx={{
                      bgcolor: '#1D9E75', borderRadius: '12px', textTransform: 'none',
                      fontFamily: 'var(--font-body)', py: 1.5,
                      '&:hover': { bgcolor: '#178a62' },
                      '&.Mui-disabled': { bgcolor: '#d1fae5', color: '#6ee7b7' },
                      flexDirection: 'column', gap: 0.25,
                    }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                      <IconShoppingCart size={18} strokeWidth={1.5} />
                      <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'inherit' }}>
                        BUY Bitcoin
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                      at €{currentPrice.toLocaleString()}
                    </Typography>
                  </Button>
                  {(holdingBtc || holdingCash) && (
                    <Typography sx={{
                      fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: 1.45, mt: 0.75, textAlign: 'center',
                      color: holdingBtc ? 'text.disabled' : '#1D9E75',
                    }}>
                      {holdingBtc
                        ? "You're all in on Bitcoin — sell first to free up cash"
                        : `Spend your €${Math.round(cash).toLocaleString()} to buy Bitcoin now`
                      }
                    </Typography>
                  )}
                </Box>

                {/* SELL column */}
                <Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSell}
                    disabled={btcHeld === 0}
                    sx={{
                      bgcolor: '#DC2626', borderRadius: '12px', textTransform: 'none',
                      fontFamily: 'var(--font-body)', py: 1.5,
                      '&:hover': { bgcolor: '#c02020' },
                      '&.Mui-disabled': { bgcolor: '#fee2e2', color: '#fca5a5' },
                      flexDirection: 'column', gap: 0.25,
                    }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                      <IconCurrencyBitcoin size={18} strokeWidth={1.5} />
                      <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'inherit' }}>
                        SELL Bitcoin
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                      at €{currentPrice.toLocaleString()}
                    </Typography>
                  </Button>
                  {(holdingBtc || holdingCash) && (
                    <Typography sx={{
                      fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: 1.45, mt: 0.75, textAlign: 'center',
                      color: holdingBtc ? '#DC2626' : 'text.disabled',
                    }}>
                      {holdingBtc
                        ? 'Sell your Bitcoin to take profits or cut losses'
                        : "You don't own any Bitcoin to sell"
                      }
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Next Day button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleNextDay}
                endIcon={<IconArrowRight size={18} strokeWidth={1.5} />}
                sx={{
                  borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                  fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25,
                  borderColor: '#1D9E75', color: '#1D9E75', bgcolor: 'white',
                  '&:hover': { bgcolor: 'var(--teal-50)', borderColor: '#1D9E75' },
                }}
              >
                {isLastDay ? 'See Results' : `Next → Day ${currentPoint.day + 1}`}
              </Button>
            </Box>
          )}

          {/* Transaction log */}
          {transactions.length > 0 && (
            <Box sx={{ mt: 2, maxHeight: 110, overflowY: 'auto' }}>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'text.disabled', mb: 0.75, fontWeight: 700, letterSpacing: '0.6px' }}>
                TRANSACTION LOG
              </Typography>
              {transactions.map((tx, i) => (
                <Typography key={i} sx={{ fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.9, color: tx.type === 'buy' ? '#1D9E75' : '#DC2626' }}>
                  Day {tx.day}: {tx.type === 'buy'
                    ? `Bought ${tx.btcAmount.toFixed(4)} BTC at €${tx.price.toLocaleString()}`
                    : `Sold all BTC for €${tx.cashAmount.toFixed(2)}`
                  }
                </Typography>
              ))}
            </Box>
          )}

          {/* Results screen */}
          {gameOver && (
            <>
              <Box sx={{ mt: 2.5, p: 2, borderRadius: '12px', border: '1px solid var(--border, #E0E0E0)', bgcolor: '#fafafa' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <IconTargetArrow size={20} strokeWidth={1.5} color="#7C3AED" />
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
                    Game Over — Final Results
                  </Typography>
                </Stack>
                {([
                  { label: 'Starting amount',       value: '€1,000',                                                        color: 'text.primary'   },
                  { label: 'Final portfolio',        value: `€${totalValue.toFixed(2)}`,                                    color: totalColor        },
                  { label: 'Return',                 value: `${finalReturn >= 0 ? '+' : ''}${finalReturn.toFixed(1)}%`,     color: totalColor        },
                  { label: 'Benchmark (hold cash)',  value: '€1,000  (0%)',                                                 color: 'text.secondary'  },
                  { label: 'Best buy opportunity',   value: `Day ${BEST_BUY.day}  (€${BEST_BUY.price})`,                   color: '#1D9E75'         },
                  { label: 'Best sell opportunity',  value: `Day ${BEST_SELL.day}  (€${BEST_SELL.price.toLocaleString()})`, color: '#DC2626'         },
                ] as const).map(({ label, value, color }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
                    <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color }}>{value}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '10px', bgcolor: '#f9f9f9', border: '1px solid #e8e8e8' }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.65, color: 'text.primary' }}>
                  {performanceMsg}
                </Typography>
              </Box>

              <Box sx={{ mt: 1.5, mb: 2, p: 1.5, borderRadius: '10px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)' }}>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--teal-600)', lineHeight: 1.65 }}>
                  This is why crypto is HIGH RISK. The price swung from €650 to €2,400 in this simulation — a 269% range. Real Bitcoin has been even more extreme.
                </Typography>
              </Box>

              <Stack sx={{ gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={onComplete}
                  disabled={isCompleted}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                    fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25,
                    bgcolor: '#3AAFA9', '&:hover': { bgcolor: '#2e9a94' },
                    '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' },
                  }}
                >
                  {isCompleted ? 'Already completed' : 'Got it! Volatility is real. +20 XP'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleReset}
                  sx={{
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                    fontFamily: 'var(--font-body)', fontSize: 14, py: 1.25,
                    borderColor: '#1D9E75', color: '#1D9E75',
                    '&:hover': { bgcolor: 'var(--teal-50)', borderColor: '#1D9E75' },
                  }}
                >
                  Play Again
                </Button>
              </Stack>
            </>
          )}
        </>
      )}
    </Box>
  )
}
