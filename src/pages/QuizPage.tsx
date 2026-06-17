import type { ReactNode } from 'react'
import { useState, useRef, useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconArrowLeft, IconArrowBack, IconCircleCheck, IconCircleX,
  IconMountain, IconSparkles, IconTrophy,
  IconBuildingBank, IconTrendingUp, IconCurrencyBitcoin, IconCurrencyEuro,
  IconBarrel, IconChartPie, IconBuildingStore,
} from '@tabler/icons-react'
import LottieAnimation from '../components/LottieAnimation'
import TrophyWinner from '../assets/animations/Trophy_Winner.json'
import MoneyAnim from '../assets/animations/money_1.json'
import { LEVELS } from '../data/gameData'
import type { GameState } from '../types'

type QuizPhase = 'intro' | 'round1' | 'repop_intro' | 'repop' | 'review' | 'done'

interface QuizPageProps {
  levelId: number
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onBack: () => void
}

type IconComponent = React.ComponentType<{ size: number; strokeWidth: number; color: string }>

const LEVEL_CONFIG: Record<number, { color: string; Icon: IconComponent }> = {
  1: { color: '#1D9E75', Icon: IconBuildingBank    },
  2: { color: '#2E86AB', Icon: IconTrendingUp      },
  3: { color: '#7B5FD4', Icon: IconCurrencyBitcoin },
  4: { color: '#C08B00', Icon: IconCurrencyEuro    },
  5: { color: '#E07B39', Icon: IconBarrel          },
  6: { color: '#3AAFA9', Icon: IconChartPie        },
  7: { color: '#D45F8A', Icon: IconBuildingStore   },
  8: { color: '#0F6E56', Icon: IconSparkles        },
}

export default function QuizPage({ levelId, gameState, showToast, onBack }: QuizPageProps) {
  const level = LEVELS.find(l => l.id === levelId)!
  const quiz = level.quiz
  const cfg = LEVEL_CONFIG[level.id]
  const color = cfg?.color ?? '#1D9E75'
  const LevelIcon: IconComponent = cfg?.Icon ?? IconSparkles

  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [r1Index, setR1Index] = useState(0)
  const [r1Results, setR1Results] = useState<boolean[]>([])
  const [repopQueue, setRepopQueue] = useState<number[]>([])
  const [repopIdx, setRepopIdx] = useState(0)
  const [repopResults, setRepopResults] = useState<boolean[]>([])
  const [answered, setAnswered] = useState<number | null>(null)
  const [showNextBtn, setShowNextBtn] = useState(false)
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (t1.current) clearTimeout(t1.current)
    if (t2.current) clearTimeout(t2.current)
  }, [])

  const totalQ = quiz.length
  const r1Score = r1Results.filter(Boolean).length
  const isEarlyExit = r1Results.length === 2 && r1Score === 2
  const isR1Complete = r1Results.length === totalQ
  const repopScore = repopResults.filter(Boolean).length
  const isRepopComplete = repopQueue.length > 0 && repopResults.length === repopQueue.length
  const currentQuiz = phase === 'repop' ? quiz[repopQueue[repopIdx]] : quiz[r1Index]
  const isCorrect = answered !== null && answered === currentQuiz?.correct
  const isCompletionPoint = showNextBtn && (
    (phase === 'round1' && (isEarlyExit || (isR1Complete && r1Score >= 2))) ||
    (phase === 'repop' && isRepopComplete && repopScore === repopQueue.length)
  )

  function doReset() {
    setPhase('round1')
    setR1Index(0)
    setR1Results([])
    setRepopQueue([])
    setRepopIdx(0)
    setRepopResults([])
    setAnswered(null)
    setShowNextBtn(false)
  }

  function handleAnswer(idx: number) {
    if (answered !== null || !currentQuiz) return
    setAnswered(idx)
    const correct = idx === currentQuiz.correct
    const capPhase = phase
    const capR1Results = r1Results
    const capRepopResults = repopResults
    const capRepopQueue = repopQueue

    if (t1.current) clearTimeout(t1.current)
    t1.current = setTimeout(() => {
      if (capPhase === 'round1') {
        const newResults = [...capR1Results, correct]
        setR1Results(newResults)
        const score = newResults.filter(Boolean).length
        const count = newResults.length

        if ((count === 2 && score === 2) || (count === totalQ && score >= 2)) {
          setShowNextBtn(true)
        } else if (count < totalQ) {
          setShowNextBtn(true)
        } else if (score === 1) {
          const missed = newResults.reduce<number[]>((acc, r, i) => (r ? acc : [...acc, i]), [])
          setRepopQueue(missed)
          setPhase('repop_intro')
          t2.current = setTimeout(() => {
            setPhase('repop')
            setAnswered(null)
            setShowNextBtn(false)
          }, 1500)
        } else {
          setPhase('review')
          window.scrollTo({ top: 0, behavior: 'smooth' })
          t2.current = setTimeout(doReset, 3000)
        }
      } else if (capPhase === 'repop') {
        const newRepopResults = [...capRepopResults, correct]
        setRepopResults(newRepopResults)
        const rScore = newRepopResults.filter(Boolean).length
        const repopDone = newRepopResults.length === capRepopQueue.length

        if (!repopDone) {
          setShowNextBtn(true)
        } else if (rScore === capRepopQueue.length) {
          setShowNextBtn(true)
        } else {
          setPhase('review')
          window.scrollTo({ top: 0, behavior: 'smooth' })
          t2.current = setTimeout(doReset, 3000)
        }
      }
    }, 1500)
  }

  function handleNext() {
    if (isCompletionPoint) {
      gameState.completeLevel(level.id)
      setPhase('done')
      showToast(
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
          <LottieAnimation animationData={MoneyAnim} height={20} width={20} loop={false} />
          <span>Level complete! +50 XP · €100 virtual cash added!</span>
        </Stack>
      )
      return
    }
    if (phase === 'round1') setR1Index(i => i + 1)
    else if (phase === 'repop') setRepopIdx(i => i + 1)
    setAnswered(null)
    setShowNextBtn(false)
  }

  let completionMsg = ''
  if (isCompletionPoint) {
    if (phase === 'repop') {
      completionMsg = 'You got them this time!'
    } else {
      const n = r1Results.length
      completionMsg = r1Score === n
        ? `${r1Score} out of ${n} — perfect!`
        : `${r1Score} out of ${n} — nice work!`
    }
  }

  const progressText = phase === 'repop'
    ? `Retry — Question ${repopIdx + 1} of ${repopQueue.length}  ·  ${repopScore} correct so far`
    : `Question ${r1Index + 1} of ${totalQ}  ·  ${r1Score} correct so far`

  const reviewMsg = repopQueue.length > 0
    ? 'Let\'s review the lesson one more time.'
    : 'Let\'s review the lesson before moving on.'

  const showQuiz = phase === 'round1' || phase === 'repop'

  // Intro screen
  if (phase === 'intro') {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 3, gap: 0.5 }}>
          <IconButton onClick={onBack} size="small">
            <IconArrowLeft size={20} strokeWidth={1.5} />
          </IconButton>
          <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={onBack}>
            Back to Module
          </Typography>
        </Stack>

        <Box
          sx={{
            borderRadius: '20px',
            bgcolor: color,
            p: 4,
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              bottom: -28,
              right: 8,
              fontSize: 160,
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'rgba(255,255,255,0.12)',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {level.id}
          </Typography>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <LevelIcon size={36} strokeWidth={1.5} color="#fff" />
          </Box>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {level.name} Quiz
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {level.subtitle}
          </Typography>
        </Box>

        <Stack sx={{ gap: 1.5, mb: 3 }}>
          {[
            { icon: '❓', label: `${totalQ} questions` },
            { icon: '⚡', label: '+50 XP on completion' },
            { icon: '💶', label: '€100 virtual cash added to your portfolio' },
          ].map(({ icon, label }) => (
            <Stack key={label} direction="row" sx={{ alignItems: 'center', gap: 1.5, p: '12px 16px', borderRadius: '10px', bgcolor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Typography sx={{ fontSize: 18 }}>{icon}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{label}</Typography>
            </Stack>
          ))}
        </Stack>

        <Button
          variant="contained"
          fullWidth
          onClick={() => setPhase('round1')}
          startIcon={<IconTrophy size={18} strokeWidth={1.5} />}
          sx={{
            borderRadius: '12px',
            py: 1.75,
            fontWeight: 800,
            fontSize: 15,
            textTransform: 'none',
            bgcolor: color,
            '&:hover': { bgcolor: color, opacity: 0.9 },
          }}
        >
          Start Quiz
        </Button>
      </Box>
    )
  }

  // Done state
  if (phase === 'done') {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto' }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 2.5, gap: 0.5 }}>
          <IconButton onClick={onBack} size="small">
            <IconArrowLeft size={20} strokeWidth={1.5} />
          </IconButton>
        </Stack>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
          <LottieAnimation
            animationData={TrophyWinner}
            height={200}
            width={200}
            loop={false}
            onComplete={() => setTimeout(onBack, 1000)}
          />
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'var(--font-display)', mt: 1 }}>
            Level Complete!
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            +50 XP · €100 virtual cash added
          </Typography>
        </Box>
      </Box>
    )
  }

  // Quiz in progress
  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 1 }}>
        <IconButton onClick={onBack} size="small" sx={{ flexShrink: 0 }}>
          <IconArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
            {level.name} — Quiz
          </Typography>
          <Typography variant="caption" color="text.secondary">Back to Module</Typography>
        </Box>
      </Stack>

      {phase === 'review' && (
        <Alert
          icon={<IconArrowBack size={18} strokeWidth={1.5} />}
          severity="warning"
          sx={{ mb: 2, borderRadius: '8px', border: '1px solid #F5C97A', bgcolor: '#FFFBF0', color: '#8A6000', '& .MuiAlert-icon': { color: '#8A6000' } }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 0.5 }}>Review the lesson</Typography>
          <Typography sx={{ fontSize: 13 }}>{reviewMsg} You'll restart in a moment.</Typography>
        </Alert>
      )}

      {phase === 'repop_intro' && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '8px', '& .MuiAlert-icon': { alignItems: 'center' } }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 0.5 }}>So close!</Typography>
          <Typography sx={{ fontSize: 13 }}>
            You got 1 out of {totalQ}. Let's revisit the {repopQueue.length} you missed.
          </Typography>
        </Alert>
      )}

      {showQuiz && currentQuiz && (
        <>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.25 }}>
            {progressText}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
            <IconMountain size={18} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Challenge: {currentQuiz.question}
            </Typography>
          </Box>

          {currentQuiz.options.map((opt, i) => {
            let bg = 'var(--surface)', borderColor = 'var(--border)', color = 'var(--text)'
            if (answered !== null) {
              if (i === currentQuiz.correct) { bg = 'var(--teal-50)'; borderColor = '#1D9E75'; color = 'var(--teal-600)' }
              else if (i === answered && !isCorrect) { bg = 'var(--red-50)'; borderColor = '#E24B4A'; color = '#A32D2D' }
            }
            return (
              <Button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered !== null}
                variant="outlined"
                sx={{
                  display: 'flex', width: '100%', justifyContent: 'flex-start',
                  py: '10px', px: '14px', mb: '8px',
                  borderColor, borderWidth: '1.5px', borderRadius: '8px',
                  bgcolor: bg, color,
                  fontSize: '13px', fontWeight: answered !== null && i === currentQuiz.correct ? 600 : 400,
                  textTransform: 'none',
                  '&:hover': { bgcolor: bg, borderColor, borderWidth: '1.5px' },
                  '&.Mui-disabled': { bgcolor: bg, color, borderColor, borderWidth: '1.5px', opacity: 1 },
                }}
              >
                {opt}
              </Button>
            )
          })}

          {answered !== null && (
            <Alert
              icon={isCorrect
                ? <IconCircleCheck size={18} strokeWidth={1.5} />
                : <IconCircleX size={18} strokeWidth={1.5} />
              }
              severity={isCorrect ? 'success' : 'error'}
              sx={{ mt: 1, borderRadius: '8px', border: `1px solid ${isCorrect ? 'var(--teal-100)' : '#F09595'}`, bgcolor: isCorrect ? 'var(--teal-50)' : 'var(--red-50)', color: isCorrect ? 'var(--teal-600)' : '#A32D2D', '& .MuiAlert-icon': { color: isCorrect ? 'var(--teal-600)' : '#A32D2D' } }}
            >
              {isCorrect ? 'Correct! ' : 'Not quite. '}{currentQuiz.explanation}
            </Alert>
          )}

          {showNextBtn && (
            <Box sx={{ mt: 2 }}>
              {completionMsg && (
                <Alert
                  icon={<IconCircleCheck size={18} strokeWidth={1.5} />}
                  severity="success"
                  sx={{ mb: 1.5, borderRadius: '8px', border: '1px solid var(--teal-100)', bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', '& .MuiAlert-icon': { color: 'var(--teal-600)' } }}
                >
                  {completionMsg}
                </Alert>
              )}
              <Button
                onClick={handleNext}
                variant={isCompletionPoint ? 'contained' : 'outlined'}
                color="primary"
                endIcon={isCompletionPoint ? <IconCircleCheck size={16} strokeWidth={1.5} /> : undefined}
                sx={{
                  borderRadius: '10px', px: 3, py: 1.5, fontSize: 13, fontWeight: 700, textTransform: 'none',
                  ...(!isCompletionPoint && { borderColor: 'var(--border)', color: 'var(--text)', '&:hover': { borderColor: 'var(--text)' } }),
                }}
              >
                {isCompletionPoint
                  ? 'Complete Level & Earn Rewards'
                  : isCorrect ? 'Next question →' : 'Try a new question →'
                }
              </Button>
            </Box>
          )}
        </>
      )}

      <Divider sx={{ my: 3, display: showQuiz ? 'block' : 'none' }} />
    </Box>
  )
}
