import React from 'react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconArrowLeft, IconBookmark, IconBookmarkFilled, IconBookmarkOff,
  IconFlagExclamation, IconX, IconCircleCheck, IconDeviceGamepad2,
} from '@tabler/icons-react'
import { LEVELS } from '../data/gameData'
import { getEmbeddedExercise } from '../data/dragDropExercises'
import { useDragDropState } from '../hooks/useDragDropState'
import DragDropGame from '../components/DragDropGame'
import BondsYieldCalculator from '../components/games/BondsYieldCalculator'
import StocksPortfolioBuilder from '../components/games/StocksPortfolioBuilder'
import ETFsFeeCalculator from '../components/games/ETFsFeeCalculator'
import CryptoRollercoaster from '../components/games/CryptoRollercoaster'
import CurrencyTrader from '../components/games/CurrencyTrader'
import OilBaron from '../components/games/OilBaron'
import FeeDestroyer from '../components/games/FeeDestroyer'
import type { GameState } from '../types'

interface SubLessonPageProps {
  levelId: number
  subLessonId: string
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onBack: () => void
  onComplete: (nextSubLessonId: string | null) => void
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface TermClickState {
  term: string
  definition: string
}

const termStyle: React.CSSProperties = {
  borderBottom: '1.5px dotted #1D9E75',
  color: '#1D9E75',
  cursor: 'pointer',
  fontWeight: 600,
}

function InlineText({
  raw,
  glossary,
  onTermClick,
}: {
  raw: string
  glossary: { term: string; definition: string }[]
  onTermClick: (entry: TermClickState) => void
}) {
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length)

  function detectTerms(text: string, keyBase: string): React.ReactNode[] {
    if (!sorted.length || !text) return [<span key={keyBase}>{text}</span>]
    const pattern = sorted.map(t => escapeRegex(t.term)).join('|')
    // Word boundaries prevent matching "bond" inside "bonds"
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) => {
      if (!part) return null
      const matched = sorted.find(t => t.term.toLowerCase() === part.toLowerCase())
      if (matched) {
        return <span key={`${keyBase}-${i}`} onClick={() => onTermClick(matched)} style={termStyle}>{part}</span>
      }
      return <span key={`${keyBase}-${i}`}>{part}</span>
    })
  }

  // Phase 1: split by **bold** markers so they're never broken up by term detection
  const boldSplit = raw.split(/(\*\*[^*]+\*\*)/g)

  return (
    <>
      {boldSplit.map((seg, i) => {
        if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
          const inner = seg.slice(2, -2)
          const matched = sorted.find(t => t.term.toLowerCase() === inner.toLowerCase())
          if (matched) {
            return <strong key={i}><span onClick={() => onTermClick(matched)} style={termStyle}>{inner}</span></strong>
          }
          return <strong key={i}>{inner}</strong>
        }
        return <React.Fragment key={i}>{detectTerms(seg, String(i))}</React.Fragment>
      })}
    </>
  )
}

export default function SubLessonPage({
  levelId,
  subLessonId,
  gameState,
  showToast,
  onBack,
  onComplete,
}: SubLessonPageProps) {
  const level = LEVELS.find(l => l.id === levelId)!
  const subIdx = level.subLessons.findIndex(s => s.id === subLessonId)
  const subLesson = level.subLessons[subIdx]!
  const glossary = level.glossary ?? []
  const nextSub = level.subLessons[subIdx + 1] ?? null
  const isAlreadyDone = gameState.completedSubLessons.includes(subLessonId)

  const [termDialog, setTermDialog] = useState<TermClickState | null>(null)
  const embeddedExercise = getEmbeddedExercise(subLessonId)
  const { isCompleted, markCompleted } = useDragDropState()

  function handleGameComplete(xp: number) {
    if (!embeddedExercise) return
    markCompleted(embeddedExercise.id, xp)
    gameState.addXP(xp)
    showToast(`+${xp} XP earned!`)
  }

  function handleComplete() {
    if (!isAlreadyDone) {
      gameState.completeSubLesson(subLessonId)
    }
    onComplete(nextSub?.id ?? null)
  }

  const isSaved = termDialog ? gameState.savedGlossary.some(e => e.term === termDialog.term) : false

  function handleSaveTerm() {
    if (!termDialog) return
    if (isSaved) {
      gameState.removeSavedTerm(termDialog.term)
      showToast(
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconBookmarkOff size={14} color="var(--muted)" />{termDialog.term} removed from glossary
        </span>
      )
    } else {
      gameState.saveGlossaryTerm({
        term: termDialog.term,
        definition: termDialog.definition,
        levelId: level.id,
        levelName: level.name,
        savedAt: new Date().toISOString(),
      })
      showToast(
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconBookmarkFilled size={14} color="var(--teal-400)" />{termDialog.term} saved to glossary
        </span>
      )
    }
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 1 }}>
        <IconButton onClick={onBack} size="small" sx={{ flexShrink: 0 }}>
          <IconArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {level.name} — Lesson {subIdx + 1} of {level.subLessons.length}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
            {subLesson.title}
          </Typography>
        </Box>
      </Stack>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={Math.round(((subIdx + 1) / level.subLessons.length) * 100)}
        sx={{
          mb: 3,
          height: 4,
          borderRadius: 2,
          bgcolor: '#f0f0f0',
          '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, var(--teal-100), #1D9E75)', borderRadius: 2 },
        }}
      />

      {/* Tappable terms hint */}
      {glossary.length > 0 && (
        <Typography variant="caption" sx={{ color: 'var(--teal-600)', display: 'block', mb: 2, fontStyle: 'italic' }}>
          Tap underlined terms to learn more
        </Typography>
      )}

      {/* Content blocks */}
      {subLesson.content.map((block, i) => {
        if (block.type === 'text') {
          return (
            <Typography
              key={i}
              variant="body2"
              component="p"
              sx={{ fontSize: 13.5, lineHeight: 1.8, mb: 2 }}
            >
              <InlineText raw={block.value} glossary={glossary} onTermClick={setTermDialog} />
            </Typography>
          )
        }
        if (block.type === 'important') {
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
              <IconFlagExclamation size={18} strokeWidth={1.5} color="var(--red-400)" style={{ flexShrink: 0, marginTop: 3 }} />
              <Typography variant="body2" sx={{ fontSize: 13.5, lineHeight: 1.8 }}>
                <strong>Important: </strong>
                <InlineText raw={block.value} glossary={glossary} onTermClick={setTermDialog} />
              </Typography>
            </Box>
          )
        }
        if (block.type === 'callout') {
          return (
            <Alert
              key={i}
              icon={false}
              severity="success"
              sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', mb: 2, '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="caption" color="var(--teal-600)" sx={{ fontWeight: 700, letterSpacing: '0.8px', display: 'block', mb: 1 }}>
                {block.label.toUpperCase()}
              </Typography>
              {block.items.map((item, j) => (
                <Typography key={j} variant="body2" component="p" sx={{ fontSize: 13, lineHeight: 1.7, mb: 0.5 }}>
                  {'• '}
                  <InlineText raw={item} glossary={glossary} onTermClick={setTermDialog} />
                </Typography>
              ))}
            </Alert>
          )
        }
        return null
      })}

      {embeddedExercise && (
        <DragDropGame
          exercise={embeddedExercise}
          isCompleted={isCompleted(embeddedExercise.id)}
          onComplete={handleGameComplete}
        />
      )}

      {/* Embedded interactive games */}
      {(['bonds-2', 'stocks-3', 'etfs-3', 'crypto-3', 'forex-2', 'commodities-3', 'mutual-funds-3'] as const).includes(subLessonId as 'bonds-2' | 'stocks-3' | 'etfs-3' | 'crypto-3' | 'forex-2' | 'commodities-3' | 'mutual-funds-3') && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 3 }}>
            <Divider sx={{ flex: 1 }} />
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, px: 1 }}>
              <IconDeviceGamepad2 size={15} strokeWidth={1.5} color="var(--teal-400)" />
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--teal-600)' }}>
                Try It Yourself
              </Typography>
            </Stack>
            <Divider sx={{ flex: 1 }} />
          </Box>
          {subLessonId === 'bonds-2' && (
            <BondsYieldCalculator
              isCompleted={gameState.isGameComplete('game-bonds-yield')}
              onComplete={() => { gameState.completeGame('game-bonds-yield', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
          {subLessonId === 'stocks-3' && (
            <StocksPortfolioBuilder
              isCompleted={gameState.isGameComplete('game-stocks-portfolio')}
              onComplete={() => { gameState.completeGame('game-stocks-portfolio', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
          {subLessonId === 'etfs-3' && (
            <ETFsFeeCalculator
              isCompleted={gameState.isGameComplete('game-etfs-fees')}
              onComplete={() => { gameState.completeGame('game-etfs-fees', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
          {subLessonId === 'crypto-3' && (
            <CryptoRollercoaster
              isCompleted={gameState.isGameComplete('game-crypto-rollercoaster')}
              onComplete={() => { gameState.completeGame('game-crypto-rollercoaster', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
          {subLessonId === 'forex-2' && (
            <CurrencyTrader
              isCompleted={gameState.isGameComplete('game-forex-currency-trader')}
              onComplete={() => { gameState.completeGame('game-forex-currency-trader', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
          {subLessonId === 'commodities-3' && (
            <OilBaron
              isCompleted={gameState.isGameComplete('game-commodities-oil-baron')}
              onComplete={() => { gameState.completeGame('game-commodities-oil-baron', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
          {subLessonId === 'mutual-funds-3' && (
            <FeeDestroyer
              isCompleted={gameState.isGameComplete('game-mutualfunds-fee-destroyer')}
              onComplete={() => { gameState.completeGame('game-mutualfunds-fee-destroyer', 20); showToast('+20 XP · Game complete!') }}
            />
          )}
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* CTA */}
      {isAlreadyDone ? (
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography color="var(--teal-600)" sx={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconCircleCheck size={16} strokeWidth={1.5} color="var(--teal-400)" /> Already completed
          </Typography>
          <Button
            variant="outlined"
            onClick={() => onComplete(nextSub?.id ?? null)}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: 13, px: 3 }}
          >
            {nextSub ? 'Next Lesson →' : 'Back to Module'}
          </Button>
        </Stack>
      ) : (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleComplete}
          endIcon={<IconCircleCheck size={16} strokeWidth={1.5} />}
          sx={{ borderRadius: '10px', py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: 14 }}
        >
          {nextSub ? 'Mark Complete & Next Lesson' : 'Mark Complete & Finish Module'}
        </Button>
      )}

      {/* Glossary term dialog */}
      <Dialog
        open={Boolean(termDialog)}
        onClose={() => setTermDialog(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 0 } } }}
      >
        {termDialog && (
          <>
            <DialogTitle
              sx={{ fontWeight: 800, fontSize: 17, fontFamily: 'var(--font-display)', pb: 0.5, pr: 6 }}
            >
              {termDialog.term}
              <IconButton
                size="small"
                onClick={() => setTermDialog(null)}
                sx={{ position: 'absolute', right: 12, top: 12 }}
              >
                <IconX size={18} strokeWidth={1.5} />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: 'text.secondary', mb: 2 }}>
                {termDialog.definition}
              </Typography>
              <Button
                variant={isSaved ? 'outlined' : 'contained'}
                color="primary"
                fullWidth
                size="small"
                startIcon={isSaved ? <IconBookmarkFilled size={15} strokeWidth={1.5} /> : <IconBookmark size={15} strokeWidth={1.5} />}
                onClick={handleSaveTerm}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: 13 }}
              >
                {isSaved ? 'Saved to My Glossary' : 'Add to My Glossary'}
              </Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  )
}
