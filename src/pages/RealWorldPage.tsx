import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react'
import { useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
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
  IconInfoCircle, IconArrowDown, IconArrowUp, IconEqual,
  IconWallet, IconChartPie, IconTrendingDown, IconTrendingUp,
  IconHourglass, IconCurrencyBitcoin, IconBarrel, IconRefresh, IconTrophy,
  IconSnowflake, IconShieldCheck, IconScale, IconRocket,
  IconX, IconHandFinger,
} from '@tabler/icons-react'
import { PLATFORMS } from '../data/gameData'
import { calculateRiskProfile } from '../utils/riskProfile'
import type { RiskBehavior, RiskLabel, RiskProfileResult } from '../utils/riskProfile'
import type { GameState, Platform } from '../types'

interface RealWorldPageProps {
  gameState: GameState
  showToast: (msg: ReactNode) => void
  onGoToSimulator: () => void
}

const CONFIDENCE_BADGE: Record<'low' | 'medium' | 'high', { label: string; bg: string; color: string }> = {
  low:    { label: 'Based on limited activity', bg: '#F0F0F0', color: '#666' },
  medium: { label: 'Based on your trades', bg: '#FFF4D6', color: '#8A6D00' },
  high:   { label: 'Detailed analysis', bg: 'var(--teal-50)', color: '#0F6E56' },
}

const IMPACT_STYLES: Record<RiskBehavior['impact'], { bg: string; color: string; icon: typeof IconArrowUp }> = {
  cautious:   { bg: '#E3F2FD', color: '#1565C0', icon: IconArrowDown },
  aggressive: { bg: '#FEECEC', color: '#C0392B', icon: IconArrowUp },
  balanced:   { bg: 'var(--teal-50)', color: '#0F6E56', icon: IconEqual },
}

const BEHAVIOR_ICONS: Record<string, typeof IconWallet> = {
  IconWallet, IconBuildingBank, IconChartPie, IconTrendingDown, IconAlertTriangle,
  IconHourglass, IconCurrencyBitcoin, IconBarrel, IconTarget, IconRefresh,
  IconTrendingUp, IconTrophy, IconEqual,
}

const RISK_LABEL_ICON: Record<RiskLabel, typeof IconRocket> = {
  'Very Cautious':    IconSnowflake,
  'Cautious':         IconShieldCheck,
  'Balanced Growth':  IconScale,
  'Growth':           IconTrendingUp,
  'Aggressive Growth': IconRocket,
}

const RISK_LABEL_SUMMARY: Record<RiskLabel, string> = {
  'Very Cautious':    'You prefer safety over returns',
  'Cautious':         'You prioritize protecting your capital',
  'Balanced Growth':  'You balance risk and reward well',
  'Growth':           "You're comfortable taking calculated risks",
  'Aggressive Growth': 'You chase high returns — high risk!',
}

const PROFILE_DEFINITIONS: Record<RiskLabel, string> = {
  'Very Cautious':
    'You strongly prefer protecting your money over growing it. You tend to avoid volatile assets and keep a large cash buffer. In real life, you might suit savings accounts, government bonds, or capital-protected funds.',
  'Cautious':
    'You prioritize capital preservation but are open to modest growth. You favor stable, lower-risk assets like bonds and blue-chip stocks. In real life, a conservative portfolio with mostly bonds and some ETFs would suit you.',
  'Balanced Growth':
    'You balance risk and reward — you want your money to grow but not at any cost. You diversify across asset types and avoid extreme positions. In real life, a mix of ETFs, stocks, and some bonds is your sweet spot.',
  'Growth':
    'You are comfortable taking calculated risks for higher returns. You lean toward equities and growth assets, and you are not rattled by short-term volatility. In real life, a stock-heavy portfolio with some ETFs suits your style.',
  'Aggressive Growth':
    'You chase high returns and accept high risk. You trade actively, concentrate positions, and are drawn to volatile assets like crypto. In real life, you suit a high-equity portfolio — but make sure you can afford to lose what you invest.',
}

const RISK_LABEL_PANEL_BG: Record<RiskLabel, string> = {
  'Very Cautious':    '#E3F2FD',
  'Cautious':         '#E9F7F0',
  'Balanced Growth':  'var(--teal-50)',
  'Growth':           '#FFF8E1',
  'Aggressive Growth': '#FEECEC',
}

const ASSET_BAR_COLORS: Record<string, string> = {
  Stocks: '#2E86AB',
  ETFs: '#3AAFA9',
  Bonds: '#1D9E75',
  Crypto: '#7B5FD4',
  Commodities: '#E07B39',
}

function parseAllocation(allocation: string): { label: string; pct: number }[] {
  return allocation.split('·').map(part => {
    const match = part.trim().match(/^(\d+)%\s+(.+)$/)
    return match ? { pct: Number(match[1]), label: match[2] } : { pct: 0, label: part.trim() }
  })
}

export default function RealWorldPage({ gameState, onGoToSimulator }: RealWorldPageProps) {
  const [openPlatformId, setOpenPlatformId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const riskProfile = calculateRiskProfile(gameState.simulationStats, gameState.completedLevels)
  const isLowConfidence = riskProfile.confidence === 'low'
  const badge = CONFIDENCE_BADGE[riskProfile.confidence]
  const allocationBars = parseAllocation(riskProfile.allocation)

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
      {isLowConfidence && (
        <Alert
          severity="info"
          icon={<IconInfoCircle size={20} strokeWidth={1.5} />}
          sx={{ mb: 1.75, borderRadius: '10px', border: '1px solid var(--teal-100)', bgcolor: 'var(--teal-50)', color: '#0F6E56', '& .MuiAlert-icon': { color: '#0F6E56' } }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-display)', mb: 0.25 }}>
            Build your profile
          </Typography>
          <Typography sx={{ fontSize: 12.5, fontFamily: 'var(--font-body)', mb: 1 }}>
            Make at least 3 trades in the Simulator to get a detailed risk analysis.
          </Typography>
          <Button
            onClick={onGoToSimulator}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 700, color: '#0F6E56', p: 0, minWidth: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
          >
            Go to Simulator →
          </Button>
        </Alert>
      )}

      <InfoCard
        title={
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
              <IconTarget size={20} strokeWidth={1.5} /> Your Risk Profile
            </Stack>
            <Box
              component="span"
              sx={{ fontSize: 10.5, fontWeight: 700, bgcolor: badge.bg, color: badge.color, borderRadius: '20px', px: '10px', py: '4px', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
            >
              {badge.label}
            </Box>
          </Stack>
        }
      >
        <RiskProfileHero riskProfile={riskProfile} isLowConfidence={isLowConfidence} />

        {riskProfile.behaviors.length > 0 && (
          <>
            <Divider sx={{ my: 1.75 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.6px', display: 'block', mb: 1 }}>
              WHAT SHAPED YOUR PROFILE
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {riskProfile.behaviors.map((behavior, i) => (
                <BehaviorChip key={i} behavior={behavior} />
              ))}
            </Stack>
          </>
        )}

        <Divider sx={{ my: 1.75 }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.6px', display: 'block', mb: 1.25 }}>
          SUGGESTED ALLOCATION
        </Typography>
        {allocationBars.map(bar => (
          <Box key={bar.label} sx={{ mb: 1 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-body)' }}>{bar.label}</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-body)' }}>{bar.pct}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={bar.pct}
              sx={{
                height: 8, borderRadius: 4, bgcolor: 'var(--surface2)',
                '& .MuiLinearProgress-bar': { bgcolor: ASSET_BAR_COLORS[bar.label] ?? '#1D9E75', borderRadius: 4 },
              }}
            />
          </Box>
        ))}
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

function RiskProfileHero({ riskProfile, isLowConfidence }: { riskProfile: RiskProfileResult; isLowConfidence: boolean }) {
  const isMobile = useMediaQuery('(pointer: coarse)')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const canExplain = !isLowConfidence

  function handlePanelClick(e: ReactMouseEvent<HTMLElement>) {
    if (!canExplain || !isMobile) return
    // Popover content is rendered via a portal but still bubbles through the
    // React tree to this handler — ignore re-entrant clicks while already open
    // (e.g. the close button or backdrop) so they don't immediately reopen it.
    if (anchorEl) return
    setAnchorEl(e.currentTarget)
  }

  const labelBlock = (
    <>
      <Typography
        sx={{
          position: 'relative', fontWeight: 800, mb: 0.5, fontFamily: 'var(--font-display)',
          color: isLowConfidence ? 'text.disabled' : riskProfile.color,
          fontSize: isLowConfidence ? 18 : 28,
          lineHeight: 1.15,
        }}
      >
        {isLowConfidence ? 'Start trading to reveal your risk profile' : riskProfile.label}
      </Typography>
      {!isLowConfidence && (
        <Typography sx={{ position: 'relative', fontSize: 13, color: 'text.secondary', mb: 1.75, fontFamily: 'var(--font-body)' }}>
          {RISK_LABEL_SUMMARY[riskProfile.label]}
        </Typography>
      )}
    </>
  )

  return (
    <Box
      onClick={handlePanelClick}
      sx={{
        position: 'relative', overflow: 'hidden', borderRadius: 2,
        p: '18px 16px 8px', mb: 1.5,
        bgcolor: isLowConfidence ? 'var(--surface2)' : RISK_LABEL_PANEL_BG[riskProfile.label],
        border: '1px solid', borderColor: isLowConfidence ? 'var(--border)' : riskProfile.color,
        cursor: canExplain && isMobile ? 'pointer' : 'default',
      }}
    >
      {!isLowConfidence && (() => {
        const HeroIcon = RISK_LABEL_ICON[riskProfile.label]
        return (
          <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.07, color: riskProfile.color, pointerEvents: 'none' }}>
            <HeroIcon size={56} strokeWidth={1.2} />
          </Box>
        )
      })()}

      {canExplain ? (
        <Tooltip
          title={
            <Box sx={{ p: 1, maxWidth: 260 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, fontFamily: 'var(--font-display)' }}>
                {riskProfile.label}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                {PROFILE_DEFINITIONS[riskProfile.label]}
              </Typography>
            </Box>
          }
          arrow
          placement="bottom-start"
          enterDelay={200}
          disableHoverListener={isMobile}
          disableTouchListener={isMobile}
          disableFocusListener={isMobile}
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: '#1a2e27',
                color: '#fff',
                borderRadius: '10px',
                p: 1.5,
                maxWidth: 280,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                '& .MuiTooltip-arrow': { color: '#1a2e27' },
              },
            },
          }}
        >
          <Box sx={{ cursor: isMobile ? 'pointer' : 'help', display: 'inline-block' }}>
            {labelBlock}
          </Box>
        </Tooltip>
      ) : labelBlock}

      {canExplain && (
        <Stack direction="row" sx={{ alignItems: 'center', gap: '4px', mb: 1, display: { xs: 'none', md: 'flex' } }}>
          <IconInfoCircle size={12} strokeWidth={1.5} color="var(--muted)" />
          <Typography sx={{ fontSize: 10, color: 'text.secondary', fontFamily: 'var(--font-body)' }}>
            Hover for details
          </Typography>
        </Stack>
      )}
      {canExplain && (
        <Stack direction="row" sx={{ alignItems: 'center', gap: '4px', mb: 1, display: { xs: 'flex', md: 'none' } }}>
          <IconHandFinger size={14} strokeWidth={1.5} color="var(--muted)" />
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'var(--font-body)' }}>
            Tap to learn what this means
          </Typography>
        </Stack>
      )}

      <Stack direction="row" sx={{ position: 'relative', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, flexShrink: 0 }}>Low risk</Typography>
        <Box sx={{ position: 'relative', flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={riskProfile.score}
            sx={{
              height: 8, borderRadius: 4,
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1D9E75, #FFB300, #E24B4A)', borderRadius: 4 },
            }}
          />
          <Box
            sx={{
              position: 'absolute', top: '100%', left: `${riskProfile.score}%`,
              transform: 'translateX(-50%)', mt: '2px', textAlign: 'center', whiteSpace: 'nowrap',
            }}
          >
            <Typography sx={{ fontSize: 10, fontWeight: 700, lineHeight: 1, fontFamily: 'var(--font-body)' }}>▲</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>{riskProfile.score}</Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="error.main" sx={{ fontWeight: 600, flexShrink: 0 }}>High risk</Typography>
      </Stack>
      <Box sx={{ height: 20 }} />

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '14px', maxWidth: 300, bgcolor: '#fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', p: 2,
            },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, fontFamily: "'Syne', var(--font-display)" }}>
            {riskProfile.label}
          </Typography>
          <Box
            component="button"
            onClick={e => { e.stopPropagation(); setAnchorEl(null) }}
            sx={{ border: 'none', bgcolor: 'transparent', cursor: 'pointer', p: 0.25, display: 'flex', color: 'text.secondary', flexShrink: 0 }}
          >
            <IconX size={16} strokeWidth={1.5} />
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, lineHeight: 1.7, fontFamily: "'DM Sans', var(--font-body)", color: 'text.secondary' }}>
          {PROFILE_DEFINITIONS[riskProfile.label]}
        </Typography>
      </Popover>
    </Box>
  )
}

function BehaviorChip({ behavior }: { behavior: RiskBehavior }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const styles = IMPACT_STYLES[behavior.impact]
  const DirIcon = styles.icon
  const BehaviorIcon = BEHAVIOR_ICONS[behavior.icon] ?? IconEqual

  return (
    <>
      <Box
        component="button"
        onClick={e => setAnchorEl(anchorEl ? null : e.currentTarget)}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          border: 'none', cursor: 'pointer', appearance: 'none',
          bgcolor: styles.bg, color: styles.color,
          borderRadius: '20px', px: '10px', py: '6px',
          fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
        }}
      >
        <DirIcon size={13} strokeWidth={2} />
        {behavior.label}
      </Box>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: 2, p: 1.5, maxWidth: 240 } } }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mb: 0.5 }}>
          <BehaviorIcon size={16} strokeWidth={1.5} color={styles.color} />
          <Typography sx={{ fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)' }}>{behavior.label}</Typography>
        </Stack>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'var(--font-body)' }}>{behavior.description}</Typography>
      </Popover>
    </>
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
