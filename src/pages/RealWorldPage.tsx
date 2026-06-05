import { useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import { PLATFORMS } from '../data/gameData'
import type { GameState, Platform } from '../types'

interface RealWorldPageProps {
  gameState: GameState
  showToast: (msg: string) => void
}

export default function RealWorldPage({ gameState }: RealWorldPageProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    window.open(`https://finance.yahoo.com/search?p=${encodeURIComponent(searchQuery)}`, '_blank')
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Bridge to Real Investing</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        You've built confidence in the simulator — here's how to start for real
      </Typography>

      {/* Risk Profile */}
      <InfoCard title="🎯 Your Risk Profile">
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

      {/* Partner Platforms */}
      <InfoCard title="🏦 Partner Platforms">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75 }}>
          Tap a platform to compare features and find the right fit for you.
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 1.75 }}>
          {PLATFORMS.map(p => (
            <Chip
              key={p.id}
              onClick={() => setSelectedPlatform(selectedPlatform?.id === p.id ? null : p)}
              variant={selectedPlatform?.id === p.id ? 'filled' : 'outlined'}
              label={
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: p.color, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                  <span>{p.name}</span>
                  {p.beginner && (
                    <Box component="span" sx={{ fontSize: 9, bgcolor: 'var(--teal-50)', color: '#0F6E56', borderRadius: 2, px: '5px', py: '1px', fontWeight: 700 }}>
                      BEGINNER
                    </Box>
                  )}
                </Stack>
              }
              sx={{
                height: 'auto',
                py: 0.75,
                borderRadius: '20px',
                borderColor: selectedPlatform?.id === p.id ? '#1D9E75' : 'var(--border)',
                bgcolor: selectedPlatform?.id === p.id ? 'var(--teal-50)' : 'var(--surface2)',
                color: selectedPlatform?.id === p.id ? '#0F6E56' : 'text.primary',
                '& .MuiChip-label': { px: 1.75 },
                '&:hover': { bgcolor: 'var(--teal-50)', borderColor: '#1D9E75' },
              }}
            />
          ))}
        </Stack>

        {selectedPlatform && (
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{selectedPlatform.name}</Typography>
              <Typography color="warning.dark" sx={{ fontSize: 12, fontWeight: 700 }}>★ {selectedPlatform.rating}</Typography>
            </Stack>
            {[
              { label: 'Min. deposit', val: selectedPlatform.min },
              { label: 'Setup time',   val: selectedPlatform.time },
              { label: 'Assets',       val: selectedPlatform.assets.join(', ') },
            ].map(r => (
              <Stack key={r.label} direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                <Typography color="text.secondary" sx={{ fontSize: 12.5 }}>{r.label}</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 500, maxWidth: 220, textAlign: 'right' }}>{r.val}</Typography>
              </Stack>
            ))}
            <Box sx={{ mt: 1.25, p: '8px 12px', bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 2 }}>
              <Typography color="primary.dark" sx={{ fontSize: 12, fontWeight: 600 }}>★ {selectedPlatform.perk}</Typography>
            </Box>
          </Paper>
        )}
      </InfoCard>

      {/* Step Guides */}
      <InfoCard title="📋 Step-by-Step Guides">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Beginner guides tailored to your risk profile and learning progress.
        </Typography>
        <List disablePadding>
          {[
            { emoji: '1️⃣', title: 'Open a brokerage account', desc: 'Compare Revolut, eToro, or Trade Republic. Choose based on min deposit and assets you want to trade.' },
            { emoji: '2️⃣', title: 'Start with an ETF', desc: 'A MSCI World or S&P 500 ETF gives instant diversification across 500–1600 companies for as little as €10/month.' },
            { emoji: '3️⃣', title: 'Set a monthly budget', desc: 'Even €20–50/month invested consistently from age 20 can grow to €50,000+ by age 40 thanks to compounding.' },
            { emoji: '4️⃣', title: 'Understand your taxes', desc: 'In France, capital gains and dividends are taxed at 30% (Prélèvement Forfaitaire Unique). A PEA account can reduce this.' },
          ].map(step => (
            <ListItem key={step.title} alignItems="flex-start" disablePadding sx={{ mb: 1.75 }}>
              <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                <span style={{ fontSize: 22 }}>{step.emoji}</span>
              </ListItemAvatar>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 0.3 }}>{step.title}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 12.5, lineHeight: 1.6 }}>{step.desc}</Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </InfoCard>

      {/* Investment Search */}
      <InfoCard title="🔍 Investment Search">
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
        sx={{ mt: 1, borderRadius: '10px', border: '1px solid #FFD700', bgcolor: '#FFF8E1', color: '#7A5500', '& .MuiAlert-icon': { color: '#C08B00' } }}
      >
        <strong>Educational purposes only.</strong> This is not financial advice. Always do your own research and consider speaking with a licensed financial advisor before investing real money.
      </Alert>
    </Box>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ mb: 1.75 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
        {children}
      </CardContent>
    </Card>
  )
}
