import type { ReactNode } from 'react'
import { useState } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import {
  IconBuildingBank, IconTrendingUp, IconCurrencyBitcoin, IconCurrencyEuro,
  IconBarrel, IconChartPie, IconBuildingStore, IconSparkles,
  IconLock, IconCircleCheck, IconTrophy,
} from '@tabler/icons-react'
import { LEVELS } from '../data/gameData'
import LessonPanel from '../components/LessonPanel'
import type { GameState, Level, LevelStatus } from '../types'

interface EducationPageProps {
  gameState: GameState
  showToast: (msg: ReactNode) => void
}

function LevelIcon({ id, size = 20 }: { id: number; size?: number }) {
  const props = { size, strokeWidth: 1.5 } as const
  switch (id) {
    case 1: return <IconBuildingBank    {...props} />
    case 2: return <IconTrendingUp      {...props} />
    case 3: return <IconCurrencyBitcoin {...props} />
    case 4: return <IconCurrencyEuro    {...props} />
    case 5: return <IconBarrel          {...props} />
    case 6: return <IconChartPie        {...props} />
    case 7: return <IconBuildingStore   {...props} />
    case 8: return <IconSparkles        {...props} />
    default: return null
  }
}

export default function EducationPage({ gameState, showToast }: EducationPageProps) {
  const [openLesson, setOpenLesson] = useState<number | null>(null)

  function getLevelStatus(level: Level): LevelStatus {
    if (gameState.completedLevels.includes(level.id)) return 'completed'
    if (gameState.activeLesson === level.id) return 'active'
    if (level.id < gameState.activeLesson) return 'active'
    return 'locked'
  }

  function handleLevelClick(level: Level) {
    const status = getLevelStatus(level)
    if (status === 'locked') { showToast('Complete the previous level first!'); return }
    if (!level.lesson)       { showToast('This level is coming soon!'); return }
    setOpenLesson(openLesson === level.id ? null : level.id)
  }

  function handleComplete(levelId: number) {
    gameState.completeLevel(levelId)
    setOpenLesson(null)
    showToast(
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        <IconTrophy size={16} strokeWidth={1.5} />
        <span>Level complete! +50 XP · €100 virtual cash added!</span>
      </Stack>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Your Learning Path</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete lessons to unlock investment instruments in the Simulator
      </Typography>

      {LEVELS.map(level => {
        const status = getLevelStatus(level)
        const isOpen = openLesson === level.id
        return (
          <Box key={level.id}>
            <LevelCard level={level} status={status} isOpen={isOpen} onClick={() => handleLevelClick(level)} />
            {isOpen && level.lesson && (
              <LessonPanel
                lesson={level.lesson}
                levelId={level.id}
                completed={status === 'completed'}
                onComplete={() => handleComplete(level.id)}
                showToast={showToast}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

interface LevelCardProps {
  level: Level
  status: LevelStatus
  isOpen: boolean
  onClick: () => void
}

function LevelCard({ level, status, isOpen, onClick }: LevelCardProps) {
  const pct = status === 'completed' ? 100 : status === 'active' ? 45 : 0

  const avatarStyles: Record<LevelStatus, object> = {
    completed: { bgcolor: '#1D9E75', color: '#fff' },
    active:    { bgcolor: 'var(--gold-50)', color: 'var(--gold-400)', border: '2px solid var(--gold-500)' },
    locked:    { bgcolor: '#f0f0f0', color: '#aaa' },
  }

  const chipContent: Record<LevelStatus, ReactNode> = {
    completed: (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconCircleCheck size={13} strokeWidth={1.5} />
        <span>Done</span>
      </Stack>
    ),
    active: 'In Progress',
    locked: (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconLock size={13} strokeWidth={1.5} />
        <span>Locked</span>
      </Stack>
    ),
  }

  const chipSx: Record<LevelStatus, object> = {
    completed: { bgcolor: 'var(--teal-50)',  color: 'var(--teal-600)', fontWeight: 700 },
    active:    { bgcolor: 'var(--gold-50)',  color: 'var(--gold-400)', fontWeight: 700 },
    locked:    { bgcolor: '#f5f5f5',         color: '#aaa',            fontWeight: 700 },
  }

  let chipLabel: ReactNode = chipContent[status]
  let chipStyle = chipSx[status]
  if (level.isAI && status === 'locked') {
    chipLabel = (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        <IconSparkles size={13} strokeWidth={1.5} />
        <span>AI Level</span>
      </Stack>
    )
    chipStyle = { ...chipStyle, bgcolor: 'var(--purple-50)', color: 'var(--purple-600)', fontWeight: 700 }
  }

  const avatarContent =
    status === 'completed'
      ? <IconCircleCheck size={22} strokeWidth={1.5} />
      : <LevelIcon id={level.id} size={22} />

  return (
    <Card
      sx={{
        mb: 1.25,
        bgcolor: status === 'completed' ? 'var(--teal-50)' : status === 'active' ? '#fffdf5' : 'background.paper',
        border: isOpen ? '2px solid #1D9E75' : status === 'active' ? '1.5px solid var(--gold-500)' : '1px solid var(--border)',
        opacity: status === 'locked' ? 0.55 : 1,
        transition: 'all 0.18s',
      }}
    >
      <CardActionArea
        onClick={onClick}
        disabled={status === 'locked'}
        sx={{ p: '14px 16px', display: 'flex', alignItems: 'center', gap: 1.75, cursor: status === 'locked' ? 'default' : 'pointer' }}
      >
        <Avatar sx={{ width: 42, height: 42, borderRadius: '10px', flexShrink: 0, ...avatarStyles[status] }}>
          {avatarContent}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mb: 0.25 }}>
            <LevelIcon id={level.id} size={16} />
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>
              {level.name} — {level.subtitle}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            {level.desc}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ height: 4, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, var(--teal-100), #1D9E75)', borderRadius: 2 } }}
          />
        </Box>

        <Chip label={chipLabel} sx={chipStyle} />
      </CardActionArea>
    </Card>
  )
}
