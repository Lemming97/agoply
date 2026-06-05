import { useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Header from './components/Header'
import EducationPage from './pages/EducationPage'
import SimulationPage from './pages/SimulationPage'
import RealWorldPage from './pages/RealWorldPage'
import LoginPage from './pages/LoginPage'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'
import { useGameState } from './hooks/useGameState'
import { useAuth } from './hooks/useAuth'
import theme from './theme'
import type { NavTab } from './types'

export default function App() {
  const { user, login, logout } = useAuth()
  const [tab, setTab] = useState<NavTab>('education')
  const { toast, showToast } = useToast()
  const gameState = useGameState()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!user ? (
        <LoginPage onLogin={login} />
      ) : (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <Header tab={tab} setTab={setTab} xp={gameState.xp} streak={gameState.streak} user={user} onLogout={logout} />
          <Box component="main" sx={{ flex: 1, p: '20px 16px 40px' }}>
            {tab === 'education'  && <EducationPage  gameState={gameState} showToast={showToast} />}
            {tab === 'simulation' && <SimulationPage gameState={gameState} showToast={showToast} />}
            {tab === 'realworld'  && <RealWorldPage  gameState={gameState} showToast={showToast} />}
          </Box>
          <Toast message={toast} />
        </Box>
      )}
    </ThemeProvider>
  )
}
