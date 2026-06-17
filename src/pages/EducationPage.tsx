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
  IconLock, IconSparkles,
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
    if (!level.subLessons.length) { showToast('This level is coming soon!'); return }
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
          const completedSubCount = level.subLessons.filter(sl => gameState.completedSubLessons.includes(sl.id)).length
          return (
            <Grid key={level.id} size={{ xs: 12, md: 6 }}>
              <LevelCard
                level={level}
                status={status}
                completedSubCount={completedSubCount}
                onClick={() => handleLevelClick(level)}
              />
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

interface LevelCardProps {
  level: Level
  status: LevelStatus
  completedSubCount: number
  onClick: () => void
}

function LevelCard({ level, status, completedSubCount, onClick }: LevelCardProps) {
  const isLocked = status === 'locked'
  const totalSubs = level.subLessons.length
  const pct = status === 'completed' ? 100 : totalSubs > 0 ? Math.round((completedSubCount / totalSubs) * 100) : 0
  const cfg = LEVEL_CONFIG[level.id]
  const headerBg = isLocked ? '#DADDE3' : cfg?.color ?? '#1D9E75'
  const Icon: IconComponent = isLocked ? IconLock : (cfg?.Icon ?? IconSparkles)
  const iconColor = isLocked ? '#aaa' : headerBg

  const isAILocked = level.isAI && isLocked
  let chipLabel: string
  let chipSx: object
  if (isAILocked) {
    chipLabel = '✦ AI Level'
    chipSx = { bgcolor: 'var(--purple-50)', color: 'var(--purple-600)', fontWeight: 700, fontSize: 12 }
  } else if (status === 'completed') {
    chipLabel = '✓ Done'
    chipSx = { bgcolor: 'var(--teal-50)', color: 'var(--teal-600)', fontWeight: 700, fontSize: 12 }
  } else if (status === 'active') {
    chipLabel = 'In Progress'
    chipSx = { bgcolor: '#FFF8E1', color: 'var(--gold-400)', fontWeight: 700, fontSize: 12 }
  } else {
    chipLabel = '🔒 Locked'
    chipSx = { bgcolor: '#f5f5f5', color: '#aaa', fontWeight: 700, fontSize: 12 }
  }

  return (
    <Card
      elevation={isLocked ? 0 : 2}
      sx={{
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        opacity: isLocked ? 0.7 : 1,
        transition: 'box-shadow 0.18s, transform 0.18s',
        ...(!isLocked && {
          '&:hover': { boxShadow: 8, transform: 'translateY(-3px)' },
        }),
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={isLocked}
        disableRipple={isLocked}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', cursor: isLocked ? 'default' : 'pointer' }}
      >
        {/* Illustration area */}
        <Box
          sx={{
            height: 180,
            bgcolor: headerBg,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {/* Giant watermark number */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: -18,
              right: 12,
              fontSize: 120,
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'rgba(255,255,255,0.15)',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {level.id}
          </Typography>

          {/* Icon badge */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Icon size={36} strokeWidth={1.5} color={iconColor} />
          </Box>
        </Box>

        {/* Info area */}
        <CardContent sx={{ flex: 1, pb: '14px !important', pt: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                {level.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-body)', mt: 0.25 }}>
                {level.subtitle}
              </Typography>
            </Box>
            <Chip label={chipLabel} sx={{ ...chipSx, flexShrink: 0, height: 24, fontSize: 11 }} />
          </Stack>

          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              mt: 0.5,
              height: 4,
              borderRadius: 2,
              bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, var(--teal-100), #1D9E75)', borderRadius: 2 },
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
