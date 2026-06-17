import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconCircleCheck, IconCircleX, IconGripVertical,
  IconDragDrop, IconTargetArrow,
} from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragDropExercise } from '../data/dragDropExercises'

function shuffleIncorrect(n: number): number[] {
  if (n <= 1) return [0]
  const arr = Array.from({ length: n }, (_, i) => i)
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  } while (arr.every((v, i) => v === i))
  return arr
}

interface SortableItemProps {
  id: string
  text: string
  position: number
  feedback: 'correct' | 'wrong' | null
}

function SortableItem({ id, text, position, feedback }: SortableItemProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id })

  const borderColor = feedback === 'correct'
    ? 'var(--teal-400)'
    : feedback === 'wrong'
    ? '#DC2626'
    : 'var(--border, #E0E0E0)'

  const bgColor = feedback === 'correct'
    ? 'var(--teal-50, #EBF7F3)'
    : feedback === 'wrong'
    ? '#FEE2E2'
    : 'white'

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0 : 1,
      }}
      sx={{ mb: 1 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: '12px 16px',
          borderRadius: '10px',
          border: `1px solid ${borderColor}`,
          bgcolor: bgColor,
          userSelect: 'none',
        }}
      >
        <Typography sx={{
          width: 20, textAlign: 'center', fontWeight: 700, fontSize: 12,
          color: 'text.disabled', flexShrink: 0, fontFamily: 'var(--font-body)',
        }}>
          {position}
        </Typography>
        <Box
          {...listeners}
          sx={{
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'text.disabled',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            touchAction: 'none',
          }}
        >
          <IconGripVertical size={18} strokeWidth={1.5} />
        </Box>
        <Typography sx={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.4 }}>
          {text}
        </Typography>
        {feedback === 'correct' && <IconCircleCheck size={18} strokeWidth={1.5} color="var(--teal-400)" />}
        {feedback === 'wrong' && <IconCircleX size={18} strokeWidth={1.5} color="#DC2626" />}
      </Box>
    </Box>
  )
}

interface DragDropGameProps {
  exercise: DragDropExercise
  isCompleted: boolean
  onComplete: (xp: number) => void
}

export default function DragDropGame({ exercise, isCompleted, onComplete }: DragDropGameProps) {
  const [order, setOrder] = useState<number[]>(() => shuffleIncorrect(exercise.items.length))
  const [submitted, setSubmitted] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Re-init if exercise changes (e.g. navigating between sub-lessons)
  useEffect(() => {
    setOrder(shuffleIncorrect(exercise.items.length))
    setSubmitted(false)
    setAttemptCount(0)
    setHasMoved(false)
    setActiveId(null)
  }, [exercise.id])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  )

  const stringOrder = order.map(String)
  const correctCount = order.filter((itemIdx, posIdx) => itemIdx === posIdx).length
  const allCorrect = correctCount === exercise.items.length
  const activeItemIdx = activeId !== null ? Number(activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const fromIdx = order.indexOf(Number(active.id))
    const toIdx = order.indexOf(Number(over.id))
    if (fromIdx === -1 || toIdx === -1) return
    setOrder(arrayMove(order, fromIdx, toIdx))
    if (!hasMoved) setHasMoved(true)
  }

  function handleSubmit() {
    setSubmitted(true)
    if (allCorrect && !isCompleted) {
      const xp = attemptCount === 0 ? 20 : 5
      onComplete(xp)
    }
  }

  function handleRetry() {
    setOrder(shuffleIncorrect(exercise.items.length))
    setSubmitted(false)
    setHasMoved(false)
    setAttemptCount(a => a + 1)
  }

  const feedbackForPos = (posIdx: number): 'correct' | 'wrong' | null => {
    if (!submitted) return null
    return order[posIdx] === posIdx ? 'correct' : 'wrong'
  }

  return (
    <Box sx={{ mt: 3, mb: 1 }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Chip
          icon={<IconDragDrop size={14} strokeWidth={1.5} />}
          label="Mini-Game"
          size="small"
          sx={{
            bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700, fontSize: 11,
            fontFamily: 'var(--font-body)',
            '& .MuiChip-icon': { color: '#7C3AED', ml: '6px' },
          }}
        />
        {isCompleted && (
          <Chip
            label="Completed"
            size="small"
            icon={<IconCircleCheck size={13} strokeWidth={1.5} />}
            sx={{
              bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 600,
              fontSize: 11, fontFamily: 'var(--font-body)',
              '& .MuiChip-icon': { color: 'var(--teal-400)', ml: '6px' },
            }}
          />
        )}
      </Stack>

      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, mb: 0.5, lineHeight: 1.4 }}>
        {exercise.prompt}
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.disabled', mb: 2 }}>
        Drag the grip handle to reorder
      </Typography>

      {/* Drag area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stringOrder} strategy={verticalListSortingStrategy}>
          {order.map((itemIdx, posIdx) => (
            <SortableItem
              key={String(itemIdx)}
              id={String(itemIdx)}
              text={exercise.items[itemIdx]}
              position={posIdx + 1}
              feedback={feedbackForPos(posIdx)}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeItemIdx !== null && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #7C3AED',
                bgcolor: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                transform: 'scale(1.02)',
                opacity: 0.95,
              }}
            >
              <Box sx={{ color: '#7C3AED', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <IconGripVertical size={18} strokeWidth={1.5} />
              </Box>
              <Typography sx={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14 }}>
                {exercise.items[activeItemIdx]}
              </Typography>
            </Box>
          )}
        </DragOverlay>
      </DndContext>

      {/* Action button */}
      {!submitted && (
        <Button
          fullWidth
          variant="contained"
          disabled={!hasMoved}
          onClick={handleSubmit}
          sx={{
            mt: 1.5,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            py: 1.25,
            bgcolor: '#7C3AED',
            '&:hover': { bgcolor: '#6D28D9' },
            '&.Mui-disabled': { bgcolor: '#DDD6FE', color: '#A78BFA' },
          }}
        >
          Check my answer →
        </Button>
      )}

      {/* Feedback */}
      {submitted && (
        <Box sx={{ mt: 2 }}>
          {allCorrect ? (
            <>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
                <IconTargetArrow size={20} strokeWidth={1.5} color="#7C3AED" />
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#7C3AED' }}>
                  Perfect order!
                </Typography>
              </Stack>
              {!isCompleted && (
                <Chip
                  icon={<IconCircleCheck size={13} strokeWidth={1.5} />}
                  label={`+${attemptCount === 0 ? 20 : 5} XP earned`}
                  sx={{
                    mb: 2,
                    bgcolor: 'var(--teal-50)', color: 'var(--teal-600)',
                    fontWeight: 700, fontFamily: 'var(--font-body)',
                    '& .MuiChip-icon': { color: 'var(--teal-400)', ml: '6px' },
                  }}
                />
              )}
            </>
          ) : (
            <>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#DC2626', mb: 0.5 }}>
                {correctCount === 0
                  ? 'Not quite — here\'s the correct order'
                  : `${correctCount} of ${exercise.items.length} correct — see the right order below`}
              </Typography>
              <Box sx={{ mt: 1.5, p: 2, borderRadius: '10px', bgcolor: '#F8F9FA', border: '1px solid var(--border, #E0E0E0)', mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary', mb: 1, fontFamily: 'var(--font-body)', letterSpacing: '0.5px' }}>
                  CORRECT ORDER
                </Typography>
                {exercise.items.map((item, i) => (
                  <Stack key={i} direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, mb: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 12, color: '#7C3AED', width: 20, textAlign: 'center', flexShrink: 0, pt: '1px' }}>
                      {i + 1}
                    </Typography>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleRetry}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  borderColor: '#7C3AED',
                  color: '#7C3AED',
                  '&:hover': { bgcolor: '#EDE9FE', borderColor: '#7C3AED' },
                }}
              >
                Try again
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  )
}