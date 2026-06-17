import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IconArrowLeft } from '@tabler/icons-react'
import BondsYieldCalculator from '../components/games/BondsYieldCalculator'
import StocksPortfolioBuilder from '../components/games/StocksPortfolioBuilder'
import ETFsFeeCalculator from '../components/games/ETFsFeeCalculator'
import CryptoRollercoaster from '../components/games/CryptoRollercoaster'
import CurrencyTrader from '../components/games/CurrencyTrader'
import type { GameState } from '../types'

interface GamePageProps {
  gameId: string
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onBack: () => void
}

const GAME_META: Record<string, { title: string; levelName: string; levelColor: string }> = {
  'game-bonds-yield':       { title: 'Yield Calculator',      levelName: 'Bonds',  levelColor: '#1D9E75' },
  'game-stocks-portfolio':  { title: 'Portfolio Builder',     levelName: 'Stocks', levelColor: '#2E86AB' },
  'game-etfs-fees':             { title: 'Fee Impact Calculator', levelName: 'ETFs',   levelColor: '#3AAFA9' },
  'game-crypto-rollercoaster':  { title: 'Crypto Rollercoaster',  levelName: 'Crypto', levelColor: '#7B5FD4' },
  'game-forex-currency-trader': { title: 'Currency Trader',        levelName: 'Forex',  levelColor: '#C08B00' },
}

export default function GamePage({ gameId, gameState, showToast, onBack }: GamePageProps) {
  const meta = GAME_META[gameId]
  const isCompleted = gameState.isGameComplete(gameId)

  function handleComplete() {
    gameState.completeGame(gameId, 20)
    showToast('+20 XP · Game complete!')
  }

  const gameProps = { isCompleted, onComplete: handleComplete }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Stack direction="row" sx={{ alignItems: 'center', mb: 2, gap: 1 }}>
        <IconButton onClick={onBack} size="small" sx={{ flexShrink: 0 }}>
          <IconArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {meta?.levelName ?? ''} · Games
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
            {meta?.title ?? 'Game'}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {gameId === 'game-bonds-yield'      && <BondsYieldCalculator      {...gameProps} />}
      {gameId === 'game-stocks-portfolio' && <StocksPortfolioBuilder    {...gameProps} />}
      {gameId === 'game-etfs-fees'           && <ETFsFeeCalculator         {...gameProps} />}
      {gameId === 'game-crypto-rollercoaster' && <CryptoRollercoaster    {...gameProps} />}
      {gameId === 'game-forex-currency-trader' && <CurrencyTrader        {...gameProps} />}
    </Box>
  )
}