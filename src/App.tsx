import { useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Header from './components/Header'
import EducationPage from './pages/EducationPage'
import SimulationPage from './pages/SimulationPage'
import RealWorldPage from './pages/RealWorldPage'
import LoginPage from './pages/LoginPage'
import EditProfilePage from './pages/EditProfilePage'
import GlossaryPage from './pages/GlossaryPage'
import LevelDetailPage from './pages/LevelDetailPage'
import SubLessonPage from './pages/SubLessonPage'
import QuizPage from './pages/QuizPage'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'
import { useGameState } from './hooks/useGameState'
import { useAuth } from './hooks/useAuth'
import { useUserProfile } from './hooks/useUserProfile'
import theme from './theme'
import type { NavTab, User } from './types'

type AppView = 'main' | 'editProfile' | 'glossary' | 'levelDetail' | 'subLesson' | 'quiz'

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
  const { toast, showToast } = useToast()
  const gameState = useGameState(user.email)
  const { profile, updateProfile } = useUserProfile(user.name, user.email)

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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Header
        tab={tab}
        setTab={setTab}
        xp={gameState.xp}
        streak={gameState.streak}
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
          />
        ) : view === 'levelDetail' && selectedLevelId !== null ? (
          <LevelDetailPage
            levelId={selectedLevelId}
            gameState={gameState}
            showToast={showToast}
            onBack={() => setView('main')}
            onOpenSubLesson={openSubLesson}
            onStartQuiz={() => setView('quiz')}
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
            {tab === 'education'  && <EducationPage  gameState={gameState} showToast={showToast} onOpenLesson={openLevel} />}
            {tab === 'simulation' && <SimulationPage gameState={gameState} showToast={showToast} profile={profile} />}
            {tab === 'realworld'  && <RealWorldPage  gameState={gameState} showToast={showToast} />}
          </>
        )}
      </Box>
      <Toast message={toast} />
    </Box>
  )
}
