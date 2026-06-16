import type { ReactNode } from 'react'
import { useState, useRef, useEffect } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import {
  IconCircleCheck, IconCircleX, IconTrophy, IconArrowBack, IconFlagExclamation, IconMountain,
  IconBooks, IconBookmark, IconBookmarkFilled, IconX,
} from '@tabler/icons-react'
import type { Lesson, GlossaryEntry } from '../types'

interface LessonPanelProps {
  lesson: Lesson
  levelId: number
  levelName: string
  completed: boolean
  onComplete: () => void
  showToast: (msg: ReactNode) => void
  glossary?: { term: string; definition: string }[]
  savedGlossary: GlossaryEntry[]
  onSaveGlossaryTerm: (entry: GlossaryEntry) => void
  onRemoveSavedTerm: (term: string) => void
}

function renderText(raw: string): string {
  return raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

type Phase = 'round1' | 'repop_intro' | 'repop' | 'review'

export default function LessonPanel({
  lesson, levelId, levelName, completed, onComplete, showToast,
  glossary, savedGlossary, onSaveGlossaryTerm, onRemoveSavedTerm,
}: LessonPanelProps) {
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('round1')
  const [r1Index, setR1Index] = useState(0)
  const [r1Results, setR1Results] = useState<boolean[]>([])
  const [repopQueue, setRepopQueue] = useState<number[]>([])
  const [repopIdx, setRepopIdx] = useState(0)
  const [repopResults, setRepopResults] = useState<boolean[]>([])
  const [answered, setAnswered] = useState<number | null>(null)
  const [showNextBtn, setShowNextBtn] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (t1.current) clearTimeout(t1.current)
    if (t2.current) clearTimeout(t2.current)
  }, [])

  const totalQ = lesson.quiz.length

  // Derived round-1 state
  const r1Score = r1Results.filter(Boolean).length
  const isEarlyExit = r1Results.length === 2 && r1Score === 2
  const isR1Complete = r1Results.length === totalQ

  // Derived repopulation state
  const repopScore = repopResults.filter(Boolean).length
  const isRepopComplete = repopQueue.length > 0 && repopResults.length === repopQueue.length

  const currentQuiz = phase === 'repop' ? lesson.quiz[repopQueue[repopIdx]] : lesson.quiz[r1Index]
  const isCorrect = answered !== null && answered === currentQuiz?.correct

  // True when the next-button click should complete the level
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

    // Capture current state for the timer closure (user can't submit another answer
    // while answered !== null, so these values won't change before the timer fires)
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

        // Early exit (first 2 both correct) or round complete with passing score
        if ((count === 2 && score === 2) || (count === totalQ && score >= 2)) {
          setShowNextBtn(true)
        } else if (count < totalQ) {
          setShowNextBtn(true)
        } else if (score === 1) {
          // 1/3 → repopulation round
          const missed = newResults.reduce<number[]>((acc, r, i) => (r ? acc : [...acc, i]), [])
          setRepopQueue(missed)
          setPhase('repop_intro')
          t2.current = setTimeout(() => {
            setPhase('repop')
            setAnswered(null)
            setShowNextBtn(false)
          }, 1500)
        } else {
          // 0/3 → review
          setPhase('review')
          panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
          // Failed repopulation → review
          setPhase('review')
          panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          t2.current = setTimeout(doReset, 3000)
        }
      }
    }, 1500)
  }

  function handleNext() {
    if (isCompletionPoint) {
      onComplete()
      return
    }
    if (phase === 'round1') setR1Index(i => i + 1)
    else if (phase === 'repop') setRepopIdx(i => i + 1)
    setAnswered(null)
    setShowNextBtn(false)
  }

  // --- UI computed values ---

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
    ? "Let's review the lesson one more time."
    : "Let's review the lesson before moving on."

  const showQuiz = phase === 'round1' || phase === 'repop'

  return (
    <Paper ref={panelRef} variant="outlined" sx={{ borderColor: 'var(--teal-100)', borderRadius: 'var(--radius)', p: 2.5, mb: 2, mt: '-4px' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
        <Typography variant="h6" color="var(--teal-600)" sx={{ fontSize: 16, fontWeight: 700 }}>
          {lesson.title}
        </Typography>
        {glossary && glossary.length > 0 && (
          <Chip
            icon={<IconBooks size={15} strokeWidth={1.5} />}
            label="Glossary"
            onClick={() => setGlossaryOpen(true)}
            sx={{
              bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 700, fontSize: 15,
              flexShrink: 0, cursor: 'pointer',
              '& .MuiChip-icon': { color: 'var(--teal-600)' },
            }}
          />
        )}
      </Stack>

      {lesson.content.map((block, i) => {
        if (block.type === 'text') {
          return (
            <Typography
              key={i}
              variant="body2"
              color="text.primary"
              sx={{ fontSize: 13.5, lineHeight: 1.75, mb: 1.75 }}
              dangerouslySetInnerHTML={{ __html: renderText(block.value) }}
            />
          )
        }
        if (block.type === 'important') {
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.75 }}>
              <IconFlagExclamation size={18} strokeWidth={1.5} color="var(--red-400)" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography variant="body2" color="text.primary" sx={{ fontSize: 13.5, lineHeight: 1.75 }}>
                <strong>Important</strong>{': '}
                <span dangerouslySetInnerHTML={{ __html: renderText(block.value) }} />
              </Typography>
            </Box>
          )
        }
        if (block.type === 'callout') {
          return (
            <Alert key={i} icon={false} severity="success" sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', mb: 1.75, '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="caption" color="var(--teal-600)" sx={{ fontWeight: 700, letterSpacing: '0.8px', display: 'block', mb: 1 }}>
                {block.label.toUpperCase()}
              </Typography>
              {block.items.map((item, j) => (
                <Typography key={j} variant="body2" sx={{ fontSize: 13, lineHeight: 1.7, mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: '• ' + renderText(item) }}
                />
              ))}
            </Alert>
          )
        }
        return null
      })}

      <Divider sx={{ my: 2 }} />

      {/* Review state */}
      {phase === 'review' && (
        <Alert
          icon={<IconArrowBack size={18} strokeWidth={1.5} />}
          severity="warning"
          sx={{ borderRadius: '8px', border: '1px solid #F5C97A', bgcolor: '#FFFBF0', color: '#8A6000', '& .MuiAlert-icon': { color: '#8A6000' } }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 0.5 }}>Review the lesson</Typography>
          <Typography sx={{ fontSize: 13 }}>{reviewMsg} You'll restart with question 1 in a moment.</Typography>
        </Alert>
      )}

      {/* Repopulation intro */}
      {phase === 'repop_intro' && (
        <Alert severity="info" sx={{ borderRadius: '8px', '& .MuiAlert-icon': { alignItems: 'center' } }}>
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 0.5 }}>So close!</Typography>
          <Typography sx={{ fontSize: 13 }}>
            You got 1 out of {totalQ}. Let's revisit the {repopQueue.length} you missed.
          </Typography>
        </Alert>
      )}

      {/* Active quiz */}
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
                : <IconCircleX    size={18} strokeWidth={1.5} />
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
                endIcon={isCompletionPoint ? <IconTrophy size={16} strokeWidth={1.5} /> : undefined}
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

      {completed && (
        <Typography color="var(--teal-600)" sx={{ fontSize: 13, fontWeight: 600, mt: showQuiz ? 1.5 : 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconCircleCheck size={16} strokeWidth={1.5} color="var(--teal-400)" /> You've already completed this level!
        </Typography>
      )}

      {/* Glossary drawer */}
      <Drawer anchor="bottom" open={glossaryOpen} onClose={() => setGlossaryOpen(false)}>
        <Box sx={{ p: 2.5, maxHeight: '70vh', overflow: 'auto' }}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>Glossary</Typography>
            <IconButton size="small" onClick={() => setGlossaryOpen(false)} sx={{ mt: -0.5, mr: -0.5 }}>
              <IconX size={18} strokeWidth={1.5} />
            </IconButton>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {levelName} · {glossary?.length ?? 0} terms
          </Typography>
          {(glossary ?? []).map(({ term, definition }) => {
            const isSaved = savedGlossary.some(e => e.term === term)
            return (
              <Box key={term} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', mb: 0.25 }}>
                    {term}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'var(--font-body)', lineHeight: 1.65 }}>
                    {definition}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (isSaved) {
                      onRemoveSavedTerm(term)
                      showToast(`${term} removed from glossary`)
                    } else {
                      onSaveGlossaryTerm({ term, definition, levelId, levelName, savedAt: new Date().toISOString() })
                      showToast(`${term} saved to glossary 🔖`)
                    }
                  }}
                  sx={{ flexShrink: 0, mt: 0.25 }}
                >
                  {isSaved
                    ? <IconBookmarkFilled size={20} color="var(--teal-400)" />
                    : <IconBookmark size={20} strokeWidth={1.5} />
                  }
                </IconButton>
              </Box>
            )
          })}
        </Box>
      </Drawer>
    </Paper>
  )
}
