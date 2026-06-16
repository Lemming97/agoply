import type { ReactNode } from 'react'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import {
  IconTarget, IconBuildingBank, IconSearch,
  IconExternalLink, IconAlertTriangle,
  IconChevronDown, IconChevronUp, IconZoomQuestion,
} from '@tabler/icons-react'
import { PLATFORMS } from '../data/gameData'
import type { GameState, Platform } from '../types'

interface RealWorldPageProps {
  gameState: GameState
  showToast: (msg: ReactNode) => void
}

export default function RealWorldPage({ gameState }: RealWorldPageProps) {
  const [openPlatformId, setOpenPlatformId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const levelsCompleted = gameState.completedLevels.length
  const riskScore = Math.min(100, levelsCompleted * 14)

  const riskLabel =
    riskScore < 30 ? 'Cautious' :
    riskScore < 55 ? 'Balanced Growth' :
    riskScore < 80 ? 'Growth' : 'Aggressive Growth'

  const riskColor =
    riskScore < 30 ? 'var(--blue-400)' :
    riskScore < 55 ? '#1D9E75' :
    riskScore < 80 ? '#FFB300' : '#E24B4A'

  const allocation =
    riskScore < 30 ? '70% Bonds · 20% ETFs · 10% Stocks' :
    riskScore < 55 ? '60% ETFs · 30% Stocks · 10% Bonds' :
    riskScore < 80 ? '50% Stocks · 35% ETFs · 15% Crypto' :
    '60% Stocks · 25% Crypto · 15% Commodities'

  function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    window.open(`https://finance.yahoo.com/search?p=${encodeURIComponent(searchQuery)}`, '_blank')
  }

  function togglePlatform(id: string) {
    setOpenPlatformId(prev => prev === id ? null : id)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Bridge to Real Investing</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        You've built confidence in the simulator — here's how to start for real
      </Typography>

      {/* Risk Profile */}
      <InfoCard title={<><IconTarget size={20} strokeWidth={1.5} /> Your Risk Profile</>}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Based on your simulation behavior and {levelsCompleted} completed level{levelsCompleted !== 1 ? 's' : ''}:
        </Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: riskColor, mb: 1.25 }}>{riskLabel}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, mb: 0.5 }}>
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>Low risk</Typography>
          <LinearProgress
            variant="determinate"
            value={riskScore}
            sx={{
              flex: 1, height: 8, borderRadius: 4,
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1D9E75, #FFB300, #E24B4A)', borderRadius: 4 },
            }}
          />
          <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>High risk</Typography>
        </Stack>
        <Typography sx={{ fontSize: 12.5, mt: 1.25 }}>
          Suggested allocation: <strong>{allocation}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
          Complete more levels to refine your profile
        </Typography>
      </InfoCard>

      {/* Platform Accordion */}
      <InfoCard title={<><IconBuildingBank size={20} strokeWidth={1.5} /> Get Started with a Platform</>}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75 }}>
          Tap a platform to see a step-by-step guide for getting started.
        </Typography>
        {PLATFORMS.map((p, i) => (
          <Box key={p.id}>
            {i > 0 && <Divider />}
            <PlatformRow
              platform={p}
              isOpen={openPlatformId === p.id}
              onToggle={() => togglePlatform(p.id)}
            />
          </Box>
        ))}
      </InfoCard>

      {/* Investment Search */}
      <InfoCard title={<><IconSearch size={20} strokeWidth={1.5} /> Investment Search</>}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Look up any stock, ETF, or crypto to find current market data on Yahoo Finance.
        </Typography>
        <form onSubmit={handleSearch}>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'stretch' }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Try: AAPL, Bitcoin, CAC 40 ETF, LVMH..."
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Search →
            </Button>
          </Stack>
        </form>
      </InfoCard>

      <Alert
        severity="warning"
        icon={<IconAlertTriangle size={20} strokeWidth={1.5} />}
        sx={{ mt: 1, borderRadius: '10px', border: '1px solid #FFD700', bgcolor: '#FFF8E1', color: '#7A5500', '& .MuiAlert-icon': { color: '#C08B00' } }}
      >
        <strong>Educational purposes only.</strong> This is not financial advice. Always do your own research and consider speaking with a licensed financial advisor before investing real money.
      </Alert>
    </Box>
  )
}

function PlatformRow({ platform: p, isOpen, onToggle }: { platform: Platform; isOpen: boolean; onToggle: () => void }) {
  return (
    <Box>
      {/* Accordion header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          py: 1.5, cursor: 'pointer',
          '&:hover': { bgcolor: 'var(--surface2)', mx: -2, px: 2, borderRadius: 1 },
        }}
      >
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: p.color, border: '1px solid rgba(0,0,0,0.12)', flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 600, fontSize: 14, flex: 1, fontFamily: 'var(--font-body)' }}>
          {p.name}
        </Typography>
        {p.beginner && (
          <Box component="span" sx={{ fontSize: 9, bgcolor: 'var(--teal-50)', color: '#0F6E56', borderRadius: 2, px: '5px', py: '2px', fontWeight: 700, letterSpacing: '0.4px', flexShrink: 0 }}>
            BEGINNER FRIENDLY
          </Box>
        )}
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'warning.dark', flexShrink: 0 }}>
          ★ {p.rating}
        </Typography>
        <Box sx={{ color: 'text.secondary', flexShrink: 0, display: 'flex' }}>
          {isOpen
            ? <IconChevronUp  size={16} strokeWidth={2} />
            : <IconChevronDown size={16} strokeWidth={2} />
          }
        </Box>
      </Box>

      {/* Accordion body */}
      <Collapse in={isOpen} timeout={250}>
        <Box sx={{ pb: 2, pt: 0.5 }}>
          <List disablePadding>
            {p.steps.map((desc, i) => (
              <ListItem key={i} alignItems="flex-start" disablePadding sx={{ mb: 1.75 }}>
                <ListItemAvatar sx={{ minWidth: 40, mt: 0.25 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0F6E56', fontFamily: 'var(--font-display)' }}>{i + 1}</Typography>
                  </Box>
                </ListItemAvatar>
                <Typography color="text.secondary" sx={{ fontSize: 12.5, lineHeight: 1.6, pt: 0.25, fontFamily: 'var(--font-body)' }}>{desc}</Typography>
              </ListItem>
            ))}
          </List>

          {p.article && (
            <Box
              component="a"
              href={p.article.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'block',
                mt: 0.5,
                p: '12px 14px',
                borderRadius: 2,
                bgcolor: '#F0F7FF',
                border: '1px solid #C5DBFF',
                textDecoration: 'none',
                '&:hover': { bgcolor: '#E3F0FF' },
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', gap: '6px', mb: 0.5 }}>
                <IconZoomQuestion size={16} strokeWidth={1.5} color="var(--muted)" />
                <Typography sx={{ fontSize: 11, color: '#5a7fa8', fontFamily: 'var(--font-body)' }}>Want more detail?</Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1a4fa0', fontFamily: 'var(--font-body)' }}>
                  {p.article.title} →
                </Typography>
                <IconExternalLink size={14} strokeWidth={1.5} color="#1a4fa0" style={{ flexShrink: 0 }} />
              </Stack>
              <Typography sx={{ fontSize: 11, color: '#5a7fa8', fontFamily: 'var(--font-body)' }}>
                via {p.article.source}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

function InfoCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <Card sx={{ mb: 1.75 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}
