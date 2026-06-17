import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconBuildingBank, IconArrowUp, IconArrowDown, IconMinus,
  IconTrendingUp, IconBrain, IconWallet, IconShoppingCart,
  IconPlayerPause, IconCurrencyDollar, IconCircleCheck,
  IconCircleX, IconRobot, IconChevronRight,
} from '@tabler/icons-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import LottieAnimation from '../LottieAnimation'
import TrophyWinner from '../../assets/animations/Trophy_Winner.json'
import Champion from '../../assets/animations/Champion.json'
import Thinking from '../../assets/animations/Thinking.json'

interface Props { isCompleted: boolean; onComplete: () => void }

type RateDecision = 'RAISE' | 'CUT' | 'HOLD'
type Phase = 'howtoplay' | 'predict' | 'announce' | 'trade' | 'roundresult' | 'final'

interface EcbRound {
  round: number
  headline: string
  hint: string
  rateDecision: RateDecision
  rateChange: number
  bondPriceChange: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  explanation: string
}

interface RoundResult {
  round: number
  rateDecision: RateDecision
  ratePrediction: RateDecision | null
  pricePrediction: 'UP' | 'DOWN' | null
  bothCorrect: boolean
  predictionPts: number
  tradeDecision: 'BUY' | 'HOLD' | 'SELL' | null
  tradingPnl: number
  portfolioAfter: number
}

const ECB_ROUNDS: EcbRound[] = [
  {
    round: 1,
    headline: "Inflation hits 8.5% across the Eurozone — highest in 40 years",
    hint: "Central banks fight inflation by raising rates",
    rateDecision: 'RAISE', rateChange: 0.5, bondPriceChange: -8, difficulty: 'EASY',
    explanation: "High inflation forces the ECB to raise rates to cool the economy. Higher rates = lower bond prices.",
  },
  {
    round: 2,
    headline: "Eurozone economy contracts for second consecutive quarter — recession fears grow",
    hint: "Central banks stimulate economies by cutting rates",
    rateDecision: 'CUT', rateChange: -0.25, bondPriceChange: 5, difficulty: 'EASY',
    explanation: "Recession fears push the ECB to cut rates to stimulate growth. Lower rates = higher bond prices.",
  },
  {
    round: 3,
    headline: "ECB President says inflation is 'transitory' — no immediate action needed",
    hint: "No rate change expected — but what does this signal for the future?",
    rateDecision: 'HOLD', rateChange: 0, bondPriceChange: 2, difficulty: 'MEDIUM',
    explanation: "Holding rates steady with dovish language slightly boosts bonds — markets read it as future cuts are possible.",
  },
  {
    round: 4,
    headline: "Surprise: US Federal Reserve raises rates by 0.75% — largest hike in 30 years",
    hint: "When the US raises rates, Europe often follows to protect the euro",
    rateDecision: 'RAISE', rateChange: 0.75, bondPriceChange: -12, difficulty: 'MEDIUM',
    explanation: "The ECB follows the Fed to prevent capital flowing out of Europe. A large rate hike causes a significant bond price drop.",
  },
  {
    round: 5,
    headline: "Oil prices crash 40% as OPEC members disagree on production cuts",
    hint: "Cheap oil reduces inflation pressure — what does that mean for rates?",
    rateDecision: 'CUT', rateChange: -0.5, bondPriceChange: 8, difficulty: 'HARD',
    explanation: "Falling oil prices reduce inflation, removing pressure to raise rates. ECB cuts rates to stimulate growth, pushing bond prices up.",
  },
  {
    round: 6,
    headline: "ECB signals 'higher for longer' rate strategy despite slowing growth",
    hint: "Keeping rates high despite slow growth is unusual — markets are uncertain",
    rateDecision: 'HOLD', rateChange: 0, bondPriceChange: -3, difficulty: 'HARD',
    explanation: "Holding rates high despite slow growth signals the ECB prioritizes inflation control. Markets price in longer pain — bonds dip slightly.",
  },
]

const LEVEL_COLOR   = '#1D9E75'
const BASE_BOND_PRICE = 1000
const STARTING_CASH = 10000

export default function BondsYieldCalculator({ isCompleted, onComplete }: Props) {
  const [phase,              setPhase]             = useState<Phase>('howtoplay')
  const [currentRound,       setCurrentRound]      = useState(0)
  const [cash,               setCash]              = useState(STARTING_CASH)
  const [bondsHeld,          setBondsHeld]         = useState(0)
  const [bondBuyPrice,       setBondBuyPrice]      = useState(0)
  const [currentBondPrice,   setCurrentBondPrice]  = useState(BASE_BOND_PRICE)
  const [animBondPrice,      setAnimBondPrice]     = useState(BASE_BOND_PRICE)
  const [predictTimer,       setPredictTimer]      = useState(5)
  const [tradeTimer,         setTradeTimer]        = useState(8)
  const [ratePrediction,     setRatePrediction]    = useState<RateDecision | null>(null)
  const [pricePrediction,    setPricePrediction]   = useState<'UP' | 'DOWN' | null>(null)
  const [tradeDecision,      setTradeDecision]     = useState<'BUY' | 'HOLD' | 'SELL' | null>(null)
  const [score,              setScore]             = useState(0)
  const [correctPredictions, setCorrectPredictions]= useState(0)
  const [streak,             setStreak]            = useState(0)
  const [bestStreak,         setBestStreak]        = useState(0)
  const [roundHistory,       setRoundHistory]      = useState<RoundResult[]>([])
  const [hintFlash,          setHintFlash]         = useState<string | null>(null)
  const [predictionResult,   setPredictionResult]  = useState<{ pts: number; both: boolean } | null>(null)
  const [roundPnl,           setRoundPnl]          = useState(0)
  const [timedOut,           setTimedOut]          = useState(false)

  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const predictStartRef = useRef(0)
  const advancedRef     = useRef(false)   // prevent double-advance

  function clearTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  // ── predict timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'predict') return
    predictStartRef.current = Date.now()
    advancedRef.current = false
    setPredictTimer(5)
    timerRef.current = setInterval(() => {
      setPredictTimer(t => {
        if (t <= 1) {
          clearTimer()
          if (!advancedRef.current) {
            advancedRef.current = true
            setTimedOut(true)
            // use functional updater to read latest state
            setRatePrediction(rp => {
              setPricePrediction(pp => {
                doAdvanceFromPredict(rp, pp, true)
                return pp
              })
              return rp
            })
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return clearTimer
  }, [phase, currentRound]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── trade timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'trade') return
    setTradeTimer(8)
    timerRef.current = setInterval(() => {
      setTradeTimer(t => {
        if (t <= 1) {
          clearTimer()
          commitTrade('HOLD')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return clearTimer
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── bond price animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'trade') return
    const target = currentBondPrice
    const start  = BASE_BOND_PRICE
    const dur    = 3000
    const t0     = Date.now()
    let raf = 0
    function tick() {
      const prog = Math.min(1, (Date.now() - t0) / dur)
      const ease = 1 - Math.pow(1 - prog, 3)
      setAnimBondPrice(Math.round(start + (target - start) * ease))
      if (prog < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, currentBondPrice])

  function doAdvanceFromPredict(
    rp: RateDecision | null,
    pp: 'UP' | 'DOWN' | null,
    timeout = false,
  ) {
    clearTimer()
    const ecb     = ECB_ROUNDS[currentRound]
    const elapsed = (Date.now() - predictStartRef.current) / 1000

    const rateOk  = rp === ecb.rateDecision
    const priceOk = pp === (ecb.bondPriceChange > 0 ? 'UP' : ecb.bondPriceChange < 0 ? 'DOWN' : null)
    const both    = rateOk && priceOk && pp !== null

    let pts = 0
    if (rateOk) pts += 15
    if (priceOk) pts += 15
    if (both) pts += 20
    if (pts > 0 && !timeout) {
      if (elapsed < 3)      pts += 10
      else if (elapsed < 4) pts += 5
    }

    setCorrectPredictions(prev => {
      const nc = (rateOk && priceOk) ? prev + 1 : prev
      setStreak(s => {
        const ns = (rateOk && priceOk) ? s + 1 : 0
        setBestStreak(b => Math.max(b, ns))
        if (ns === 3) pts += 15
        if (ns === 5) pts += 25
        return ns
      })
      return nc
    })

    setScore(s => s + pts)
    setPredictionResult({ pts, both })
    setTimedOut(timeout)

    const newBondPrice = Math.round(BASE_BOND_PRICE * (1 + ecb.bondPriceChange / 100))
    setCurrentBondPrice(newBondPrice)
    setAnimBondPrice(BASE_BOND_PRICE)

    setPhase('announce')
    setTimeout(() => setPhase('trade'), 2000)
  }

  function handleRatePrediction(r: RateDecision) {
    if (ratePrediction !== null) return
    setRatePrediction(r)
    const hint  =
      r === 'RAISE' ? 'Rates rising → bonds typically fall' :
      r === 'CUT'   ? 'Rates falling → bonds typically rise' :
                      'Rates held → small or no price movement'
    const color =
      r === 'RAISE' ? '#EF4444' : r === 'CUT' ? '#1D9E75' : '#888'
    setHintFlash(hint + '||' + color)
    setTimeout(() => setHintFlash(null), 1200)
  }

  function handlePricePrediction(pp: 'UP' | 'DOWN') {
    if (pricePrediction !== null || ratePrediction === null) return
    if (advancedRef.current) return
    advancedRef.current = true
    setPricePrediction(pp)
    clearTimer()
    doAdvanceFromPredict(ratePrediction, pp, false)
  }

  function commitTrade(decision: 'BUY' | 'HOLD' | 'SELL') {
    clearTimer()
    const ecb      = ECB_ROUNDS[currentRound]
    const newPrice = Math.round(BASE_BOND_PRICE * (1 + ecb.bondPriceChange / 100))

    let newCash  = cash
    let newBonds = bondsHeld
    let newBuyPx = bondBuyPrice
    let pnl      = 0

    if (decision === 'BUY' && bondsHeld === 0 && cash >= BASE_BOND_PRICE) {
      newBonds = Math.floor(cash / BASE_BOND_PRICE)
      newCash  = cash - newBonds * BASE_BOND_PRICE
      newBuyPx = BASE_BOND_PRICE
    } else if (decision === 'SELL' && bondsHeld > 0) {
      pnl      = bondsHeld * (newPrice - bondBuyPrice)
      newCash  = cash + bondsHeld * newPrice
      newBonds = 0
      newBuyPx = 0
    } else if (decision === 'HOLD' && bondsHeld > 0) {
      pnl = bondsHeld * (newPrice - bondBuyPrice)
    }

    const portfolioAfter = newCash + newBonds * newPrice
    const result: RoundResult = {
      round: currentRound + 1,
      rateDecision: ecb.rateDecision,
      ratePrediction,
      pricePrediction,
      bothCorrect: predictionResult?.both ?? false,
      predictionPts: predictionResult?.pts ?? 0,
      tradeDecision: decision,
      tradingPnl: pnl,
      portfolioAfter,
    }

    setCash(newCash)
    setBondsHeld(newBonds)
    setBondBuyPrice(newBuyPx)
    setTradeDecision(decision)
    setRoundPnl(pnl)
    setRoundHistory(prev => [...prev, result])
    setPhase('roundresult')
  }

  function nextRound() {
    const next = currentRound + 1
    if (next >= ECB_ROUNDS.length) {
      if (correctPredictions === 6) setScore(s => s + 50)
      setPhase('final')
      return
    }
    setCurrentRound(next)
    setRatePrediction(null)
    setPricePrediction(null)
    setTradeDecision(null)
    setPredictionResult(null)
    setTimedOut(false)
    setHintFlash(null)
    setAnimBondPrice(BASE_BOND_PRICE)
    setCurrentBondPrice(BASE_BOND_PRICE)
    advancedRef.current = false
    setPhase('predict')
  }

  function resetGame() {
    setCash(STARTING_CASH); setBondsHeld(0); setBondBuyPrice(0)
    setCurrentBondPrice(BASE_BOND_PRICE); setAnimBondPrice(BASE_BOND_PRICE)
    setCurrentRound(0); setScore(0); setCorrectPredictions(0)
    setStreak(0); setBestStreak(0); setRoundHistory([])
    setRatePrediction(null); setPricePrediction(null); setTradeDecision(null)
    setPredictionResult(null); setTimedOut(false); setHintFlash(null)
    advancedRef.current = false
    setPhase('howtoplay')
  }

  // ── derived ────────────────────────────────────────────────────────────────
  const ecb           = ECB_ROUNDS[currentRound]
  const portfolio     = cash + bondsHeld * animBondPrice
  const finalPort     = roundHistory.length > 0 ? roundHistory[roundHistory.length - 1].portfolioAfter : STARTING_CASH
  const portColor     = portfolio >= STARTING_CASH ? LEVEL_COLOR : '#EF4444'
  const timerPctP     = predictTimer / 5
  const timerPctT     = tradeTimer / 8
  const timerColorP   = timerPctP > 0.5 ? LEVEL_COLOR : timerPctP > 0.25 ? '#FF8C00' : '#EF4444'
  const timerColorT   = timerPctT > 0.5 ? LEVEL_COLOR : timerPctT > 0.25 ? '#FF8C00' : '#EF4444'
  const diffColor     = ecb?.difficulty === 'EASY' ? LEVEL_COLOR : ecb?.difficulty === 'MEDIUM' ? '#FF8C00' : '#EF4444'

  const chartData = [
    { r: 'Start', value: STARTING_CASH },
    ...roundHistory.map(r => ({ r: `R${r.round}`, value: r.portfolioAfter })),
  ]

  function perfMsg() {
    if (finalPort >= 13000 && correctPredictions >= 5)
      return "Bond market master! You predicted ECB moves AND traded them perfectly. Real fixed-income traders spend years learning what you just demonstrated."
    if (finalPort >= 11000)
      return "Solid bond trader! You made smart decisions and grew your portfolio. The inverse rate/price relationship is clearly clicking for you."
    if (finalPort >= 9000)
      return "You're getting there! Bond trading is tricky — the key insight is always: rates up = prices down. Keep that rule front of mind."
    return "Tough session! Bond markets humbled you this time. Remember: when the ECB raises rates, SELL bonds before prices fall. When they cut rates, BUY bonds before prices rise."
  }

  const lottieSrc = finalPort >= 12000 ? TrophyWinner : finalPort >= 10000 ? Champion : Thinking

  // ── sub-components ─────────────────────────────────────────────────────────
  const headerChip = (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: .5 }}>
      <Chip icon={<IconBuildingBank size={13} strokeWidth={1.5} />} label="Mini-Game" size="small"
        sx={{ bgcolor: `${LEVEL_COLOR}18`, color: LEVEL_COLOR, fontWeight: 700, fontSize: 10, height: 22 }} />
    </Stack>
  )

  function PortfolioBar() {
    return (
      <Box sx={{ mb: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: .4 }}>
          <Stack direction="row" sx={{ gap: .75, alignItems: 'center' }}>
            <IconWallet size={14} strokeWidth={1.5} color={portColor} />
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', color: 'text.secondary' }}>PORTFOLIO</Typography>
          </Stack>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: portColor }}>
            €{portfolio.toLocaleString()}{portfolio > STARTING_CASH ? ` (+€${(portfolio-STARTING_CASH).toLocaleString()})` : portfolio < STARTING_CASH ? ` (-€${(STARTING_CASH-portfolio).toLocaleString()})` : ''}
          </Typography>
        </Stack>
        <Box sx={{ height: 10, bgcolor: 'rgba(0,0,0,.08)', borderRadius: 5, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${Math.min(100, (portfolio/15000)*100)}%`, bgcolor: portColor, borderRadius: 5, transition: 'width .3s' }} />
        </Box>
      </Box>
    )
  }

  function ScoreRow() {
    return (
      <Stack direction="row" sx={{ gap: 1, mb: 1.5 }}>
        {[
          { label: `ROUND ${currentRound+1}/6`, val: ecb?.difficulty, c: diffColor },
          { label: 'SCORE',   val: score.toLocaleString(),         c: LEVEL_COLOR },
          { label: 'CORRECT', val: `${correctPredictions}/6`,      c: correctPredictions >= 4 ? LEVEL_COLOR : 'text.secondary' },
        ].map(s => (
          <Box key={s.label} sx={{ flex: 1, bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '10px', p: .75, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 9, color: 'text.secondary', fontWeight: 700, letterSpacing: '.5px' }}>{s.label}</Typography>
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, color: s.c }}>{s.val}</Typography>
          </Box>
        ))}
      </Stack>
    )
  }

  function TimerCircle({ pct, color, secs, label }: { pct: number; color: string; secs: number; label: string }) {
    const r = 22, circ = 2 * Math.PI * r
    return (
      <Stack sx={{ alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '.8px', color: 'text.secondary', mb: .5 }}>{label}</Typography>
        <Box sx={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={56} height={56} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle cx={28} cy={28} r={r} fill="none" stroke="#f0f0f0" strokeWidth={4} />
            <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset .9s linear, stroke .3s' }} />
          </svg>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color, zIndex: 1 }}>{secs}</Typography>
        </Box>
      </Stack>
    )
  }

  function HeadlineCard() {
    return (
      <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderLeft: '4px solid #FFB300', borderRadius: '12px', p: 2, mb: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '.8px', color: '#C2460A' }}>ECB WATCH · BREAKING NEWS</Typography>
          <Chip label={ecb.difficulty} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: `${diffColor}18`, color: diffColor }} />
        </Stack>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, lineHeight: 1.5, mb: 1.5 }}>
          "{ecb.headline}"
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic' }}>Hint: {ecb.hint}</Typography>
      </Box>
    )
  }

  // ── HOW TO PLAY ────────────────────────────────────────────────────────────
  if (phase === 'howtoplay') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>Bond Trader</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>Predict ECB decisions and trade bonds before prices move</Typography>

      <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '14px', p: 2.5, mb: 2 }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, mb: 2 }}>How to Play</Typography>

        {[
          { icon: <IconBrain size={20} strokeWidth={1.5} color="white" />, bg: '#7B5FD4', title: 'Phase 1 — Predict (5 seconds)', body: 'A news headline appears. Predict whether the ECB will raise, cut, or hold rates — and whether bond prices will go up or down.' },
          { icon: <IconTrendingUp size={20} strokeWidth={1.5} color="white" />, bg: LEVEL_COLOR, title: 'Phase 2 — Trade (8 seconds)', body: 'The ECB announces their decision. BUY bonds if prices are rising, SELL to lock in profits, or HOLD if you are unsure.' },
        ].map(s => (
          <Stack key={s.title} direction="row" sx={{ gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 13, mb: .4 }}>{s.title}</Typography>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.6 }}>{s.body}</Typography>
            </Box>
          </Stack>
        ))}

        <Box sx={{ bgcolor: 'white', border: `1.5px solid ${LEVEL_COLOR}`, borderRadius: '10px', p: 1.5, mb: 2.5 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: LEVEL_COLOR, mb: .5 }}>The Golden Rule</Typography>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.7 }}>
            Rates <strong>UP</strong> = Bond prices <strong style={{ color: '#EF4444' }}>DOWN</strong><br />
            Rates <strong>DOWN</strong> = Bond prices <strong style={{ color: LEVEL_COLOR }}>UP</strong>
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>6 rounds · Start with €10,000 · Beat €12,000 to win!</Typography>

        <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5} />}
          onClick={() => setPhase('predict')}
          sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#178a64' } }}>
          Start Trading
        </Button>
      </Box>
    </Box>
  )

  // ── PREDICT ────────────────────────────────────────────────────────────────
  if (phase === 'predict') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>Bond Trader</Typography>
      <PortfolioBar />
      <ScoreRow />
      <TimerCircle pct={timerPctP} color={timerColorP} secs={predictTimer} label="PREDICT NOW" />
      <HeadlineCard />

      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', letterSpacing: '.5px', mb: 1 }}>WHAT WILL THE ECB DO?</Typography>
      <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
        {(['RAISE', 'HOLD', 'CUT'] as RateDecision[]).map(r => {
          const selected = ratePrediction === r
          const bg = r === 'RAISE' ? '#EF4444' : r === 'HOLD' ? '#888' : LEVEL_COLOR
          const Icon = r === 'RAISE' ? IconArrowUp : r === 'HOLD' ? IconMinus : IconArrowDown
          return (
            <Button key={r} onClick={() => handleRatePrediction(r)} disabled={ratePrediction !== null}
              sx={{ flex: 1, flexDirection: 'column', gap: .4, py: 1.25, borderRadius: '10px', textTransform: 'none',
                bgcolor: selected ? bg : 'white', border: `1px solid ${bg}`, color: selected ? 'white' : bg,
                '&:hover': { bgcolor: `${bg}18`, border: `1px solid ${bg}` },
                '&.Mui-disabled': { opacity: .45 },
              }}>
              <Icon size={18} strokeWidth={1.5} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{r}</Typography>
              <Typography sx={{ fontSize: 9, opacity: .8 }}>Rates</Typography>
            </Button>
          )
        })}
      </Stack>

      {hintFlash && (() => {
        const [msg, color] = hintFlash.split('||')
        return (
          <Box sx={{ bgcolor: `${color}18`, border: `1px solid ${color}44`, borderRadius: '8px', p: 1, mb: 1.5, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color }}>{msg}</Typography>
          </Box>
        )
      })()}

      {ratePrediction !== null && !hintFlash && pricePrediction === null && !advancedRef.current && (
        <>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', letterSpacing: '.5px', mb: 1 }}>BOND PRICES WILL...</Typography>
          <Stack direction="row" sx={{ gap: 1, mb: 2 }}>
            {(['UP', 'DOWN'] as const).map(pp => {
              const bg   = pp === 'UP' ? LEVEL_COLOR : '#EF4444'
              const Icon = pp === 'UP' ? IconArrowUp : IconArrowDown
              return (
                <Button key={pp} variant="contained" onClick={() => handlePricePrediction(pp)}
                  sx={{ flex: 1, flexDirection: 'column', gap: .4, py: 1.5, borderRadius: '10px', textTransform: 'none', bgcolor: bg, '&:hover': { bgcolor: bg, filter: 'brightness(.9)' } }}>
                  <Icon size={22} strokeWidth={1.5} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>GO {pp}</Typography>
                </Button>
              )
            })}
          </Stack>
        </>
      )}

      {timedOut && (
        <Box sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFCC80', borderRadius: '8px', p: 1, textAlign: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: 12, color: '#E65100' }}>Time's up — moving on!</Typography>
        </Box>
      )}
    </Box>
  )

  // ── ANNOUNCE ────────────────────────────────────────────────────────────────
  if (phase === 'announce') {
    const decision = ecb.rateDecision
    const bg       = decision === 'RAISE' ? '#FFF5F5' : decision === 'CUT' ? 'var(--teal-50)' : '#FFFDE7'
    const border   = decision === 'RAISE' ? '#EF4444' : decision === 'CUT' ? LEVEL_COLOR : '#FFB300'
    const priceUp  = ecb.bondPriceChange > 0
    const change   = Math.abs(ecb.rateChange)
    return (
      <Box sx={{ fontFamily: 'var(--font-body)' }}>
        {headerChip}
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>Bond Trader</Typography>
        <PortfolioBar />

        <Box sx={{ bgcolor: bg, border: `2px solid ${border}`, borderRadius: '12px', p: 2, mb: 2,
          animation: 'slideIn .4s ease',
          '@keyframes slideIn': { from: { transform: 'translateY(-16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } } }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 1 }}>
            <IconBuildingBank size={20} strokeWidth={1.5} color={border} />
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: border, letterSpacing: '.5px' }}>ECB ANNOUNCEMENT</Typography>
          </Stack>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, mb: .5 }}>
            {decision === 'RAISE' ? `RATES RAISED by ${change}%` : decision === 'CUT' ? `RATES CUT by ${change}%` : 'RATES HELD steady'}
          </Typography>
          <Stack direction="row" sx={{ gap: .75, alignItems: 'center' }}>
            {priceUp ? <IconArrowUp size={16} strokeWidth={2} color={LEVEL_COLOR} /> : <IconArrowDown size={16} strokeWidth={2} color="#EF4444" />}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: priceUp ? LEVEL_COLOR : '#EF4444' }}>
              Bond prices are {priceUp ? 'RISING' : 'FALLING'}
            </Typography>
          </Stack>
        </Box>

        {predictionResult !== null && (
          <Box sx={{ bgcolor: predictionResult.both ? '#FFFDE7' : 'white', border: `1px solid ${predictionResult.pts > 0 ? LEVEL_COLOR : '#E0E0E0'}`, borderRadius: '12px', p: 2, mb: 2 }}>
            {predictionResult.both && (
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C08B00', letterSpacing: '.6px', mb: 1, textAlign: 'center' }}>
                DOUBLE CORRECT! ×2 BONUS
              </Typography>
            )}
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: .5 }}>
              {predictionResult.pts > 0
                ? <IconCircleCheck size={18} strokeWidth={1.5} color={LEVEL_COLOR} />
                : <IconCircleX size={18} strokeWidth={1.5} color="#EF4444" />
              }
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: predictionResult.pts > 0 ? LEVEL_COLOR : '#EF4444' }}>
                {predictionResult.pts > 0 ? `+${predictionResult.pts} pts` : 'Wrong this round'}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Rate: {ratePrediction ?? 'none'} {ratePrediction === ecb.rateDecision ? '✓' : '✗'} ·{' '}
              Price: {pricePrediction ? `GO ${pricePrediction}` : 'none'} {pricePrediction === (ecb.bondPriceChange > 0 ? 'UP' : 'DOWN') ? '✓' : '✗'}
            </Typography>
          </Box>
        )}

        <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', fontStyle: 'italic' }}>Trading phase starting…</Typography>
      </Box>
    )
  }

  // ── TRADE ──────────────────────────────────────────────────────────────────
  if (phase === 'trade') {
    const priceUp      = ecb.bondPriceChange > 0
    const priceDiff    = animBondPrice - BASE_BOND_PRICE
    const holdingBonds = bondsHeld > 0
    const canBuy       = !holdingBonds && cash >= BASE_BOND_PRICE
    const canSell      = holdingBonds
    const unrealPnl    = holdingBonds ? bondsHeld * (animBondPrice - bondBuyPrice) : 0
    const tipRaise     = ecb.rateDecision === 'RAISE'
    const tipCut       = ecb.rateDecision === 'CUT'
    const highlightSell = tipRaise && holdingBonds
    const highlightBuy  = tipCut && !holdingBonds

    return (
      <Box sx={{ fontFamily: 'var(--font-body)' }}>
        {headerChip}
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>Bond Trader</Typography>
        <PortfolioBar />
        <ScoreRow />
        <TimerCircle pct={timerPctT} color={timerColorT} secs={tradeTimer} label="TRADE NOW" />

        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '12px', p: 2, mb: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '.5px', mb: .5 }}>CURRENT BOND PRICE</Typography>
          <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            {priceUp ? <IconArrowUp size={28} strokeWidth={2} color={LEVEL_COLOR} /> : <IconArrowDown size={28} strokeWidth={2} color="#EF4444" />}
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: priceUp ? LEVEL_COLOR : '#EF4444' }}>
              €{animBondPrice.toLocaleString()}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 13, color: priceDiff >= 0 ? LEVEL_COLOR : '#EF4444', fontWeight: 600 }}>
            {priceDiff >= 0 ? '+' : ''}€{priceDiff.toLocaleString()} ({ecb.bondPriceChange > 0 ? '+' : ''}{ecb.bondPriceChange}%)
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', p: 1.5, mb: 2 }}>
          {holdingBonds ? (
            <>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                You hold {bondsHeld} bonds · currently worth €{(bondsHeld * animBondPrice).toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Bought at €{bondBuyPrice} ·{' '}
                <span style={{ color: unrealPnl >= 0 ? LEVEL_COLOR : '#EF4444', fontWeight: 600 }}>
                  {unrealPnl >= 0 ? '+' : ''}€{unrealPnl.toLocaleString()} P&L
                </span>
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: 12.5 }}>You hold <strong>€{cash.toLocaleString()} cash</strong> · No bonds</Typography>
          )}
        </Box>

        <Stack sx={{ gap: 1, mb: 2 }}>
          {/* BUY */}
          <Button disabled={!canBuy} onClick={() => commitTrade('BUY')}
            sx={{ borderRadius: '10px', py: 1.25, textTransform: 'none', border: `1px solid ${LEVEL_COLOR}`,
              bgcolor: highlightBuy ? LEVEL_COLOR : 'white', color: highlightBuy ? 'white' : LEVEL_COLOR,
              animation: highlightBuy ? 'pulseGreen 1.2s infinite' : 'none',
              '@keyframes pulseGreen': { '0%,100%': { boxShadow: 'none' }, '50%': { boxShadow: `0 0 0 3px ${LEVEL_COLOR}44` } },
              '&.Mui-disabled': { opacity: .45 }, '&:hover': { bgcolor: `${LEVEL_COLOR}10`, border: `1px solid ${LEVEL_COLOR}` },
            }}>
            <Stack sx={{ alignItems: 'center' }}>
              <Stack direction="row" sx={{ gap: .75, alignItems: 'center' }}>
                <IconShoppingCart size={16} strokeWidth={1.5} />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>BUY Bonds at €{animBondPrice.toLocaleString()}</Typography>
              </Stack>
              <Typography sx={{ fontSize: 11, opacity: .75 }}>
                Spend €{cash.toLocaleString()} to buy {Math.max(0, Math.floor(cash / animBondPrice))} bonds
              </Typography>
            </Stack>
          </Button>

          {/* HOLD */}
          <Button onClick={() => commitTrade('HOLD')}
            sx={{ borderRadius: '10px', py: 1.25, textTransform: 'none', border: '1px solid #ccc', color: 'text.secondary', bgcolor: 'white', '&:hover': { bgcolor: '#f9f9f9' } }}>
            <Stack direction="row" sx={{ gap: .75, alignItems: 'center' }}>
              <IconPlayerPause size={16} strokeWidth={1.5} />
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>HOLD Current Position</Typography>
            </Stack>
          </Button>

          {/* SELL */}
          <Button disabled={!canSell} onClick={() => commitTrade('SELL')}
            sx={{ borderRadius: '10px', py: 1.25, textTransform: 'none', border: '1px solid #EF4444',
              bgcolor: highlightSell ? '#EF4444' : 'white', color: highlightSell ? 'white' : '#EF4444',
              animation: highlightSell ? 'pulseRed 1.2s infinite' : 'none',
              '@keyframes pulseRed': { '0%,100%': { boxShadow: 'none' }, '50%': { boxShadow: '0 0 0 3px rgba(239,68,68,.35)' } },
              '&.Mui-disabled': { opacity: .45 }, '&:hover': { bgcolor: '#FFF5F5', border: '1px solid #EF4444' },
            }}>
            <Stack sx={{ alignItems: 'center' }}>
              <Stack direction="row" sx={{ gap: .75, alignItems: 'center' }}>
                <IconCurrencyDollar size={16} strokeWidth={1.5} />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>SELL Bonds at €{animBondPrice.toLocaleString()}</Typography>
              </Stack>
              <Typography sx={{ fontSize: 11, opacity: .75 }}>
                {canSell ? `Sell ${bondsHeld} bonds for €${(bondsHeld * animBondPrice).toLocaleString()}` : 'No bonds to sell'}
              </Typography>
            </Stack>
          </Button>
        </Stack>

        <Box sx={{ bgcolor: '#F3F0FF', border: '1px solid #E2DAFF', borderRadius: '10px', p: 1.5 }}>
          <Typography sx={{ fontSize: 12.5, color: '#6B4FCF', lineHeight: 1.6 }}>
            {tipRaise && holdingBonds  && "Rates just rose — bond prices are falling. Selling now locks in less damage."}
            {tipRaise && !holdingBonds && "Not a great time to buy bonds. Rates just rose and prices are falling."}
            {tipCut   && !holdingBonds && "Rates just fell — bond prices are rising! Good time to buy before they go higher."}
            {tipCut   && holdingBonds  && "You're holding bonds and prices are rising. Decide when to take your gains."}
            {ecb.rateDecision === 'HOLD' && "Small movement — either decision is reasonable this round."}
          </Typography>
        </Box>
      </Box>
    )
  }

  // ── ROUND RESULT ────────────────────────────────────────────────────────────
  if (phase === 'roundresult') {
    const last = roundHistory[roundHistory.length - 1]
    return (
      <Box sx={{ fontFamily: 'var(--font-body)' }}>
        {headerChip}
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, mb: 2 }}>Bond Trader</Typography>

        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2.5, mb: 2 }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, mb: 2 }}>Round {currentRound + 1} Results</Typography>

          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', letterSpacing: '.5px', mb: 1 }}>PREDICTIONS</Typography>
          {[
            { label: 'Rate decision',  pred: last?.ratePrediction ?? 'none',  actual: ecb.rateDecision,                 ok: last?.ratePrediction === ecb.rateDecision },
            { label: 'Price direction', pred: last?.pricePrediction ?? 'none', actual: ecb.bondPriceChange > 0 ? 'UP' : 'DOWN', ok: last?.pricePrediction === (ecb.bondPriceChange > 0 ? 'UP' : 'DOWN') },
          ].map(r => (
            <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: .75 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.label}</Typography>
              <Stack direction="row" sx={{ gap: .5, alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.pred}</Typography>
                {r.ok ? <IconCircleCheck size={15} strokeWidth={1.5} color={LEVEL_COLOR} /> : <IconCircleX size={15} strokeWidth={1.5} color="#EF4444" />}
              </Stack>
            </Stack>
          ))}
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Prediction points</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: LEVEL_COLOR }}>+{last?.predictionPts ?? 0} pts</Typography>
          </Stack>

          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', letterSpacing: '.5px', mb: 1 }}>TRADING</Typography>
          {[
            { label: 'Your decision',     val: last?.tradeDecision ?? 'HOLD' },
            { label: 'Bond price moved',  val: `${ecb.bondPriceChange > 0 ? '+' : ''}${ecb.bondPriceChange}%` },
            { label: 'Trading P&L',       val: `${roundPnl >= 0 ? '+' : ''}€${roundPnl.toLocaleString()}` },
          ].map(r => (
            <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', mb: .75 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{r.val}</Typography>
            </Stack>
          ))}
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Portfolio now</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: (last?.portfolioAfter ?? STARTING_CASH) >= STARTING_CASH ? LEVEL_COLOR : '#EF4444' }}>
              €{(last?.portfolioAfter ?? STARTING_CASH).toLocaleString()}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: '#F3F0FF', border: '1px solid #E2DAFF', borderRadius: '10px', p: 1.5, mb: 2 }}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
            <IconRobot size={18} strokeWidth={1.5} color="#7B5FD4" style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography sx={{ fontSize: 12.5, color: '#4B3A8C', lineHeight: 1.6, fontStyle: 'italic' }}>{ecb.explanation}</Typography>
          </Stack>
        </Box>

        {chartData.length > 1 && (
          <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '12px', p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', mb: 1 }}>PORTFOLIO SO FAR</Typography>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="r" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']} tickFormatter={(v: number) => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => `€${Number(v).toLocaleString()}`} />
                <ReferenceLine y={STARTING_CASH} stroke="#FFB300" strokeDasharray="4 2" />
                <Line type="monotone" dataKey="value" stroke={LEVEL_COLOR} strokeWidth={2} dot={{ r: 3, fill: LEVEL_COLOR }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5} />}
          onClick={nextRound}
          sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#178a64' } }}>
          {currentRound + 1 >= ECB_ROUNDS.length ? 'See Final Results' : `Round ${currentRound + 2} →`}
        </Button>
      </Box>
    )
  }

  // ── FINAL RESULTS ──────────────────────────────────────────────────────────
  if (phase === 'final') {
    const bestR  = roundHistory.length ? roundHistory.reduce((b, r) => r.tradingPnl > b.tradingPnl ? r : b) : null
    const worstR = roundHistory.length ? roundHistory.reduce((b, r) => r.tradingPnl < b.tradingPnl ? r : b) : null
    return (
      <Box sx={{ fontFamily: 'var(--font-body)' }}>
        {headerChip}
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, mb: 2 }}>Bond Trader</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <LottieAnimation animationData={lottieSrc} width={160} height={160} loop={false} />
        </Box>

        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2.5, mb: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 2 }}>
            <IconBuildingBank size={20} strokeWidth={1.5} color={LEVEL_COLOR} />
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>Final Score: {score.toLocaleString()} pts</Typography>
          </Stack>

          {[
            { label: 'Correct predictions', val: `${correctPredictions}/6`,     c: correctPredictions >= 4 ? LEVEL_COLOR : 'text.secondary' },
            { label: 'Best streak',         val: `${bestStreak} in a row`,       c: 'text.primary' },
          ].map(r => (
            <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', mb: .75 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.val}</Typography>
            </Stack>
          ))}

          <Divider sx={{ my: 1 }} />

          {[
            { label: 'Starting portfolio', val: `€${STARTING_CASH.toLocaleString()}`,  c: 'text.secondary' },
            { label: 'Final portfolio',    val: `€${finalPort.toLocaleString()}`,        c: finalPort >= STARTING_CASH ? LEVEL_COLOR : '#EF4444' },
            { label: 'Net profit/loss',    val: `${finalPort >= STARTING_CASH ? '+' : ''}€${(finalPort-STARTING_CASH).toLocaleString()}`, c: finalPort >= STARTING_CASH ? LEVEL_COLOR : '#EF4444' },
          ].map(r => (
            <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', mb: .75 }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.val}</Typography>
            </Stack>
          ))}

          {bestR && worstR && bestR !== worstR && (
            <>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: .5 }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Best decision</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: LEVEL_COLOR }}>Round {bestR.round} ({bestR.tradeDecision})</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Toughest round</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>Round {worstR.round} ({worstR.tradeDecision})</Typography>
              </Stack>
            </>
          )}
        </Box>

        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2, mb: 2 }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, mb: 1.5 }}>Portfolio Across 6 Rounds</Typography>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="r" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} tickFormatter={(v: number) => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => `€${Number(v).toLocaleString()}`} />
              <ReferenceLine y={STARTING_CASH} stroke="#FFB300" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="value" stroke={LEVEL_COLOR} strokeWidth={2.5} dot={{ r: 4, fill: LEVEL_COLOR }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2, mb: 2 }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, mb: 1.5 }}>Round Breakdown</Typography>
          {roundHistory.map((r, i) => {
            const ok = r.ratePrediction === ECB_ROUNDS[i].rateDecision && r.pricePrediction === (ECB_ROUNDS[i].bondPriceChange > 0 ? 'UP' : 'DOWN')
            return (
              <Stack key={r.round} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: .75, borderBottom: i < roundHistory.length-1 ? '1px solid #f0f0f0' : 'none' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, minWidth: 50 }}>Round {r.round}</Typography>
                <Chip label={r.rateDecision} size="small" sx={{ fontSize: 9, height: 18, fontWeight: 700,
                  bgcolor: r.rateDecision === 'RAISE' ? '#FFF5F5' : r.rateDecision === 'CUT' ? 'var(--teal-50)' : '#FFFDE7',
                  color:   r.rateDecision === 'RAISE' ? '#EF4444' : r.rateDecision === 'CUT' ? LEVEL_COLOR : '#C08B00' }} />
                <Stack direction="row" sx={{ gap: .4, alignItems: 'center' }}>
                  {ok ? <IconCircleCheck size={14} strokeWidth={1.5} color={LEVEL_COLOR} /> : <IconCircleX size={14} strokeWidth={1.5} color="#EF4444" />}
                  <Typography sx={{ fontSize: 11, color: ok ? LEVEL_COLOR : '#EF4444' }}>{r.tradeDecision}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: r.tradingPnl >= 0 ? LEVEL_COLOR : '#EF4444', minWidth: 60, textAlign: 'right' }}>
                  {r.tradingPnl >= 0 ? '+' : ''}€{r.tradingPnl.toLocaleString()}
                </Typography>
              </Stack>
            )
          })}
        </Box>

        <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', p: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--teal-600)' }}>{perfMsg()}</Typography>
        </Box>

        <Box sx={{ bgcolor: '#FFF8F0', border: '1px solid #FED7AA', borderRadius: '10px', p: 1.5, mb: 2.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C2460A', letterSpacing: '.6px', mb: .5 }}>KEY INSIGHT</Typography>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: 'text.secondary' }}>
            The ECB makes rate decisions 8 times per year. Every single decision moves bond markets globally.
            This is why bond traders watch inflation data, growth figures, and ECB speeches obsessively —
            each hint can be worth millions.
          </Typography>
        </Box>

        <Stack sx={{ gap: 1 }}>
          {!isCompleted ? (
            <Button variant="contained" fullWidth onClick={onComplete}
              sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#178a64' } }}>
              I understand bonds now! +20 XP
            </Button>
          ) : (
            <Typography sx={{ textAlign: 'center', fontSize: 13, color: LEVEL_COLOR, fontWeight: 600, py: .5 }}>+20 XP already earned</Typography>
          )}
          <Button variant="outlined" fullWidth onClick={resetGame}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}>
            Play Again
          </Button>
        </Stack>
      </Box>
    )
  }

  return null
}
