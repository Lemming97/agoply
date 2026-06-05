import { useState } from 'react'
import Header from './components/Header.jsx'
import EducationPage from './pages/EducationPage.jsx'
import SimulationPage from './pages/SimulationPage.jsx'
import RealWorldPage from './pages/RealWorldPage.jsx'
import Toast from './components/Toast.jsx'
import { useToast } from './hooks/useToast.js'
import { useGameState } from './hooks/useGameState.js'

export default function App() {
  const [tab, setTab] = useState('education')
  const { toast, showToast } = useToast()
  const gameState = useGameState()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header tab={tab} setTab={setTab} xp={gameState.xp} streak={gameState.streak} />
      <main style={{ flex: 1, padding: '20px 16px 40px' }}>
        {tab === 'education'  && <EducationPage  gameState={gameState} showToast={showToast} />}
        {tab === 'simulation' && <SimulationPage gameState={gameState} showToast={showToast} />}
        {tab === 'realworld'  && <RealWorldPage  gameState={gameState} showToast={showToast} />}
      </main>
      <Toast message={toast} />
    </div>
  )
}
