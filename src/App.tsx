import { useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { IconFlame } from '@tabler/icons-react'
import Header from './components/Header'
import EducationPage from './pages/EducationPage'
import SimulationPage from './pages/SimulationPage'
import RealWorldPage from './pages/RealWorldPage'
import LoginPage from './pages/LoginPage'
import EditProfilePage from './pages/EditProfilePage'
import GlossaryPage from './pages/GlossaryPage'
import FlashcardPage from './pages/FlashcardPage'
import DragDropPage from './pages/DragDropPage'
import GamePage from './pages/GamePage'
import LevelDetailPage from './pages/LevelDetailPage'
import SubLessonPage from './pages/SubLessonPage'
import QuizPage from './pages/QuizPage'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'
import { useGameState } from './hooks/useGameState'
import { useAuth } from './hooks/useAuth'
import { useUserProfile } from './hooks/useUserProfile'
import { STREAK_REWARDS } from './data/streakRewards'
import theme from './theme'
import type { NavTab, User, GlossaryEntry } from './types'

type AppView = 'main' | 'editProfile' | 'glossary' | 'flashcard' | 'dragdrop' | 'gamePage' | 'levelDetail' | 'subLesson' | 'quiz'

export default function App() {
  const { user, login, logout, register } = useAuth()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!user ? (
        <LoginPage onLogin={login} onRegister={register} />
      ) : (
        <AuthenticatedApp key={user.email} user={user} onLogout={logout} />
      )}
    </ThemeProvider>
  )
}

function AuthenticatedApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<NavTab>('education')
  const [view, setView] = useState<AppView>('main')
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null)
  const [selectedSubLessonId, setSelectedSubLessonId] = useState<string | null>(null)
  const [flashcardTerms, setFlashcardTerms] = useState<GlossaryEntry[]>([])
  const [flashcardScope, setFlashcardScope] = useState('')
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const { toast, showToast } = useToast()
  const gameState = useGameState(user.email)
  const { profile, updateProfile } = useUserProfile(user.name, user.email)

  const nextReward = STREAK_REWARDS.find(r => r.streak > gameState.streak) ?? null

  // Tracks whether lastLoginDate was already "today" before this mount's
  // checkDailyLogin() ran, so the notification only fires on a genuine
  // day-transition — not on every reopen within the same day.
  const initialLoginDateRef = useRef<string | null | undefined>(undefined)
  const notifiedRef = useRef(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    if (initialLoginDateRef.current === undefined) {
      initialLoginDateRef.current = gameState.lastLoginDate
    }

    if (gameState.lastLoginDate !== today) return // checkDailyLogin hasn't settled state yet
    if (notifiedRef.current) return

    const wasAlreadyToday = initialLoginDateRef.current === today
    notifiedRef.current = true
    if (wasAlreadyToday) return // already greeted earlier today

    const timer = setTimeout(() => {
      const newStreak = gameState.streak
      const reward = STREAK_REWARDS.find(
        r => r.streak === newStreak && gameState.lastStreakRewardClaimed >= newStreak
      )

      if (reward) {
        showToast(
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <IconFlame size={16} color="#FFD700" />
            <span>{reward.label} +€{reward.cashBonus} virtual cash bonus!</span>
          </Stack>
        )
      } else if (newStreak > 1) {
        showToast(
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <IconFlame size={16} color="#FFD700" />
            <span>Day {newStreak} streak! Keep it up</span>
          </Stack>
        )
      }
      // first login or streak reset to 1 — no toast
    }, 800)

    return () => clearTimeout(timer)
  }, [gameState.lastLoginDate, gameState.streak, gameState.lastStreakRewardClaimed, showToast])

  function openLevel(levelId: number) {
    setSelectedLevelId(levelId)
    setView('levelDetail')
  }

  function openSubLesson(subLessonId: string) {
    setSelectedSubLessonId(subLessonId)
    setView('subLesson')
  }

  function handleSubLessonComplete(nextId: string | null) {
    if (nextId) {
      openSubLesson(nextId)
    } else {
      setView('levelDetail')
    }
  }

  function handleOpenGame(gameId: string) {
    setSelectedGameId(gameId)
    setView('gamePage')
  }

  function handleOpenDragDrop(levelId: number) {
    setSelectedLevelId(levelId)
    setView('dragdrop')
  }

  function handleStartFlashcards(terms: GlossaryEntry[], scopeLabel: string) {
    setFlashcardTerms(terms)
    setFlashcardScope(scopeLabel)
    setView('flashcard')
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header
        tab={tab}
        setTab={setTab}
        xp={gameState.xp}
        streak={gameState.streak}
        nextReward={nextReward}
        profile={profile}
        onEditProfile={() => setView('editProfile')}
        onShowGlossary={() => setView('glossary')}
        onLogout={onLogout}
      />
      <Box component="main" sx={{ flex: 1, p: '20px 16px 40px' }}>
        {view === 'editProfile' ? (
          <EditProfilePage
            profile={profile}
            onSave={updateProfile}
            onBack={() => setView('main')}
            showToast={showToast}
          />
        ) : view === 'glossary' ? (
          <GlossaryPage
            savedGlossary={gameState.savedGlossary}
            onRemoveSavedTerm={gameState.removeSavedTerm}
            onBack={() => setView('main')}
            showToast={showToast}
            onGoToLearn={() => { setView('main'); setTab('education') }}
            onStartFlashcards={handleStartFlashcards}
          />
        ) : view === 'flashcard' ? (
          <FlashcardPage
            terms={flashcardTerms}
            scopeLabel={flashcardScope}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('glossary')}
          />
        ) : view === 'gamePage' && selectedGameId !== null ? (
          <GamePage
            gameId={selectedGameId}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('main')}
          />
        ) : view === 'dragdrop' && selectedLevelId !== null ? (
          <DragDropPage
            levelId={selectedLevelId}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('levelDetail')}
          />
        ) : view === 'levelDetail' && selectedLevelId !== null ? (
          <LevelDetailPage
            levelId={selectedLevelId}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('main')}
            onOpenSubLesson={openSubLesson}
            onStartQuiz={() => setView('quiz')}
            onOpenDragDrop={() => handleOpenDragDrop(selectedLevelId)}
          />
        ) : view === 'subLesson' && selectedLevelId !== null && selectedSubLessonId !== null ? (
          <SubLessonPage
            levelId={selectedLevelId}
            subLessonId={selectedSubLessonId}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('levelDetail')}
            onComplete={handleSubLessonComplete}
          />
        ) : view === 'quiz' && selectedLevelId !== null ? (
          <QuizPage
            levelId={selectedLevelId}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('levelDetail')}
          />
        ) : (
          <>
            {tab === 'education'  && <EducationPage  gameState={gameState} showToast={showToast} onOpenLesson={openLevel} onOpenGame={handleOpenGame} />}
            {tab === 'simulation' && <SimulationPage gameState={gameState} showToast={showToast} profile={profile} onEditProfile={() => setView('editProfile')} onGoToInvest={() => setTab('realworld')} />}
            {tab === 'realworld'  && <RealWorldPage  gameState={gameState} showToast={showToast} onGoToSimulator={() => setTab('simulation')} />}
          </>
        )}
      </Box>
      <Toast message={toast} />
    </Box>
  )
}
