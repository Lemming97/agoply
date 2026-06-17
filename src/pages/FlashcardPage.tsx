import React, { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconX, IconCards, IconCheck, IconRefresh,
  IconArrowLeft, IconArrowRight, IconBolt,
  IconCircleCheck, IconChartBar,
} from '@tabler/icons-react'
import LottieAnimation from '../components/LottieAnimation'
import TrophyWinner from '../assets/animations/Trophy_Winner.json'
import { useFlashcardSession } from '../hooks/useFlashcardSession'
import type { GameState, GlossaryEntry } from '../types'
import type { ReactNode } from 'react'

interface FlashcardPageProps {
  terms: GlossaryEntry[]
  scopeLabel: string
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onBack: () => void
}

export default function FlashcardPage({ terms, scopeLabel, gameState, onBack }: FlashcardPageProps) {
  const { session, startSession, markGotIt, markReview } = useFlashcardSession()
  const [flipped, setFlipped] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)
  const [exitingCard, setExitingCard] = useState<GlossaryEntry | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [xpAwarded, setXpAwarded] = useState(false)
  const [hasFlipped, setHasFlipped] = useState(false)
  const pointerStartRef = useRef<{ x: number } | null>(null)
  const transitioningRef = useRef(false)

  useEffect(() => { startSession(terms) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Award XP once on completion
  useEffect(() => {
    if (session?.isComplete && !xpAwarded) {
      const xp = (session.totalStarted - session.reviewing.length) * 5
      if (xp > 0) gameState.addXP(xp)
      setXpAwarded(true)
    }
  }, [session?.isComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (transitioningRef.current || !session || session.isComplete) return
      if (e.key === ' ') { e.preventDefault(); handleFlip() }
      if (e.key === 'ArrowRight') doGotIt()
      if (e.key === 'ArrowLeft') doReview()
      if (e.key === 'Escape') setShowExitConfirm(true)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [flipped, session]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleFlip() {
    if (exitDir) return
    if (!hasFlipped) setHasFlipped(true)
    setFlipped(f => !f)
  }

  function transition(dir: 'left' | 'right', action: () => void) {
    if (transitioningRef.current || !session || session.deck.length === 0) return
    transitioningRef.current = true
    setExitingCard(session.deck[0])
    setExitDir(dir)
    action()
    setTimeout(() => {
      setExitingCard(null)
      setFlipped(false)
      setHasFlipped(false)
      setExitDir(null)
      setSwipeX(0)
      transitioningRef.current = false
    }, 300)
  }

  function doGotIt() { transition('right', markGotIt) }
  function doReview() { transition('left', markReview) }

  function handlePointerDown(e: React.PointerEvent) {
    if (exitDir || !session || session.isComplete) return
    pointerStartRef.current = { x: e.clientX }
    setSwiping(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!swiping || !pointerStartRef.current) return
    setSwipeX(e.clientX - pointerStartRef.current.x)
  }

  function handlePointerUp() {
    if (!swiping) return
    setSwiping(false)
    const dx = swipeX
    pointerStartRef.current = null
    setSwipeX(0)
    if (dx > 80) doGotIt()
    else if (dx < -80) doReview()
    else if (Math.abs(dx) < 10) handleFlip()
  }

  function handleStudyAgain() {
    startSession(terms)
    setFlipped(false)
    setHasFlipped(false)
    setExitDir(null)
    setExitingCard(null)
    setSwipeX(0)
    setXpAwarded(false)
    transitioningRef.current = false
  }

  if (!session) return null

  const displayCard = exitingCard ?? (session.deck.length > 0 ? session.deck[0] : null)
  const cardNum = session.totalStarted - session.deck.length + (exitingCard ? 0 : 1)
  const firstTryGotIt = session.totalStarted - session.reviewing.length
  const xpEarned = firstTryGotIt * 5

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>

      {/* Header */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
        <IconButton size="small" onClick={() => session.isComplete ? onBack() : setShowExitConfirm(true)}>
          <IconX size={20} strokeWidth={2} color="var(--muted)" />
        </IconButton>
        <Box sx={{ flex: 1, px: 1 }}>
          <LinearProgress
            variant="determinate"
            value={session.isComplete ? 100 : ((session.totalStarted - session.deck.length) / session.totalStarted) * 100}
            sx={{
              height: 8, borderRadius: 4, bgcolor: 'var(--teal-50)',
              '& .MuiLinearProgress-bar': { bgcolor: 'var(--teal-400)', borderRadius: 4 },
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.25, color: 'text.secondary', fontFamily: 'var(--font-body)' }}>
            {session.isComplete
              ? 'Complete!'
              : `Card ${Math.min(cardNum, session.totalStarted)} of ${session.totalStarted}`}
          </Typography>
        </Box>
        {scopeLabel && (
          <Chip
            label={scopeLabel}
            size="small"
            sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontFamily: 'var(--font-body)', fontSize: 11, height: 24 }}
          />
        )}
      </Stack>

      {/* ── Completion screen ── */}
      {session.isComplete ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2 }}>
          <LottieAnimation animationData={TrophyWinner} width={180} height={180} loop={false} />

          <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, mt: 1, mb: 2.5 }}>
            Session Complete!
          </Typography>

          <Paper elevation={0} sx={{ width: '100%', maxWidth: 360, border: '1px solid', borderColor: 'var(--teal-100)', borderRadius: '12px', p: 2.5, mb: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: '6px' }}>
                  <IconCircleCheck size={18} strokeWidth={1.5} color="var(--teal-400)" />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Got it first try</Typography>
                </Stack>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>{firstTryGotIt} terms</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: '6px' }}>
                  <IconRefresh size={18} strokeWidth={1.5} color="#DC2626" />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Review again</Typography>
                </Stack>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14 }}>{session.reviewing.length} terms</Typography>
              </Stack>
              <Box sx={{ height: '1px', bgcolor: 'var(--teal-100)' }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: '6px' }}>
                  <IconChartBar size={18} strokeWidth={1.5} color="#2E86AB" />
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 14 }}>Score</Typography>
                </Stack>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--teal-600)' }}>
                  {session.score}%
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {xpEarned > 0 && (
            <Stack direction="row" sx={{ alignItems: 'center', gap: '6px', mb: 3 }}>
              <IconBolt size={16} strokeWidth={1.5} color="#C08B00" />
              <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--teal-600)' }}>
                +{xpEarned} XP earned!
              </Typography>
            </Stack>
          )}

          <Stack direction="row" spacing={1.5} sx={{ width: '100%', maxWidth: 360 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleStudyAgain}
              sx={{ textTransform: 'none', borderRadius: '10px', borderColor: 'var(--teal-400)', color: 'var(--teal-600)', fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Study Again
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={onBack}
              sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: 'var(--teal-400)', fontFamily: 'var(--font-body)', fontWeight: 700, '&:hover': { bgcolor: 'var(--teal-600)' } }}
            >
              Back to Glossary
            </Button>
          </Stack>
        </Box>

      ) : (
        /* ── Active session ── */
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Swipe / exit outer wrapper */}
          <Box
            sx={{ width: '100%', maxWidth: 500, mx: 'auto', mt: 2, mb: 1, touchAction: 'pan-y', cursor: 'pointer' }}
            style={{
              transform: exitDir === 'right'
                ? 'translateX(110%) rotate(8deg)'
                : exitDir === 'left'
                ? 'translateX(-110%) rotate(-8deg)'
                : `translateX(${swipeX}px) rotate(${swipeX * 0.018}deg)`,
              transition: exitDir
                ? 'transform 0.3s ease-in'
                : swiping ? 'none' : swipeX !== 0 ? 'transform 0.2s ease-out' : 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* 3-D flip inner wrapper */}
            <Box
              style={{
                position: 'relative',
                width: '100%',
                height: 280,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.4s ease-in-out',
                transform: flipped ? 'rotateY(180deg) scale(1.02)' : 'rotateY(0deg) scale(1)',
              }}
            >
              {/* Front face */}
              <Box
                style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                sx={{
                  bgcolor: 'var(--teal-50)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  p: 3,
                  userSelect: 'none',
                }}
              >
                <Box sx={{ position: 'absolute', top: 16, right: 16, color: 'var(--teal-300, #5DCAA5)' }}>
                  <IconCards size={20} strokeWidth={1.5} />
                </Box>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, textAlign: 'center', lineHeight: 1.3, color: '#05352a' }}>
                  {displayCard?.term}
                </Typography>
                <Typography sx={{ position: 'absolute', bottom: 20, fontSize: 11, color: 'text.disabled', fontFamily: 'var(--font-body)' }}>
                  {hasFlipped ? 'Tap to flip' : 'Tap to see definition'}
                </Typography>
              </Box>

              {/* Back face */}
              <Box
                style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}
                sx={{
                  bgcolor: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid',
                  borderColor: 'var(--teal-100)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  p: 3,
                  userSelect: 'none',
                  overflow: 'hidden',
                }}
              >
                {/* Swipe tint overlays */}
                <Box style={{
                  position: 'absolute', inset: 0, borderRadius: '20px',
                  backgroundColor: 'rgba(29, 158, 117, 0.22)',
                  opacity: Math.max(0, swipeX) / 160,
                  pointerEvents: 'none',
                }} />
                <Box style={{
                  position: 'absolute', inset: 0, borderRadius: '20px',
                  backgroundColor: 'rgba(220, 38, 38, 0.22)',
                  opacity: Math.max(0, -swipeX) / 160,
                  pointerEvents: 'none',
                }} />

                <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'text.secondary', mb: 1.5, lineHeight: 1.3 }}>
                  {displayCard?.term}
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.75, flex: 1, display: 'flex', alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                  {displayCard?.definition}
                </Typography>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip
                    label={displayCard?.levelName}
                    size="small"
                    sx={{ bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontFamily: 'var(--font-body)', fontSize: 11, height: 22 }}
                  />
                  <Typography sx={{ fontSize: 11, color: 'text.disabled', fontFamily: 'var(--font-body)' }}>
                    Tap to flip back
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Action buttons — always visible */}
          {!exitDir && (
            <Stack direction="row" spacing={2} sx={{ width: '100%', maxWidth: 500, mt: 1 }}>
              <Button
                fullWidth
                startIcon={<IconRefresh size={16} strokeWidth={1.5} />}
                onClick={doReview}
                sx={{
                  bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700,
                  textTransform: 'none', borderRadius: '12px', py: 1.5,
                  fontFamily: 'var(--font-body)',
                  '&:hover': { bgcolor: '#FECACA' },
                }}
              >
                Review again
              </Button>
              <Button
                fullWidth
                startIcon={<IconCheck size={16} strokeWidth={1.5} />}
                onClick={doGotIt}
                sx={{
                  bgcolor: 'var(--teal-400)', color: 'white', fontWeight: 700,
                  textTransform: 'none', borderRadius: '12px', py: 1.5,
                  fontFamily: 'var(--font-body)',
                  '&:hover': { bgcolor: 'var(--teal-600)' },
                }}
              >
                Got it ✓
              </Button>
            </Stack>
          )}

          {/* Count + keyboard hint */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', mb: 0.5 }}>
              {session.deck.length} card{session.deck.length !== 1 ? 's' : ''} left
            </Typography>
            <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
              <IconArrowLeft size={14} strokeWidth={1.5} color="var(--muted)" />
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'text.disabled' }}>
                Review again · Space to flip · Got it
              </Typography>
              <IconArrowRight size={14} strokeWidth={1.5} color="var(--muted)" />
            </Stack>
          </Box>
        </Box>
      )}

      {/* Exit confirm dialog */}
      <Dialog open={showExitConfirm} onClose={() => setShowExitConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, pb: 0.5 }}>
          Exit session?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'text.secondary' }}>
            Your progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setShowExitConfirm(false)} sx={{ textTransform: 'none', color: 'text.secondary', fontFamily: 'var(--font-body)' }}>
            Keep studying
          </Button>
          <Button
            variant="contained"
            onClick={onBack}
            sx={{ textTransform: 'none', bgcolor: 'var(--teal-400)', fontFamily: 'var(--font-body)', fontWeight: 700, '&:hover': { bgcolor: 'var(--teal-600)' } }}
          >
            Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}