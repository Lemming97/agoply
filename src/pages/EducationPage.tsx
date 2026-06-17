import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import {
  IconCircleCheck, IconLock, IconSparkles,
  IconBuildingBank, IconTrendingUp, IconCurrencyBitcoin, IconCurrencyEuro,
  IconBarrel, IconChartPie, IconBuildingStore,
} from '@tabler/icons-react'
import { LEVELS } from '../data/gameData'
import type { GameState, Level, LevelStatus } from '../types'

interface EducationPageProps {
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onOpenLesson: (levelId: number) => void
}

export default function EducationPage({ gameState, showToast, onOpenLesson }: EducationPageProps) {
  function getLevelStatus(level: Level): LevelStatus {
    if (gameState.completedLevels.includes(level.id)) return 'completed'
    if (gameState.activeLesson === level.id) return 'active'
    if (level.id < gameState.activeLesson) return 'active'
    return 'locked'
  }

  function handleLevelClick(level: Level) {
    const status = getLevelStatus(level)
    if (status === 'locked') { showToast('🔒 Complete the previous level first!'); return }
    if (!level.lesson) { showToast('This level is coming soon!'); return }
    onOpenLesson(level.id)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Your Learning Path</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete lessons to unlock investment instruments in the Simulator
      </Typography>

      <Grid container spacing={2}>
        {LEVELS.map(level => {
          const status = getLevelStatus(level)
          return (
            <Grid key={level.id} size={{ xs: 12, sm: 6 }}>
              <LevelCard level={level} status={status} onClick={() => handleLevelClick(level)} />
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

function LevelIcon({ levelId, isLocked }: { levelId: number; isLocked: boolean }) {
  const color = isLocked ? '#ccc' : 'var(--teal-400)'
  const props = { size: 48, strokeWidth: 1.5, color } as const
  switch (levelId) {
    case 1: return <IconBuildingBank   {...props} />
    case 2: return <IconTrendingUp     {...props} />
    case 3: return <IconCurrencyBitcoin {...props} />
    case 4: return <IconCurrencyEuro   {...props} />
    case 5: return <IconBarrel         {...props} />
    case 6: return <IconChartPie       {...props} />
    case 7: return <IconBuildingStore  {...props} />
    case 8: return <IconSparkles       {...props} />
    default: return null
  }
}

interface LevelCardProps {
  level: Level
  status: LevelStatus
  onClick: () => void
}

function LevelCard({ level, status, onClick }: LevelCardProps) {
  const isLocked = status === 'locked'
  const pct = status === 'completed' ? 100 : status === 'active' ? 45 : 0

  const chipContent: Record<LevelStatus, ReactNode> = {
    completed: (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconCircleCheck size={15} strokeWidth={1.5} />
        <span>Done</span>
      </Stack>
    ),
    active: 'In Progress',
    locked: (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconLock size={15} strokeWidth={1.5} />
        <span>Locked</span>
      </Stack>
    ),
  }

  const chipSx: Record<LevelStatus, object> = {
    completed: { bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 700, fontSize: 15 },
    active:    { bgcolor: 'var(--gold-50)', color: 'var(--gold-400)', fontWeight: 700, fontSize: 15 },
    locked:    { bgcolor: '#f5f5f5',        color: '#aaa',            fontWeight: 700, fontSize: 15 },
  }

  let chipLabel: ReactNode = chipContent[status]
  let chipStyle = chipSx[status]
  if (level.isAI && isLocked) {
    chipLabel = (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconSparkles size={13} strokeWidth={1.5} />
        <span>AI Level</span>
      </Stack>
    )
    chipStyle = { ...chipStyle, bgcolor: 'var(--purple-50)', color: 'var(--purple-600)', fontWeight: 700 }
  }

  const badgeSx = isLocked
    ? { bgcolor: '#e0e0e0', color: '#aaa' }
    : status === 'completed'
    ? { bgcolor: '#1D9E75', color: '#fff' }
    : { bgcolor: 'var(--teal-400)', color: '#fff' }

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid var(--border)',
        opacity: isLocked ? 0.7 : 1,
        transition: 'box-shadow 0.18s, transform 0.18s',
        ...(!isLocked && {
          '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
        }),
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={isLocked}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', cursor: isLocked ? 'default' : 'pointer' }}
      >
        {/* Media area */}
        <Box
          sx={{
            height: 120,
            background: 'linear-gradient(135deg, var(--teal-50) 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: 'absolute', top: 12, left: 12,
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)',
              ...badgeSx,
            }}
          >
            {level.id}
          </Box>

          <LevelIcon levelId={level.id} isLocked={isLocked} />
        </Box>

        <CardContent sx={{ flex: 1, pb: '12px !important' }}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                {level.id} · {level.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'var(--font-body)', mt: 0.25 }}>
                {level.subtitle}
              </Typography>
            </Box>
            <Chip label={chipLabel} sx={{ ...chipStyle, flexShrink: 0 }} />
          </Stack>

          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ mt: 1.5, height: 4, borderRadius: 2, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, var(--teal-100), #1D9E75)', borderRadius: 2 } }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
