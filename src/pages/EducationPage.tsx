import { useState } from 'react'
import { LEVELS } from '../data/gameData'
import LessonPanel from '../components/LessonPanel'
import type { GameState, Level, LevelStatus } from '../types'

interface EducationPageProps {
  gameState: GameState
  showToast: (msg: string) => void
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
    if (status === 'locked') {
      showToast('🔒 Complete the previous level first!')
      return
    }
    if (!level.lesson) {
      showToast('📅 This level is coming soon!')
      return
    }
    setOpenLesson(openLesson === level.id ? null : level.id)
  }

  function handleComplete(levelId: number) {
    gameState.completeLevel(levelId)
    setOpenLesson(null)
    showToast(`🎉 Level complete! +50 XP · €100 virtual cash added!`)
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Your Learning Path</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
        Complete lessons to unlock investment instruments in the Simulator
      </p>

      {LEVELS.map(level => {
        const status = getLevelStatus(level)
        const isOpen = openLesson === level.id

        return (
          <div key={level.id}>
            <LevelCard
              level={level}
              status={status}
              isOpen={isOpen}
              onClick={() => handleLevelClick(level)}
            />
            {isOpen && level.lesson && (
              <LessonPanel
                lesson={level.lesson}
                levelId={level.id}
                completed={status === 'completed'}
                onComplete={() => handleComplete(level.id)}
                showToast={showToast}
              />
            )}
          </div>
        )
      })}
    </div>
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

  const numStyleMap: Record<LevelStatus, React.CSSProperties> = {
    completed: { background: 'var(--teal-400)', color: '#fff' },
    active:    { background: 'var(--gold-50)', color: 'var(--gold-400)', border: '2px solid var(--gold-500)' },
    locked:    { background: '#f0f0f0', color: '#aaa' },
  }
  const numStyle = numStyleMap[status]

  const cardStyle: React.CSSProperties = {
    background: status === 'completed' ? 'var(--teal-50)' : status === 'active' ? '#fffdf5' : 'var(--surface)',
    border: isOpen
      ? '2px solid var(--teal-400)'
      : status === 'active'
        ? '1.5px solid var(--gold-500)'
        : '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    marginBottom: 10,
    cursor: status === 'locked' ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    transition: 'all 0.18s',
    opacity: status === 'locked' ? 0.55 : 1,
  }

  const badge = {
    completed: { label: '✓ Done',      bg: 'var(--teal-50)', color: 'var(--teal-600)' },
    active:    { label: 'In Progress',  bg: 'var(--gold-50)', color: 'var(--gold-400)' },
    locked:    { label: '🔒 Locked',    bg: '#f5f5f5',        color: '#aaa'            },
  }[status]

  if (level.isAI && status === 'locked') {
    badge.bg = 'var(--purple-50)'
    badge.color = 'var(--purple-600)'
    badge.label = '✦ AI Level'
  }

  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={{ width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: status === 'completed' ? 18 : 15, flexShrink: 0, ...numStyle }}>
        {status === 'completed' ? '✓' : level.isAI ? level.icon : level.id}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
          {level.icon} {level.name} — {level.subtitle}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{level.desc}</div>
        <div style={{ height: 4, background: '#e8e8e8', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--teal-100), var(--teal-400))', borderRadius: 2, transition: 'width 0.6s' }} />
        </div>
      </div>
      <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 700, background: badge.bg, color: badge.color, flexShrink: 0, fontFamily: 'var(--font-display)' }}>
        {badge.label}
      </span>
    </div>
  )
}
