import { useEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconCoins, IconChevronRight, IconChevronDown,
  IconCircleCheck, IconAlertTriangle, IconInfoCircle,
  IconPlayerPlay, IconPlayerTrackNext,
} from '@tabler/icons-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface Props { isCompleted: boolean; onComplete: () => void }

type Phase = 'howtoplay' | 'pick' | 'race' | 'reveal'
type RaceSpeed = 'normal' | 'fast'

interface Fund {
  id: string
  name: string
  type: string
  fee: number
  color: string
  badge: string
  badgeColor: string
  description: string
  riskLevel: string
  minInvest: string
}

const FUNDS: Fund[] = [
  {
    id: 'vanguard', name: 'Vanguard MSCI World', type: 'Index ETF', fee: 0.07,
    color: '#1D9E75', badge: 'MOST POPULAR', badgeColor: '#1D9E75',
    description: 'Tracks 1,500+ global companies automatically',
    riskLevel: 'Medium', minInvest: '€1',
  },
  {
    id: 'fidelity', name: 'Fidelity Growth Fund', type: 'Active Fund', fee: 1.2,
    color: '#2E86AB', badge: 'ACTIVELY MANAGED', badgeColor: '#2E86AB',
    description: 'Expert managers pick the best stocks for you',
    riskLevel: 'Medium-High', minInvest: '€500',
  },
  {
    id: 'hedge', name: 'Alpha Hedge Premium', type: 'Hedge Fund', fee: 2.0,
    color: '#7B5FD4', badge: 'PREMIUM', badgeColor: '#7B5FD4',
    description: 'Exclusive strategies for sophisticated investors',
    riskLevel: 'High', minInvest: '€10,000',
  },
  {
    id: 'bank', name: 'BNP Paribas Épargne', type: 'Bank Fund', fee: 1.8,
    color: '#E07B39', badge: 'BANK MANAGED', badgeColor: '#E07B39',
    description: 'Managed by your bank — convenient and trusted',
    riskLevel: 'Medium', minInvest: '€100',
  },
]

const BENCHMARK  = FUNDS[0] // Vanguard is always the low-cost benchmark
const WORST_FUND = FUNDS[2] // Alpha Hedge Premium — shown as the comparison when the user picks Vanguard
const INITIAL_INVESTMENT = 10000
const ANNUAL_RETURN = 7 // same for all funds, only fee differs
const LEVEL_COLOR = '#3AAFA9'
const PICK_SECONDS = 10
const RACE_YEARS = 20

const FUND_INSIGHTS: Record<string, string> = {
  vanguard: 'Smart choice — low fees maximize returns',
  fidelity: 'Active funds rarely beat index funds after fees',
  hedge: '2% per year will seriously dent your returns',
  bank: 'Convenient but expensive — banks profit from these fees',
}

function fundValueAtYear(fee: number, year: number, initial = INITIAL_INVESTMENT, annualReturn = ANNUAL_RETURN): number {
  return initial * Math.pow(1 + (annualReturn - fee) / 100, year)
}

function feeTierLabel(fee: number): string {
  if (fee < 0.5) return 'Low'
  if (fee < 1.5) return 'Medium'
  return 'High'
}

function euro(n: number): string {
  return `€${Math.round(n).toLocaleString()}`
}

export default function ETFsFeeCalculator({ isCompleted, onComplete }: Props) {
  const [phase,           setPhase]          = useState<Phase>('howtoplay')
  const [selectedFundId,  setSelectedFundId] = useState<string | null>(null)
  const [pickTimer,       setPickTimer]      = useState(PICK_SECONDS)
  const [timedOutPick,    setTimedOutPick]   = useState(false)
  const [raceYear,        setRaceYear]       = useState(0)
  const [raceSpeed,       setRaceSpeed]      = useState<RaceSpeed>('normal')
  const [milestoneMsg,    setMilestoneMsg]   = useState<string | null>(null)
  const [heroCount,       setHeroCount]      = useState(0)
  const [explorerOpen,    setExplorerOpen]   = useState(false)
  const [explorerInitial, setExplorerInitial]= useState(10000)
  const [explorerReturn,  setExplorerReturn] = useState(7)
  const [explorerFeeA,    setExplorerFeeA]   = useState(0.07)
  const [explorerFeeB,    setExplorerFeeB]   = useState(1.5)

  const raceSpeedRef       = useRef<RaceSpeed>('normal')
  const pickAdvancedRef    = useRef(false)
  const pickIntervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { raceSpeedRef.current = raceSpeed }, [raceSpeed])

  // ── Phase 1: 10s pick timer ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'pick') return
    setPickTimer(PICK_SECONDS)
    pickAdvancedRef.current = false
    pickIntervalRef.current = setInterval(() => {
      setPickTimer(t => {
        if (t <= 1) {
          if (pickIntervalRef.current) clearInterval(pickIntervalRef.current)
          if (!pickAdvancedRef.current) {
            pickAdvancedRef.current = true
            setTimedOutPick(true)
            setSelectedFundId('bank')
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (pickIntervalRef.current) clearInterval(pickIntervalRef.current) }
  }, [phase])

  function handleSelectFund(id: string) {
    if (pickAdvancedRef.current) return
    pickAdvancedRef.current = true
    if (pickIntervalRef.current) clearInterval(pickIntervalRef.current)
    setSelectedFundId(id)
  }

  const selectedFund   = FUNDS.find(f => f.id === selectedFundId) ?? BENCHMARK
  const isVanguardPick = selectedFund.id === 'vanguard'
  const opponentFund   = isVanguardPick ? WORST_FUND : BENCHMARK
  const opponentLabel  = isVanguardPick ? 'HIGH-FEE FUND' : 'LOW-COST ETF'

  // ── Phase 2: 20-year race loop ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'race') return
    let cancelled = false
    setRaceYear(0)

    function step(year: number) {
      if (cancelled) return
      setRaceYear(year)
      if (year >= RACE_YEARS) {
        setTimeout(() => { if (!cancelled) setPhase('reveal') }, 1000)
        return
      }
      const base = raceSpeedRef.current === 'fast' ? 150 : 600
      const extraPause = year === 10 ? 800 : 0
      setTimeout(() => step(year + 1), base + extraPause)
    }

    const kickoff = setTimeout(() => step(0), 50)
    return () => { cancelled = true; clearTimeout(kickoff) }
  }, [phase])

  // gap callouts at year 5 / 10 / 15 / 20
  useEffect(() => {
    if (phase !== 'race') return
    if (![5, 10, 15, 20].includes(raceYear)) return
    const userVal = fundValueAtYear(selectedFund.fee, raceYear)
    const oppVal  = fundValueAtYear(opponentFund.fee, raceYear)
    const gap     = Math.abs(userVal - oppVal)
    const aheadOrBehind = isVanguardPick ? 'ahead' : 'behind'

    let msg = ''
    if (raceYear === 5)  msg = `${euro(gap)} difference so far`
    if (raceYear === 10) msg = `Halfway there — already ${euro(gap)} ${aheadOrBehind}`
    if (raceYear === 15) msg = isVanguardPick ? `${euro(gap)} saved from fees already` : `${euro(gap)} lost to fees already`
    if (raceYear === 20) msg = 'Final result'

    setMilestoneMsg(msg)
    const t = setTimeout(() => setMilestoneMsg(null), 2600)
    return () => clearTimeout(t)
  }, [raceYear, phase, selectedFund.fee, opponentFund.fee, isVanguardPick])

  const finalUser     = fundValueAtYear(selectedFund.fee, RACE_YEARS)
  const finalOpponent = fundValueAtYear(opponentFund.fee, RACE_YEARS)
  const feesLost       = Math.max(0, finalOpponent - finalUser)
  const saving          = Math.max(0, finalUser - finalOpponent)
  const heroTarget      = isVanguardPick ? saving : feesLost

  // ── Phase 3: hero counter animation ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal') return
    setHeroCount(0)
    const dur = 1500
    const t0  = Date.now()
    let raf   = 0
    function tick() {
      const prog = Math.min(1, (Date.now() - t0) / dur)
      const ease = 1 - Math.pow(1 - prog, 3)
      setHeroCount(Math.round(heroTarget * ease))
      if (prog < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function resetGame() {
    setPhase('howtoplay')
    setSelectedFundId(null)
    setPickTimer(PICK_SECONDS)
    setTimedOutPick(false)
    setRaceYear(0)
    setRaceSpeed('normal')
    setMilestoneMsg(null)
    setHeroCount(0)
    pickAdvancedRef.current = false
  }

  // progressively-revealed chart data for the race
  const chartData = useMemo(() =>
    Array.from({ length: RACE_YEARS + 1 }, (_, year) => ({
      year,
      user:     year <= raceYear ? Math.round(fundValueAtYear(selectedFund.fee, year)) : null,
      opponent: year <= raceYear ? Math.round(fundValueAtYear(opponentFund.fee, year)) : null,
    })),
    [raceYear, selectedFund.fee, opponentFund.fee]
  )

  // "What if?" explorer data
  const explorerData = useMemo(() =>
    Array.from({ length: 21 }, (_, year) => ({
      year,
      'Low-cost ETF':    Math.round(fundValueAtYear(explorerFeeA, year, explorerInitial, explorerReturn)),
      'Comparison fund': Math.round(fundValueAtYear(explorerFeeB, year, explorerInitial, explorerReturn)),
    })),
    [explorerInitial, explorerReturn, explorerFeeA, explorerFeeB]
  )
  const explorerFinalA = explorerData[20]['Low-cost ETF']
  const explorerFinalB = explorerData[20]['Comparison fund']
  const explorerLoss   = Math.max(0, explorerFinalA - explorerFinalB)

  const timerPct   = pickTimer / PICK_SECONDS
  const timerColor = timerPct > 0.5 ? LEVEL_COLOR : timerPct > 0.25 ? '#FF8C00' : '#E24B4A'

  // ── shared header ────────────────────────────────────────────────────────
  const headerChip = (
    <Chip
      icon={<IconCoins size={14} strokeWidth={1.5} />}
      label="Mini-Game"
      size="small"
      sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11, mb: 1, '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' } }}
    />
  )

  // ── HOW TO PLAY ─────────────────────────────────────────────────────────
  if (phase === 'howtoplay') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>The Fee Race</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>€10,000. 20 years. Which fund wins?</Typography>

      <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '14px', p: 2.5, mb: 2 }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, mb: 2 }}>How to Play</Typography>

        {[
          'Choose a fund to invest your €10,000',
          'Watch 20 years of growth race by',
          'See how much fees secretly cost you',
        ].map((step, i) => (
          <Stack key={step} direction="row" sx={{ gap: 1.5, mb: 1.5, alignItems: 'flex-start' }}>
            <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: 'white', border: '1px solid var(--teal-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', fontFamily: 'var(--font-display)' }}>{i + 1}</Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6, pt: 0.25 }}>{step}</Typography>
          </Stack>
        ))}

        <Box sx={{ bgcolor: 'white', border: `1.5px solid ${LEVEL_COLOR}`, borderRadius: '10px', p: 1.5, mb: 2.5, mt: 1 }}>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.7 }}>
            All funds have the same <strong>7% annual return</strong>.<br />
            The <strong style={{ color: LEVEL_COLOR }}>ONLY</strong> difference is the annual fee.
          </Typography>
        </Box>

        <Button variant="contained" fullWidth endIcon={<IconChevronRight size={16} strokeWidth={1.5} />}
          onClick={() => setPhase('pick')}
          sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#2e9a94' } }}>
          Start the Race →
        </Button>
      </Box>
    </Box>
  )

  // ── PHASE 1: PICK YOUR FUND ─────────────────────────────────────────────
  if (phase === 'pick') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>The Fee Race</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>Phase 1 of 3 · Choose your fund</Typography>

      <Stack sx={{ alignItems: 'center', mb: 2 }}>
        <TimerCircle pct={timerPct} color={timerColor} secs={pickTimer} label={`You have ${pickTimer}s to decide`} />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2.5 }}>
        {FUNDS.map(fund => (
          <FundCard
            key={fund.id}
            fund={fund}
            selected={selectedFundId === fund.id}
            timedOutPick={timedOutPick}
            onSelect={() => handleSelectFund(fund.id)}
          />
        ))}
      </Box>

      <Button
        variant="contained" fullWidth disabled={!selectedFundId}
        endIcon={<IconChevronRight size={16} strokeWidth={1.5} />}
        onClick={() => setPhase('race')}
        sx={{
          bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700,
          fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25,
          '&:hover': { bgcolor: '#2e9a94' }, '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-400)' },
        }}>
        Start the Race!
      </Button>
    </Box>
  )

  // ── PHASE 2: THE RACE ───────────────────────────────────────────────────
  if (phase === 'race') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>The Fee Race</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>Phase 2 of 3 · 20 Years of Growth</Typography>

      <Typography sx={{ textAlign: 'center', fontFamily: "'Syne', var(--font-display)", fontWeight: 700, fontSize: 28, mb: 2 }}>
        Year {raceYear}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mb: 1.5 }}>
        <RaceFundCard label="YOUR FUND" fund={selectedFund} value={fundValueAtYear(selectedFund.fee, raceYear)} />
        <RaceFundCard label={opponentLabel} fund={opponentFund} value={fundValueAtYear(opponentFund.fee, raceYear)} />
      </Box>

      <Box sx={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
        <Fade in={!!milestoneMsg} timeout={250}>
          <Chip
            label={milestoneMsg ?? ''}
            size="small"
            sx={{ bgcolor: '#1a2e27', color: '#fff', fontWeight: 700, fontSize: 11.5, height: 26, px: 0.5 }}
          />
        </Fade>
      </Box>

      <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '12px', p: 1.5, mb: 2 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tickFormatter={v => `Y${v}`} tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} width={42} />
            <Tooltip formatter={(v: unknown) => v == null ? '' : `€${Number(v).toLocaleString()}`} labelFormatter={l => `Year ${l}`} />
            <ReferenceLine x={raceYear} stroke="#999" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="user" name={selectedFund.name} stroke={selectedFund.color} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="opponent" name={opponentFund.name} stroke={isVanguardPick ? '#E24B4A' : '#1D9E75'} strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" sx={{ gap: 1 }}>
        <Button
          fullWidth onClick={() => setRaceSpeed('normal')}
          variant={raceSpeed === 'normal' ? 'contained' : 'outlined'}
          startIcon={<IconPlayerPlay size={16} strokeWidth={1.5} />}
          sx={{
            borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 13, py: 1,
            bgcolor: raceSpeed === 'normal' ? LEVEL_COLOR : 'white',
            borderColor: LEVEL_COLOR, color: raceSpeed === 'normal' ? 'white' : LEVEL_COLOR,
            '&:hover': { bgcolor: raceSpeed === 'normal' ? '#2e9a94' : 'var(--teal-50)', borderColor: LEVEL_COLOR },
          }}>
          Normal
        </Button>
        <Button
          fullWidth onClick={() => setRaceSpeed('fast')}
          variant={raceSpeed === 'fast' ? 'contained' : 'outlined'}
          startIcon={<IconPlayerTrackNext size={16} strokeWidth={1.5} />}
          sx={{
            borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 13, py: 1,
            bgcolor: raceSpeed === 'fast' ? LEVEL_COLOR : 'white',
            borderColor: LEVEL_COLOR, color: raceSpeed === 'fast' ? 'white' : LEVEL_COLOR,
            '&:hover': { bgcolor: raceSpeed === 'fast' ? '#2e9a94' : 'var(--teal-50)', borderColor: LEVEL_COLOR },
          }}>
          Fast Forward
        </Button>
      </Stack>
    </Box>
  )

  // ── PHASE 3: THE REVEAL ─────────────────────────────────────────────────
  const annualFee        = INITIAL_INVESTMENT * (selectedFund.fee / 100)
  const opponentRowLabel = isVanguardPick ? 'High-fee fund' : 'Low-cost ETF'
  const costRowLabel     = isVanguardPick ? 'You saved' : 'Fees cost you'
  const costRowValue     = isVanguardPick ? saving : feesLost
  const costRowColor     = isVanguardPick ? LEVEL_COLOR : '#E24B4A'
  const insight           = getInsight(isVanguardPick, feesLost)

  return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, mb: 0.25 }}>The Fee Race</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>Phase 3 of 3 · The Result</Typography>

      {/* Hero number */}
      <Box sx={{
        textAlign: 'center', borderRadius: '16px', p: 3, mb: 2.5,
        bgcolor: isVanguardPick ? 'var(--teal-50)' : '#FFF5F5',
        border: `1.5px solid ${isVanguardPick ? 'var(--teal-100)' : '#FFD4D4'}`,
      }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
          {isVanguardPick ? 'Great choice! You saved' : 'You lost'}
        </Typography>
        <Typography sx={{ fontFamily: "'Syne', var(--font-display)", fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: isVanguardPick ? LEVEL_COLOR : '#E24B4A' }}>
          {euro(heroCount)}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
          {isVanguardPick ? 'vs the high-fee alternative' : 'to fees over 20 years'}
        </Typography>
      </Box>

      {/* Results table */}
      <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2.5, mb: 2 }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, mb: 1.5, textAlign: 'center', color: 'text.secondary' }}>
          After 20 Years
        </Typography>

        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.9 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Your fund ({selectedFund.name})</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{euro(finalUser)}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.9 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{opponentRowLabel}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{euro(finalOpponent)}</Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.9 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{costRowLabel}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: costRowColor }}>{euro(costRowValue)}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.9 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Annual fee</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{selectedFund.fee.toFixed(2)}%</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Fee paid per year</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>~{euro(annualFee)}</Typography>
        </Stack>
      </Box>

      {/* Contextual insight */}
      <Box sx={{ bgcolor: insight.bg, border: `1px solid ${insight.border}`, borderRadius: '10px', p: 1.5, mb: 2.5 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
          <insight.Icon size={20} strokeWidth={1.5} color={insight.color} style={{ flexShrink: 0, marginTop: 1 }} />
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: insight.color }}>{insight.text}</Typography>
        </Stack>
      </Box>

      {/* What if? explorer */}
      <Box onClick={() => setExplorerOpen(o => !o)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', mb: 1, userSelect: 'none' }}>
        <IconChevronDown size={16} strokeWidth={1.5} style={{ transform: explorerOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} color={LEVEL_COLOR} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: LEVEL_COLOR }}>Explore different scenarios</Typography>
      </Box>
      <Collapse in={explorerOpen}>
        <ExplorerSection
          initial={explorerInitial} setInitial={setExplorerInitial}
          annualReturn={explorerReturn} setAnnualReturn={setExplorerReturn}
          feeA={explorerFeeA} setFeeA={setExplorerFeeA}
          feeB={explorerFeeB} setFeeB={setExplorerFeeB}
          data={explorerData} finalA={explorerFinalA} finalB={explorerFinalB} loss={explorerLoss}
        />
      </Collapse>

      <Stack sx={{ gap: 1, mt: 2.5 }}>
        {!isCompleted ? (
          <Button variant="contained" fullWidth onClick={onComplete}
            sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#2e9a94' } }}>
            I'll always check fees first! +20 XP
          </Button>
        ) : (
          <Typography sx={{ textAlign: 'center', fontSize: 13, color: LEVEL_COLOR, fontWeight: 600, py: 0.5 }}>+20 XP already earned</Typography>
        )}
        <Button variant="outlined" fullWidth onClick={resetGame}
          sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}>
          Race Again
        </Button>
      </Stack>
    </Box>
  )
}

// ── contextual insight (Phase 3) ────────────────────────────────────────────
function getInsight(isVanguardPick: boolean, feesLost: number) {
  if (isVanguardPick) {
    return {
      Icon: IconCircleCheck, color: LEVEL_COLOR, bg: 'var(--teal-50)', border: 'var(--teal-100)',
      text: "You chose wisely! The 0.07% fee means almost all of your returns stay in your pocket. This is exactly what long-term investors do.",
    }
  }
  if (feesLost > 10000) {
    return {
      Icon: IconAlertTriangle, color: '#E24B4A', bg: '#FFF5F5', border: '#FFD4D4',
      text: "That's a full year's salary lost to fees. High-fee funds almost never outperform low-cost index ETFs after charges.",
    }
  }
  if (feesLost >= 5000) {
    return {
      Icon: IconAlertTriangle, color: '#E07B39', bg: '#FFF8F0', border: '#FED7AA',
      text: "That's a holiday, a car down payment, or a year of university fees — gone silently to fund management charges.",
    }
  }
  return {
    Icon: IconInfoCircle, color: '#C08B00', bg: '#FFFDE7', border: '#FFE9A8',
    text: "Even this 'small' fee difference compounds significantly over 20 years. Always check the expense ratio.",
  }
}

// ── Timer circle (Phase 1) ──────────────────────────────────────────────────
function TimerCircle({ pct, color, secs, label }: { pct: number; color: string; secs: number; label: string }) {
  const r = 26, circ = 2 * Math.PI * r
  return (
    <Stack sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={64} height={64} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx={32} cy={32} r={r} fill="none" stroke="#f0f0f0" strokeWidth={5} />
          <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset .9s linear, stroke .3s' }} />
        </svg>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color, zIndex: 1 }}>{secs}</Typography>
      </Box>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.75 }}>{label}</Typography>
    </Stack>
  )
}

// ── Fund card (Phase 1) ─────────────────────────────────────────────────────
function FundCard({ fund, selected, timedOutPick, onSelect }: { fund: Fund; selected: boolean; timedOutPick: boolean; onSelect: () => void }) {
  const feePct = Math.min(100, (fund.fee / 2.0) * 100)
  return (
    <Box
      onClick={onSelect}
      sx={{
        position: 'relative', cursor: 'pointer', bgcolor: 'white', borderRadius: '14px', p: 2,
        border: selected ? `2.5px solid ${fund.color}` : '1.5px solid var(--border, #E0E0E0)',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform .2s ease, border-color .2s ease',
      }}
    >
      {selected && (
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <IconCircleCheck size={20} strokeWidth={1.5} color={fund.color} />
        </Box>
      )}

      <Chip label={fund.badge} size="small" sx={{ bgcolor: `${fund.badgeColor}18`, color: fund.badgeColor, fontWeight: 700, fontSize: 9, height: 20, mb: 1 }} />

      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, mb: 0.15, pr: 2.5 }}>{fund.name}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1.25 }}>{fund.type}</Typography>

      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.4 }}>Annual Fee: {fund.fee.toFixed(2)}%</Typography>
      <Box sx={{ height: 8, bgcolor: 'rgba(0,0,0,.06)', borderRadius: 4, overflow: 'hidden', mb: 0.4 }}>
        <Box sx={{ height: '100%', width: `${feePct}%`, bgcolor: fund.color, borderRadius: 4 }} />
      </Box>
      <Typography sx={{ fontSize: 10, color: 'text.disabled', mb: 1.25 }}>{feeTierLabel(fund.fee)}</Typography>

      <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.5, mb: 1.25 }}>
        "{fund.description}"
      </Typography>

      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>Min. invest: {fund.minInvest}</Typography>
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>Risk: {fund.riskLevel}</Typography>
      </Stack>

      {selected && (
        <Box sx={{ mt: 1.25, pt: 1.25, borderTop: '1px dashed rgba(0,0,0,.1)' }}>
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: fund.color, lineHeight: 1.5 }}>
            {timedOutPick && fund.id === 'bank' ? "Time's up! You went with your bank's default option." : FUND_INSIGHTS[fund.id]}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

// ── Fund display card (Phase 2) ─────────────────────────────────────────────
function RaceFundCard({ label, fund, value }: { label: string; fund: Fund; value: number }) {
  const pct = ((value - INITIAL_INVESTMENT) / INITIAL_INVESTMENT) * 100
  return (
    <Box sx={{ bgcolor: 'white', border: `1.5px solid ${fund.color}`, borderRadius: '12px', p: 1.5 }}>
      <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.6px', color: fund.color, mb: 0.4 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.15 }}>{fund.name}</Typography>
      <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mb: 1 }}>Fee: {fund.fee.toFixed(2)}%</Typography>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17 }}>{euro(value)}</Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: pct >= 0 ? LEVEL_COLOR : '#E24B4A' }}>
        {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
      </Typography>
    </Box>
  )
}

// ── "What if?" explorer (Phase 3) ───────────────────────────────────────────
function ExplorerSection({ initial, setInitial, annualReturn, setAnnualReturn, feeA, setFeeA, feeB, setFeeB, data, finalA, finalB, loss }: {
  initial: number; setInitial: (v: number) => void
  annualReturn: number; setAnnualReturn: (v: number) => void
  feeA: number; setFeeA: (v: number) => void
  feeB: number; setFeeB: (v: number) => void
  data: { year: number; 'Low-cost ETF': number; 'Comparison fund': number }[]
  finalA: number; finalB: number; loss: number
}) {
  function handle(setter: (v: number) => void) {
    return (_: Event, val: number | number[]) => setter(Array.isArray(val) ? val[0] : val)
  }

  const sliders = [
    {
      key: 'initial', sublabel: 'Initial investment', label: `€${initial.toLocaleString()} invested`,
      value: initial, min: 1000, max: 50000, step: 1000, color: '#1D9E75',
      onChange: handle(setInitial), format: (v: number) => `€${(v / 1000).toFixed(0)}k`,
    },
    {
      key: 'return', sublabel: 'Annual return (same for both funds)', label: `${annualReturn}% expected annual return`,
      value: annualReturn, min: 3, max: 12, step: 0.5, color: '#2E86AB',
      onChange: handle(setAnnualReturn), format: (v: number) => `${v}%`,
    },
    {
      key: 'feeA', sublabel: 'Low-cost ETF expense ratio', label: `${feeA.toFixed(2)}% low-cost ETF fee`,
      value: feeA, min: 0.03, max: 0.5, step: 0.01, color: '#1D9E75',
      onChange: handle(setFeeA), format: (v: number) => `${v.toFixed(2)}%`,
    },
    {
      key: 'feeB', sublabel: 'Comparison fund expense ratio', label: `${feeB.toFixed(1)}% comparison fund fee`,
      value: feeB, min: 0.5, max: 2.5, step: 0.1, color: '#E24B4A',
      onChange: handle(setFeeB), format: (v: number) => `${v.toFixed(1)}%`,
    },
  ]

  return (
    <Box sx={{ bgcolor: '#fafafa', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2, mb: 2 }}>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, mb: 1.75 }}>
        What if you changed the numbers?
      </Typography>

      {sliders.map(s => (
        <Box key={s.key} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>{s.sublabel}</Typography>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: s.color, mb: 0.4 }}>{s.label}</Typography>
          <Slider value={s.value} min={s.min} max={s.max} step={s.step} onChange={s.onChange} valueLabelDisplay="auto" valueLabelFormat={s.format} sx={{ color: s.color }} />
        </Box>
      ))}

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="year" tickFormatter={v => `Y${v}`} tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} width={42} />
          <Tooltip formatter={(v: unknown, name: unknown) => [`€${Number(v).toLocaleString()}`, String(name ?? '')]} labelFormatter={l => `Year ${l}`} />
          <Line type="monotone" dataKey="Low-cost ETF" stroke="#1D9E75" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Comparison fund" stroke="#E24B4A" strokeWidth={2} strokeDasharray="5 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.25 }}>
          €{finalA.toLocaleString()} vs €{finalB.toLocaleString()}
        </Typography>
        <Typography sx={{ fontFamily: "'Syne', var(--font-display)", fontWeight: 800, fontSize: 22, color: '#E24B4A' }}>
          You lost {euro(loss)}
        </Typography>
      </Box>
    </Box>
  )
}
