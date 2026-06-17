import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  IconBuildingBank, IconChartLine, IconCoins, IconCurrencyBitcoin, IconCurrencyEuro, IconBarrel, IconShield, IconNews,
  IconCircleCheck, IconLock,
} from '@tabler/icons-react'
import type { GameState } from '../types'

interface GamesPageProps {
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onOpenGame: (gameId: string) => void
}

type IconComp = React.ComponentType<{ size: number; strokeWidth: number; color: string }>

type GameEntry = {
  id: string
  levelId: number
  levelName: string
  levelColor: string
  title: string
  description: string
  Icon: IconComp
  xp: number
}

const GAMES: GameEntry[] = [
  {
    id: 'game-bonds-yield',
    levelId: 1,
    levelName: 'Bonds',
    levelColor: '#1D9E75',
    title: 'Bond Trader',
    description: 'Predict ECB rate decisions and trade bonds before prices move — 6 rounds',
    Icon: IconBuildingBank,
    xp: 20,
  },
  {
    id: 'game-stocks-portfolio',
    levelId: 2,
    levelName: 'Stocks',
    levelColor: '#2E86AB',
    title: 'Stock Market Tycoon',
    description: 'IPOs, earnings reports, and live trading — 3 phases of real market action',
    Icon: IconChartLine,
    xp: 20,
  },
  {
    id: 'game-etfs-fees',
    levelId: 6,
    levelName: 'ETFs',
    levelColor: '#3AAFA9',
    title: 'Fee Impact Calculator',
    description: 'Compare two funds over 20 years and see how fees destroy your returns',
    Icon: IconCoins,
    xp: 20,
  },
  {
    id: 'game-crypto-rollercoaster',
    levelId: 3,
    levelName: 'Crypto',
    levelColor: '#7B5FD4',
    title: 'Crypto Rollercoaster',
    description: 'Buy low, sell high — time the market or get wrecked by volatility',
    Icon: IconCurrencyBitcoin,
    xp: 20,
  },
  {
    id: 'game-forex-currency-trader',
    levelId: 4,
    levelName: 'Forex',
    levelColor: '#C08B00',
    title: 'Currency Trader',
    description: 'Run an airport currency booth — buy low, sell high across 5 rounds',
    Icon: IconCurrencyEuro,
    xp: 20,
  },
  {
    id: 'game-commodities-oil-baron',
    levelId: 5,
    levelName: 'Commodities',
    levelColor: '#E07B39',
    title: 'Oil Baron',
    description: 'Manage 10 oil wells across 6 months — balance supply, demand, and market shocks',
    Icon: IconBarrel,
    xp: 20,
  },
  {
    id: 'game-mutualfunds-fee-destroyer',
    levelId: 7,
    levelName: 'Mutual Funds',
    levelColor: '#D45F8A',
    title: 'Fee Destroyer',
    description: 'Block fee bullets before they destroy your portfolio in this arcade shooter',
    Icon: IconShield,
    xp: 20,
  },
  {
    id: 'game-ai-newsflash',
    levelId: 8,
    levelName: 'AI Topicality',
    levelColor: '#0F6E56',
    title: 'News Flash',
    description: 'Predict how real market headlines move assets — powered by live news and AI',
    Icon: IconNews,
    xp: 20,
  },
]

// Group games by level (they're already in level order)
const LEVEL_GROUPS = [
  { levelId: 1, levelName: 'Bonds',  levelColor: '#1D9E75', games: GAMES.filter(g => g.levelId === 1) },
  { levelId: 2, levelName: 'Stocks', levelColor: '#2E86AB', games: GAMES.filter(g => g.levelId === 2) },
  { levelId: 3, levelName: 'Crypto', levelColor: '#7B5FD4', games: GAMES.filter(g => g.levelId === 3) },
  { levelId: 4, levelName: 'Forex',  levelColor: '#C08B00', games: GAMES.filter(g => g.levelId === 4) },
  { levelId: 5, levelName: 'Commodities', levelColor: '#E07B39', games: GAMES.filter(g => g.levelId === 5) },
  { levelId: 6, levelName: 'ETFs',         levelColor: '#3AAFA9', games: GAMES.filter(g => g.levelId === 6) },
  { levelId: 7, levelName: 'Mutual Funds',  levelColor: '#D45F8A', games: GAMES.filter(g => g.levelId === 7) },
  { levelId: 8, levelName: 'AI Topicality', levelColor: '#0F6E56', games: GAMES.filter(g => g.levelId === 8) },
]

export default function GamesPage({ gameState, showToast, onOpenGame }: GamesPageProps) {
  function isLevelUnlocked(levelId: number): boolean {
    return gameState.completedLevels.includes(levelId) || levelId <= gameState.activeLesson
  }

  return (
    <Box>
      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, mb: 0.25 }}>
        Mini-Games
      </Typography>
      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', mb: 3 }}>
        Learn by doing — interactive games for each level
      </Typography>

      {LEVEL_GROUPS.map(({ levelId, levelName, levelColor, games }) => (
        <Box key={levelId} sx={{ mb: 3 }}>
          {/* Level header */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: levelColor, flexShrink: 0 }} />
            <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: levelColor }}>
              {levelName}
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Stack>

          {games.map(game => {
            const unlocked = isLevelUnlocked(game.levelId)
            const completed = gameState.isGameComplete(game.id)

            return (
              <Box
                key={game.id}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid var(--border, #E0E0E0)',
                  borderRadius: '14px',
                  p: 2,
                  mb: 1.5,
                  opacity: unlocked ? 1 : 0.5,
                  cursor: unlocked ? 'default' : 'pointer',
                }}
                onClick={() => !unlocked && showToast(`Complete Level ${game.levelId} to unlock this game`)}
              >
                <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                  {/* Icon */}
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '12px',
                    bgcolor: game.levelColor, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <game.Icon size={24} strokeWidth={1.5} color="white" />
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
                        {game.title}
                      </Typography>
                      <Chip
                        label={`${game.xp} XP`}
                        size="small"
                        sx={{ bgcolor: '#FFF8DC', color: '#C08B00', fontWeight: 700, fontSize: 11, height: 22, flexShrink: 0 }}
                      />
                    </Stack>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', mt: 0.25, lineHeight: 1.5 }}>
                      {game.description}
                    </Typography>
                    <Chip
                      label={game.levelName}
                      size="small"
                      sx={{ mt: 0.75, height: 20, fontSize: 10, bgcolor: `${game.levelColor}18`, color: game.levelColor, fontWeight: 600 }}
                    />
                  </Box>
                </Stack>

                {/* Footer */}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  {completed ? (
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                      <IconCircleCheck size={16} strokeWidth={1.5} color="#1D9E75" />
                      <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#1D9E75', fontWeight: 600 }}>
                        Completed
                      </Typography>
                    </Stack>
                  ) : (
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{ flex: 1, mr: 2, height: 4, borderRadius: 2, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: game.levelColor } }}
                    />
                  )}

                  {unlocked ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onOpenGame(game.id)}
                      sx={{
                        borderRadius: '8px', textTransform: 'none', fontWeight: 700,
                        fontFamily: 'var(--font-body)', fontSize: 12, flexShrink: 0,
                        borderColor: game.levelColor, color: game.levelColor,
                        '&:hover': { bgcolor: `${game.levelColor}10`, borderColor: game.levelColor },
                      }}
                    >
                      {completed ? 'Play again' : 'Play →'}
                    </Button>
                  ) : (
                    <Chip
                      icon={<IconLock size={12} strokeWidth={1.5} />}
                      label="Locked"
                      size="small"
                      sx={{ height: 24, fontSize: 11, bgcolor: '#f5f5f5', color: '#aaa', '& .MuiChip-icon': { color: '#aaa', ml: '6px' } }}
                    />
                  )}
                </Stack>
              </Box>
            )
          })}
        </Box>
      ))}
    </Box>
  )
}