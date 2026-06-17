import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IconArrowLeft, IconDragDrop } from '@tabler/icons-react'
import DragDropGame from '../components/DragDropGame'
import { getStandaloneExercise } from '../data/dragDropExercises'
import { useDragDropState } from '../hooks/useDragDropState'
import { LEVELS } from '../data/gameData'
import type { GameState } from '../types'

interface DragDropPageProps {
  levelId: number
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onBack: () => void
}

export default function DragDropPage({ levelId, gameState, showToast, onBack }: DragDropPageProps) {
  const exercise = getStandaloneExercise(levelId)
  const level = LEVELS.find(l => l.id === levelId)
  const { isCompleted, markCompleted } = useDragDropState()

  if (!exercise || !level) {
    return (
      <Box sx={{ maxWidth: 640, mx: 'auto', textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">No exercise found for this level.</Typography>
      </Box>
    )
  }

  function handleComplete(xp: number) {
    markCompleted(exercise!.id, xp)
    gameState.addXP(xp)
    showToast(`+${xp} XP earned!`)
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
            {level.name} · Practice
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <IconDragDrop size={16} strokeWidth={1.5} color="#7C3AED" />
            <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
              Drag & Drop
            </Typography>
          </Stack>
        </Box>
        <Chip
          label="Standalone"
          size="small"
          sx={{
            bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 600,
            fontSize: 11, fontFamily: 'var(--font-body)',
          }}
        />
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <DragDropGame
        exercise={exercise}
        isCompleted={isCompleted(exercise.id)}
        onComplete={handleComplete}
      />
    </Box>
  )
}