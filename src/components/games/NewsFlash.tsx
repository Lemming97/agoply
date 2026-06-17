import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconNews, IconFlame, IconRobot, IconArrowUp, IconArrowDown,
  IconCircleCheck, IconCircleX, IconClock, IconArrowRight,
  IconBuildingBank, IconBarrel, IconCurrencyEuro, IconCurrencyBitcoin,
  IconTrendingUp, IconDeviceLaptop, IconCoin,
} from '@tabler/icons-react'
import LottieAnimation from '../LottieAnimation'
import TrophyWinner from '../../assets/animations/Trophy_Winner.json'
import ThinkingAnim from '../../assets/animations/Thinking.json'

interface Props { isCompleted: boolean; onComplete: () => void }

// ─── Types ───────────────────────────────────────────────────────────────────
type Direction  = 'UP' | 'DOWN'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
type UserResult = Direction | 'TIMEOUT'
type Phase = 'loading' | 'howToPlay' | 'playing' | 'feedback' | 'results'

interface Question {
  headline: string
  asset: string
  assetKey: string
  correctAnswer: Direction
  explanation: string
  difficulty: Difficulty
}

interface RoundRecord {
  headline: string
  asset: string
  userAnswer: UserResult | null
  correct: Direction
  points: number
  isCorrect: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const Q_TIME       = 8
const LEVEL_COLOR  = '#0F6E56'
const FMP_KEY      = import.meta.env.VITE_FMP_API_KEY as string | undefined
const CLAUDE_KEY   = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

const DIFF_COLORS: Record<Difficulty, string> = {
  EASY: '#1D9E75', MEDIUM: '#C08B00', HARD: '#DC2626',
}

type IconComp = React.ComponentType<{ size: number; strokeWidth: number; color: string }>
const ICON_MAP: Record<string, IconComp> = {
  Bonds: IconBuildingBank, Oil: IconBarrel, 'EUR/USD': IconCurrencyEuro,
  Forex: IconCurrencyEuro, Bitcoin: IconCurrencyBitcoin, Crypto: IconCurrencyBitcoin,
  Gold: IconCoin, Tech: IconDeviceLaptop, Stocks: IconTrendingUp, default: IconNews,
}

// ─── Fallback questions ───────────────────────────────────────────────────────
const FALLBACKS: Question[] = [
  { headline: 'ECB raises interest rates by 0.5% — highest level in 15 years', asset: 'Bonds', assetKey: 'Bonds', correctAnswer: 'DOWN', explanation: 'When interest rates rise, existing bond prices fall because new bonds now offer higher yields, making old ones less attractive.', difficulty: 'EASY' },
  { headline: 'Apple reports record quarterly earnings, beats analyst expectations by 12%', asset: 'Stocks', assetKey: 'Stocks', correctAnswer: 'UP', explanation: 'Strong earnings above expectations signal a healthy, growing company. Investors rush to buy, pushing the price up.', difficulty: 'EASY' },
  { headline: 'OPEC announces surprise production cut of 2 million barrels per day', asset: 'Oil', assetKey: 'Oil', correctAnswer: 'UP', explanation: 'Less supply with the same demand means higher prices. OPEC production cuts historically cause immediate oil price spikes.', difficulty: 'EASY' },
  { headline: 'US inflation data comes in higher than expected at 4.2%', asset: 'EUR/USD', assetKey: 'EUR/USD', correctAnswer: 'DOWN', explanation: 'High US inflation signals the Fed may raise rates, strengthening the dollar. A stronger dollar means EUR/USD falls.', difficulty: 'MEDIUM' },
  { headline: 'Bitcoin ETF approved by SEC — opens crypto to institutional investors', asset: 'Bitcoin', assetKey: 'Bitcoin', correctAnswer: 'UP', explanation: 'ETF approval makes Bitcoin accessible to billions of dollars of institutional money. More buyers = higher price.', difficulty: 'EASY' },
  { headline: 'Major European bank reports €2 billion unexpected trading loss', asset: 'Stocks', assetKey: 'Stocks', correctAnswer: 'DOWN', explanation: 'Large unexpected losses destroy investor confidence. Shareholders sell immediately to limit their exposure.', difficulty: 'EASY' },
  { headline: 'China announces massive economic stimulus package of $500 billion', asset: 'Gold', assetKey: 'Gold', correctAnswer: 'DOWN', explanation: 'Economic stimulus reduces fear and uncertainty. When investors feel safe, they move from safe-haven gold into higher-return assets.', difficulty: 'HARD' },
  { headline: 'War breaks out between two major oil-producing nations', asset: 'Oil', assetKey: 'Oil', correctAnswer: 'UP', explanation: 'Geopolitical conflict threatens oil supply routes and production. Fear of shortages drives prices up immediately.', difficulty: 'EASY' },
  { headline: 'Tech company announces 20% workforce layoffs to cut costs', asset: 'Stocks', assetKey: 'Stocks', correctAnswer: 'UP', explanation: 'Counterintuitively, layoffs often boost stock prices short-term — investors see cost-cutting as a path to higher profits.', difficulty: 'HARD' },
  { headline: 'European Central Bank signals interest rate cuts are coming in Q1', asset: 'EUR/USD', assetKey: 'EUR/USD', correctAnswer: 'DOWN', explanation: 'Rate cuts reduce returns on euro-denominated assets. International investors move money elsewhere, selling euros and pushing EUR/USD down.', difficulty: 'MEDIUM' },
]

// ─── Claude API call ──────────────────────────────────────────────────────────
async function askClaude(headline: string): Promise<Omit<Question, 'headline'> | null> {
  if (!CLAUDE_KEY) return null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: 'You are a financial education assistant for a teen learning app (ages 14–18). Analyse headlines and explain market impact simply.',
        messages: [{ role: 'user', content: `Headline: "${headline}"\n\nRespond ONLY with valid JSON, no other text:\n{"asset":"most affected asset (Stocks, Bonds, Bitcoin, Oil, EUR/USD, Gold, Forex, Tech)","direction":"UP or DOWN","confidence":"HIGH, MEDIUM, or LOW","explanation":"1-2 sentence explanation a 16-year-old would understand","difficulty":"EASY, MEDIUM, or HARD"}` }],
      }),
    })
    if (!res.ok) return null
    const data = await res.json() as { content?: { text: string }[] }
    const text  = data.content?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const j = JSON.parse(match[0]) as Record<string, string>
    if (!j || j['confidence'] === 'LOW' || !j['direction'] || !j['asset']) return null
    const diff: Difficulty = (['EASY','MEDIUM','HARD'] as Difficulty[]).includes(j['difficulty'] as Difficulty) ? j['difficulty'] as Difficulty : 'MEDIUM'
    return { asset: j['asset'], assetKey: j['asset'], correctAnswer: j['direction'] === 'UP' ? 'UP' : 'DOWN', explanation: j['explanation'], difficulty: diff }
  } catch { return null }
}

// ─── FMP news fetch ───────────────────────────────────────────────────────────
async function loadQuestions(): Promise<Question[]> {
  const questions: Question[] = []

  if (FMP_KEY) {
    try {
      const res  = await fetch(`https://financialmodelingprep.com/stable/news/general-latest?limit=30&apikey=${FMP_KEY}`)
      if (res.ok) {
        const items = await res.json() as { title: string }[]
        const relevant = items
          .filter(i => /stock|bond|bitcoin|crypto|forex|EUR\/USD|oil|gold|rate|earnings|ECB|Fed|OPEC|Tesla|Apple|equity|shares/i.test(i.title))
          .slice(0, 15)
        const settled = await Promise.allSettled(
          relevant.map(async item => {
            const analysis = await askClaude(item.title)
            if (!analysis) return null
            return { headline: item.title, ...analysis } as Question
          })
        )
        for (const r of settled) {
          if (r.status === 'fulfilled' && r.value) questions.push(r.value)
          if (questions.length >= 10) break
        }
      }
    } catch { /* fall through to fallbacks */ }
  }

  const shuffled = [...FALLBACKS].sort(() => Math.random() - 0.5)
  let fi = 0
  while (questions.length < 10 && fi < shuffled.length) questions.push(shuffled[fi++])
  return questions.slice(0, 10)
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewsFlash({ isCompleted, onComplete }: Props) {
  const [phase,        setPhase]       = useState<Phase>('loading')
  const [questions,    setQuestions]   = useState<Question[]>([])
  const [currentQ,     setCurrentQ]    = useState(0)
  const [timeLeft,     setTimeLeft]    = useState(Q_TIME)
  const [userAnswer,   setUserAnswer]  = useState<UserResult | null>(null)
  const [score,        setScore]       = useState(0)
  const [totalPoints,  setTotalPoints] = useState(0)
  const [streak,       setStreak]      = useState(0)
  const [bestStreak,   setBestStreak]  = useState(0)
  const [history,      setHistory]     = useState<RoundRecord[]>([])
  const [nextVisible,  setNextVisible] = useState(false)
  const [lastPts,      setLastPts]     = useState(0)
  const [lastStreakPts,setLastStreakPts]= useState(0)

  // Refs — accessed by timer/interval callbacks to avoid stale closures
  const phaseRef      = useRef<Phase>('loading')
  const questionsRef  = useRef<Question[]>([])
  const currentQRef   = useRef(0)
  const streakRef     = useRef(0)
  const bestStreakRef = useRef(0)
  const scoreRef      = useRef(0)
  const totalPtsRef   = useRef(0)
  const historyRef    = useRef<RoundRecord[]>([])
  const startTimeRef  = useRef(0)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadedRef     = useRef(false)

  // Keep refs in sync
  phaseRef.current     = phase
  questionsRef.current = questions
  currentQRef.current  = currentQ
  streakRef.current    = streak
  bestStreakRef.current = bestStreak
  scoreRef.current     = score
  totalPtsRef.current  = totalPoints
  historyRef.current   = history

  function doAnswer(answer: UserResult) {
    if (phaseRef.current !== 'playing') return
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    const q     = questionsRef.current[currentQRef.current]
    const ok    = answer !== 'TIMEOUT' && answer === q.correctAnswer
    const secs  = (Date.now() - startTimeRef.current) / 1000
    let pts     = ok ? 10 : 0
    let spd     = 0
    if (ok) { if (secs <= 3) spd = 5; else if (secs <= 6) spd = 2; pts += spd }
    const newStreak = ok ? streakRef.current + 1 : 0
    let strkBonus = 0
    if (ok) {
      if (newStreak >= 7) strkBonus = 15
      else if (newStreak >= 5) strkBonus = 10
      else if (newStreak >= 3) strkBonus = 5
      pts += strkBonus
    }
    const newBest = Math.max(bestStreakRef.current, newStreak)

    const record: RoundRecord = { headline: q.headline, asset: q.asset, userAnswer: answer, correct: q.correctAnswer, points: pts, isCorrect: ok }

    setUserAnswer(answer)
    setStreak(newStreak)
    setBestStreak(newBest)
    if (ok) setScore(s => s + 1)
    setTotalPoints(p => p + pts)
    setHistory(h => [...h, record])
    setLastPts(pts)
    setLastStreakPts(strkBonus)
    setPhase('feedback')
    setTimeout(() => setNextVisible(true), 1500)
  }

  function nextQuestion() {
    setNextVisible(false)
    setUserAnswer(null)
    setLastPts(0)
    setLastStreakPts(0)
    if (currentQRef.current >= 9) {
      setPhase('results')
    } else {
      setCurrentQ(q => { const n = q + 1; currentQRef.current = n; return n })
      setPhase('playing')
    }
  }

  // Timer effect — resets on each new playing phase for a question
  useEffect(() => {
    if (phase !== 'playing') return
    startTimeRef.current = Date.now()
    setTimeLeft(Q_TIME)
    let t = Q_TIME
    timerRef.current = setInterval(() => {
      t--
      setTimeLeft(t)
      if (t <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        doAnswer('TIMEOUT')
      }
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase, currentQ]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load on mount
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    loadQuestions().then(qs => { setQuestions(qs); questionsRef.current = qs; setPhase('howToPlay') })
  }, [])

  function restartGame() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('loading')
    setQuestions([]); setCurrentQ(0); setTimeLeft(Q_TIME); setUserAnswer(null)
    setScore(0); setTotalPoints(0); setStreak(0); setBestStreak(0)
    setHistory([]); setNextVisible(false); setLastPts(0)
    loadedRef.current = false
    loadQuestions().then(qs => { setQuestions(qs); questionsRef.current = qs; setPhase('howToPlay') })
  }

  const q           = questions[currentQ]
  const timerPct    = (timeLeft / Q_TIME) * 100
  const timerColor  = timeLeft >= 5 ? '#1D9E75' : timeLeft >= 3 ? '#FF9800' : '#EF4444'
  const isCorrectAns= userAnswer !== null && userAnswer !== 'TIMEOUT' && q != null && userAnswer === q.correctAnswer

  function perfMessage() {
    if (score >= 9) return `Market genius! You predicted ${score}/10 correctly. You read the news like a professional trader.`
    if (score >= 7) return `Sharp instincts! You got ${score}/10. With practice you'll be reading markets like a pro.`
    if (score >= 5) return `Getting there! Markets are complex — reviewing the AI explanations will help you improve fast.`
    return `Markets are tricky! The key is understanding cause and effect. Re-read the explanations and try again.`
  }

  const headerChip = (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Chip icon={<IconNews size={13} strokeWidth={1.5} />} label="AI-Powered" size="small"
        sx={{ bgcolor: '#F3F0FF', color: '#7B5FD4', fontWeight: 700, fontSize: 10, height: 22 }} />
    </Stack>
  )

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (phase === 'loading') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, mb: 0.5 }}>News Flash</Typography>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <LottieAnimation animationData={ThinkingAnim} width={140} height={140} loop />
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, mt: 1 }}>
          Loading today&apos;s market headlines…
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5, mb: 2 }}>
          Analysing with AI — this takes about 10 seconds
        </Typography>
        <LinearProgress sx={{ borderRadius: 2, height: 4, bgcolor: 'var(--teal-100)', '& .MuiLinearProgress-bar': { bgcolor: '#1D9E75' } }} />
      </Box>
    </Box>
  )

  // ── HOW TO PLAY ────────────────────────────────────────────────────────────
  if (phase === 'howToPlay') return (
    <Box sx={{ fontFamily: 'var(--font-body)' }}>
      {headerChip}
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>News Flash</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>Predict how markets react to real news</Typography>
      <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '14px', p: 2.5, mb: 2 }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, mb: 1.5 }}>How to Play</Typography>
        {[
          'A real news headline appears on screen',
          'You have 8 seconds to decide',
          'Will the asset go UP or DOWN?',
          'Tap your prediction before time runs out',
          'Claude AI explains the correct answer',
          '10 rounds — beat 7/10 to win!',
        ].map((s, i) => (
          <Stack key={i} direction="row" sx={{ gap: 1.5, mb: 1, alignItems: 'flex-start' }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'var(--teal-400)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i + 1}
            </Box>
            <Typography sx={{ fontSize: 13, lineHeight: 1.5, pt: 0.25 }}>{s}</Typography>
          </Stack>
        ))}
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5, mb: 2, fontStyle: 'italic' }}>
          Real headlines. Real markets. Can you predict what happens next?
        </Typography>
        <Button variant="contained" fullWidth endIcon={<IconArrowRight size={16} strokeWidth={1.5} />}
          onClick={() => setPhase('playing')}
          sx={{ bgcolor: '#1D9E75', borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}>
          Start Game
        </Button>
      </Box>
    </Box>
  )

  // ── PLAYING + FEEDBACK ─────────────────────────────────────────────────────
  if ((phase === 'playing' || phase === 'feedback') && q) {
    const AssetIcon = ICON_MAP[q.assetKey] ?? ICON_MAP['default']
    const tooSlow   = userAnswer === 'TIMEOUT'
    const wrong     = userAnswer !== null && !isCorrectAns && !tooSlow

    return (
      <Box sx={{ fontFamily: 'var(--font-body)' }}>
        {headerChip}
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>News Flash</Typography>

        {/* Score bar */}
        <Stack direction="row" sx={{ gap: 1, mt: 1.5, mb: 1.5 }}>
          {[
            { val: `Round ${currentQ + 1}/10` },
            { val: `Score: ${score}/${phase === 'feedback' ? currentQ + 1 : currentQ}` },
          ].map((s, i) => (
            <Box key={i} sx={{ flex: 1, bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '10px', p: 1, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: LEVEL_COLOR }}>{s.val}</Typography>
            </Box>
          ))}
          <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '10px', p: 1, minWidth: 60, textAlign: 'center' }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <IconFlame size={14} strokeWidth={1.5} color={streak > 0 ? '#FFD700' : '#ccc'} />
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: streak > 0 ? '#C08B00' : 'text.secondary' }}>{streak}</Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Circular timer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <Box sx={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress variant="determinate" value={100} size={56} sx={{ color: '#f0f0f0', position: 'absolute' }} />
            <CircularProgress variant="determinate" value={phase === 'feedback' ? 0 : timerPct} size={56}
              sx={{ color: timerColor, position: 'absolute', transition: 'color 0.3s' }} />
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: timerColor, zIndex: 1, lineHeight: 1 }}>
              {phase === 'feedback' ? '—' : timeLeft}
            </Typography>
          </Box>
        </Box>

        {/* Headline card */}
        <Box sx={{
          bgcolor: 'white', borderRadius: '14px', p: 2.5, mb: 1.5,
          borderLeft: '4px solid #C08B00', border: '1px solid var(--border,#E0E0E0)',
          borderLeftWidth: 4, borderLeftColor: '#C08B00',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', color: '#DC2626' }}>BREAKING NEWS</Typography>
            <Chip label={q.difficulty} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: `${DIFF_COLORS[q.difficulty]}18`, color: DIFF_COLORS[q.difficulty] }} />
          </Stack>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, lineHeight: 1.4, mb: 2 }}>
            &ldquo;{q.headline}&rdquo;
          </Typography>
          <Box sx={{ borderTop: '1px solid #f0f0f0', pt: 1.5 }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>How will this affect:</Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <AssetIcon size={18} strokeWidth={1.5} color={LEVEL_COLOR} />
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: LEVEL_COLOR }}>
                {q.asset.toUpperCase()}
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* Prediction buttons */}
        <Stack direction="row" sx={{ gap: 1.5, mb: 1.5 }}>
          {(['UP', 'DOWN'] as Direction[]).map(dir => {
            const isUser = userAnswer === dir
            const isRight = dir === q.correctAnswer
            const answered = phase === 'feedback'
            let bg = dir === 'UP' ? '#1D9E75' : '#EF4444'
            let opacity = 1
            if (answered) {
              if (tooSlow) { bg = isRight ? '#1D9E75' : '#999'; opacity = isRight ? 1 : 0.3 }
              else { bg = isUser ? (isRight ? '#1D9E75' : '#EF4444') : isRight ? '#1D9E75' : '#ccc'; opacity = isUser ? 1 : isRight ? 0.85 : 0.25 }
            }
            return (
              <Button key={dir} variant="contained" fullWidth disabled={answered}
                onClick={() => doAnswer(dir)}
                startIcon={dir === 'UP' ? <IconArrowUp size={28} strokeWidth={2} /> : <IconArrowDown size={28} strokeWidth={2} />}
                sx={{
                  height: 80, bgcolor: `${bg} !important`, color: 'white !important',
                  borderRadius: '12px', textTransform: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, opacity,
                  transition: 'all 0.2s',
                  animation: (answered && isUser && !isRight) ? 'shake 0.4s ease' : 'none',
                  '@keyframes shake': {
                    '0%,100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                  },
                }}>
                GOES {dir}
              </Button>
            )
          })}
        </Stack>

        {/* Feedback */}
        {phase === 'feedback' && (
          <>
            <Box sx={{
              borderRadius: '10px', p: 1.5, mb: 1.5, textAlign: 'center',
              bgcolor: tooSlow ? '#f5f5f5' : isCorrectAns ? 'var(--teal-50)' : '#fff0f0',
              border: `1px solid ${tooSlow ? '#e0e0e0' : isCorrectAns ? 'var(--teal-100)' : '#fca5a5'}`,
              animation: 'slideUp 0.25s ease',
              '@keyframes slideUp': { from: { transform: 'translateY(10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
            }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                {tooSlow  ? <IconClock       size={18} strokeWidth={1.5} color="#999"      /> :
                 isCorrectAns ? <IconCircleCheck size={18} strokeWidth={1.5} color="#1D9E75"  /> :
                            <IconCircleX    size={18} strokeWidth={1.5} color="#EF4444"  />}
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: tooSlow ? '#666' : isCorrectAns ? '#1D9E75' : '#DC2626' }}>
                  {tooSlow ? 'Too slow!' : isCorrectAns ? `Correct! +${lastPts} points` : 'Not quite this time'}
                </Typography>
              </Stack>
              {isCorrectAns && lastStreakPts > 0 && (
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                  <IconFlame size={13} strokeWidth={1.5} color="#FFD700" />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#C08B00' }}>
                    {streak} in a row! +{lastStreakPts} bonus
                  </Typography>
                </Stack>
              )}
              {wrong && (
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                  Correct answer was {q.correctAnswer}
                </Typography>
              )}
            </Box>

            {/* AI explanation */}
            <Box sx={{ bgcolor: '#F3F0FF', border: '1px solid #E2DAFF', borderRadius: '12px', p: 2, mb: 1.5 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
                <IconRobot size={18} strokeWidth={1.5} color="#7B5FD4" />
                <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#7B5FD4' }}>Why?</Typography>
              </Stack>
              <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
                {q.explanation}
              </Typography>
            </Box>

            {nextVisible && (
              <Button variant="contained" fullWidth endIcon={<IconArrowRight size={16} strokeWidth={1.5} />}
                onClick={nextQuestion}
                sx={{ bgcolor: LEVEL_COLOR, borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25, '&:hover': { bgcolor: '#0a5240' } }}>
                {currentQ >= 9 ? 'See Results' : 'Next →'}
              </Button>
            )}
          </>
        )}
      </Box>
    )
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    const slow  = history.filter(h => h.userAnswer === 'TIMEOUT').length
    const wrong = history.filter(h => !h.isCorrect && h.userAnswer !== 'TIMEOUT').length
    return (
      <Box sx={{ fontFamily: 'var(--font-body)' }}>
        {headerChip}
        <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, mb: 2 }}>News Flash</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <LottieAnimation animationData={score >= 7 ? TrophyWinner : ThinkingAnim} width={160} height={160} loop={false} />
        </Box>

        {/* Score card */}
        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2.5, mb: 2 }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, textAlign: 'center', mb: 0.25 }}>
            {score} / 10
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', mb: 2 }}>
            {totalPoints} total points · best streak {bestStreak}
          </Typography>
          <Stack direction="row" sx={{ justifyContent: 'center', gap: 2 }}>
            {[
              { icon: <IconCircleCheck size={16} strokeWidth={1.5} color="#1D9E75" />, val: score,  label: 'correct', c: '#1D9E75' },
              { icon: <IconCircleX    size={16} strokeWidth={1.5} color="#EF4444" />, val: wrong,  label: 'wrong',   c: '#EF4444' },
              { icon: <IconClock      size={16} strokeWidth={1.5} color="#999"    />, val: slow,   label: 'slow',    c: 'text.secondary' },
            ].map(r => (
              <Stack key={r.label} direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                {r.icon}
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.val} {r.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Round breakdown */}
        <Box sx={{ bgcolor: 'white', border: '1px solid var(--border,#E0E0E0)', borderRadius: '14px', p: 2, mb: 2 }}>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, mb: 1.5 }}>Round by Round</Typography>
          <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
            {history.map((r, i) => (
              <Stack key={i} direction="row" sx={{ alignItems: 'center', gap: 1, py: 0.75, borderBottom: i < history.length - 1 ? '1px solid #f4f4f4' : 'none' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0, width: 18, fontWeight: 600 }}>{i + 1}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.headline.length > 48 ? r.headline.slice(0, 48) + '…' : r.headline}
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  {r.isCorrect
                    ? <IconCircleCheck size={13} strokeWidth={1.5} color="#1D9E75" />
                    : <IconCircleX     size={13} strokeWidth={1.5} color="#EF4444" />}
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: r.isCorrect ? '#1D9E75' : '#EF4444', minWidth: 28 }}>
                    {r.points}pt
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Box>
        </Box>

        {/* Performance */}
        <Box sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', p: 1.5, mb: 2 }}>
          <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'var(--teal-600)', fontWeight: 600 }}>
            {perfMessage()}
          </Typography>
        </Box>

        {/* Insight */}
        <Box sx={{ bgcolor: '#F3F0FF', border: '1px solid #E2DAFF', borderRadius: '10px', p: 1.5, mb: 2.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#7B5FD4', letterSpacing: '0.6px', mb: 0.5 }}>
            REAL WORLD IMPACT
          </Typography>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: 'text.secondary' }}>
            Professional traders spend years learning to predict how news affects markets.
            The fact that you&apos;re practising this now gives you a huge head start.
          </Typography>
        </Box>

        {/* Buttons */}
        <Stack sx={{ gap: 1 }}>
          {!isCompleted ? (
            <Button variant="contained" fullWidth onClick={onComplete}
              sx={{ bgcolor: '#1D9E75', borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}>
              {score >= 7 ? 'Market analyst badge earned!' : 'Keep practising!'} +20 XP
            </Button>
          ) : (
            <Typography sx={{ textAlign: 'center', fontSize: 13, color: '#1D9E75', fontWeight: 600, py: 0.5 }}>
              +20 XP already earned
            </Typography>
          )}
          <Button variant="outlined" fullWidth onClick={restartGame}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.25 }}>
            Play Again
          </Button>
        </Stack>
      </Box>
    )
  }

  return null
}
