import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import {
  IconArrowLeft, IconCircleCheck, IconLock, IconSparkles,
  IconBuildingBank, IconTrendingUp, IconCurrencyBitcoin, IconCurrencyEuro,
  IconBarrel, IconChartPie, IconBuildingStore, IconTrophy,
} from '@tabler/icons-react'
import LottieAnimation from '../components/LottieAnimation'
import { LEVELS } from '../data/gameData'
import type { GameState } from '../types'

interface LevelDetailPageProps {
  levelId: number
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onBack: () => void
  onOpenSubLesson: (subLessonId: string) => void
  onStartQuiz: () => void
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

export default function LevelDetailPage({ levelId, gameState, onBack, onOpenSubLesson, onStartQuiz }: LevelDetailPageProps) {
  const level = LEVELS.find(l => l.id === levelId)!
  const cfg = LEVEL_CONFIG[level.id]
  const color = cfg?.color ?? '#1D9E75'

  const completedSubs = level.subLessons.filter(sl => gameState.completedSubLessons.includes(sl.id))
  const allSubsDone = completedSubs.length === level.subLessons.length && level.subLessons.length > 0
  const levelAlreadyCompleted = gameState.completedLevels.includes(level.id)
  const pct = level.subLessons.length === 0 ? 0 : Math.round((completedSubs.length / level.subLessons.length) * 100)

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* Back button */}
      <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 0.5 }}>
        <IconButton onClick={onBack} size="small">
          <IconArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={onBack}>
          Back to Learn
        </Typography>
      </Stack>

      {/* Hero */}
      <Box
        sx={{
          borderRadius: '20px',
          bgcolor: color,
          p: 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 220,
        }}
      >
        {/* Watermark number */}
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

        {level.animation && (
          <LottieAnimation animationData={level.animation} height={140} width={140} />
        )}

        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: '#fff', textAlign: 'center', fontFamily: 'var(--font-display)', mt: 1, position: 'relative', zIndex: 1 }}
        >
          {level.name}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', mt: 0.25, position: 'relative', zIndex: 1 }}>
          {level.subtitle}
        </Typography>

        {levelAlreadyCompleted && (
          <Chip
            icon={<IconTrophy size={14} strokeWidth={1.5} />}
            label="Completed"
            sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700, fontSize: 12, position: 'relative', zIndex: 1 }}
          />
        )}
      </Box>

      {/* Progress */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)' }}>
          Module Progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {completedSubs.length}/{level.subLessons.length} lessons complete
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          mb: 3,
          height: 6,
          borderRadius: 3,
          bgcolor: '#f0f0f0',
          '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 3 },
        }}
      />

      {/* Sub-lesson list */}
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.8px', color: 'text.secondary', display: 'block', mb: 1.5 }}>
        LESSONS
      </Typography>

      <Stack sx={{ gap: 1, mb: 3 }}>
        {level.subLessons.map((sl, idx) => {
          const done = gameState.completedSubLessons.includes(sl.id)
          const prevDone = idx === 0 || gameState.completedSubLessons.includes(level.subLessons[idx - 1].id)
          const isLocked = !prevDone
          const isCurrent = !done && prevDone

          return (
            <Box
              key={sl.id}
              onClick={() => !isLocked && onOpenSubLesson(sl.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: '14px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${isCurrent ? color : 'var(--border)'}`,
                bgcolor: done ? 'var(--teal-50)' : isCurrent ? `${color}08` : '#fafafa',
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.5 : 1,
                transition: 'box-shadow 0.15s, transform 0.15s',
                ...(!isLocked && { '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }),
              }}
            >
              {/* Number circle */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: done ? color : isCurrent ? `${color}18` : '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <IconCircleCheck size={20} strokeWidth={2} color="#fff" />
                ) : isLocked ? (
                  <IconLock size={16} strokeWidth={1.5} color="#aaa" />
                ) : (
                  <Typography sx={{ fontWeight: 800, fontSize: 14, color }}>
                    {idx + 1}
                  </Typography>
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                  {sl.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {done ? 'Completed' : isCurrent ? 'Continue' : 'Locked'}
                </Typography>
              </Box>

              {done && (
                <Chip
                  label="✓"
                  size="small"
                  sx={{ bgcolor: color, color: '#fff', fontWeight: 700, height: 22, fontSize: 11, flexShrink: 0 }}
                />
              )}
            </Box>
          )
        })}
      </Stack>

      {/* Quiz CTA */}
      <Box
        sx={{
          p: '16px 20px',
          borderRadius: '14px',
          border: `1.5px solid ${allSubsDone ? color : 'var(--border)'}`,
          bgcolor: allSubsDone ? `${color}0a` : '#fafafa',
          opacity: allSubsDone ? 1 : 0.6,
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              {levelAlreadyCompleted ? 'Quiz Passed ✓' : 'Final Quiz'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {allSubsDone
                ? levelAlreadyCompleted ? 'You\'ve already passed this quiz' : `${level.quiz.length} questions · Earn 50 XP`
                : `Complete all ${level.subLessons.length} lessons to unlock`
              }
            </Typography>
          </Box>
          <Button
            variant={allSubsDone && !levelAlreadyCompleted ? 'contained' : 'outlined'}
            size="small"
            disabled={!allSubsDone || levelAlreadyCompleted}
            onClick={onStartQuiz}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              flexShrink: 0,
              fontSize: 13,
              px: 2,
              ...(allSubsDone && !levelAlreadyCompleted && { bgcolor: color, '&:hover': { bgcolor: color, opacity: 0.9 } }),
            }}
          >
            {levelAlreadyCompleted ? 'Done' : 'Start Quiz'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
