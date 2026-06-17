import type { ReactNode } from 'react'
import { useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tabs from '@mui/material/Tabs'
import { Tab as MuiTab } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  IconWallet, IconChartBar, IconTrophy, IconShoppingCart,
  IconArrowUpRight, IconArrowDownRight, IconLock, IconCircleCheck,
  IconBuildingBank, IconTrendingUp, IconCurrencyBitcoin,
  IconCurrencyEuro, IconBarrel, IconChartPie,
} from '@tabler/icons-react'
import { LEADERBOARD } from '../data/gameData'
import { useLiveMarketData } from '../hooks/useLiveMarketData'
import type { GameState, MarketAsset, Holding, LeaderboardEntry, AssetCategory, UserProfile } from '../types'

interface SimulationPageProps {
  gameState: GameState
  showToast: (msg: ReactNode) => void
  profile: UserProfile
}

const CHART_DATA = [
  { day: 'Day 1', value: 1000 }, { day: 'Day 2', value: 1023 }, { day: 'Day 3', value: 1008 },
  { day: 'Day 4', value: 1061 }, { day: 'Day 5', value: 1049 }, { day: 'Day 6', value: 1095 },
  { day: 'Day 7', value: 1143 },
]

type SimView = 'portfolio' | 'market' | 'leaderboard'
type AssetFilter = 'all' | 'stock' | 'bond' | 'crypto' | 'forex' | 'commodity' | 'etf'

function CategoryIcon({ category, size = 20 }: { category: AssetCategory; size?: number }) {
  const props = { size, strokeWidth: 1.5 } as const
  switch (category) {
    case 'bond':      return <IconBuildingBank    {...props} />
    case 'stock':     return <IconTrendingUp      {...props} />
    case 'crypto':    return <IconCurrencyBitcoin {...props} />
    case 'forex':     return <IconCurrencyEuro    {...props} />
    case 'commodity': return <IconBarrel          {...props} />
    case 'etf':       return <IconChartPie        {...props} />
  }
}

export default function SimulationPage({ gameState, showToast, profile }: SimulationPageProps) {
  const [view, setView] = useState<SimView>('portfolio')
  const [buyModal, setBuyModal] = useState<MarketAsset | null>(null)
  const [sellModal, setSellModal] = useState<typeof gameState.portfolio.holdings[0] | null>(null)
  const [qty, setQty] = useState(1)
  const { assets, loading, isLive } = useLiveMarketData()

  const totalValue = gameState.portfolioValue

  function handleBuy(asset: MarketAsset) {
    if (!gameState.completedLevels.includes(asset.requiredLevel)) {
      const lvlName = ['', 'Bonds', 'Stocks', 'Crypto', 'Forex', 'Commodities', 'ETFs', 'Mutual Funds'][asset.requiredLevel]
      showToast(`Complete Level ${asset.requiredLevel}: ${lvlName} to unlock this!`)
      return
    }
    setBuyModal(asset)
    setQty(1)
  }

  function confirmBuy() {
    if (!buyModal) return
    const cost = buyModal.price * qty
    if (cost > gameState.portfolio.cash) { showToast('Not enough virtual cash!'); return }
    gameState.buyAsset(buyModal, qty)
    showToast(
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        <IconCircleCheck size={15} strokeWidth={1.5} />
        <span>Bought {qty}× {buyModal.ticker} for €{cost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}!</span>
      </Stack>
    )
    setBuyModal(null)
  }

  function confirmSell() {
    if (!sellModal) return
    const proceeds = sellModal.price * qty
    gameState.sellAsset(sellModal.id, qty)
    showToast(
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        <IconCircleCheck size={15} strokeWidth={1.5} />
        <span>Sold {qty}× {sellModal.ticker} for €{proceeds.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}!</span>
      </Stack>
    )
    setSellModal(null)
  }

  const marketsLabel = (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <span>Markets</span>
      <Box
        component="span"
        sx={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.3px',
          color: isLive ? '#1D9E75' : 'text.disabled',
          fontFamily: 'var(--font-body)',
        }}
      >
        {isLive ? '● LIVE' : '○ DELAYED'}
      </Box>
    </Stack>
  )

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Portfolio Simulator</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Practice with virtual money — zero real risk</Typography>

      <Tabs
        value={view}
        onChange={(_, v) => setView(v as SimView)}
        variant="fullWidth"
        sx={{
          mb: 2.5,
          border: '1px solid var(--border)',
          borderRadius: 2,
          minHeight: 0,
          '& .MuiTab-root': { fontWeight: 700, fontSize: 11, letterSpacing: '0.5px', minHeight: 44 },
          '& .Mui-selected': { color: '#0F6E56' },
          '& .MuiTabs-indicator': { bgcolor: '#1D9E75' },
        }}
      >
        <MuiTab icon={<IconWallet  size={18} strokeWidth={1.5} />} iconPosition="start" label="Portfolio"    value="portfolio"   />
        <MuiTab icon={<IconChartBar size={18} strokeWidth={1.5} />} iconPosition="start" label={marketsLabel} value="market"      />
        <MuiTab icon={<IconTrophy  size={18} strokeWidth={1.5} />} iconPosition="start" label="Rankings"     value="leaderboard" />
      </Tabs>

      {view === 'portfolio'   && <PortfolioView gameState={gameState} totalValue={totalValue} onSell={(h: Holding) => { setSellModal(h); setQty(1) }} />}
      {view === 'market'      && <MarketView assets={assets} loading={loading} onBuy={handleBuy} completedLevels={gameState.completedLevels} cash={gameState.portfolio.cash} />}
      {view === 'leaderboard' && <LeaderboardView data={LEADERBOARD} myValue={Math.round(totalValue)} profile={profile} />}

      {/* Buy dialog */}
      <Dialog
        open={!!buyModal}
        onClose={() => setBuyModal(null)}
        slotProps={{ paper: { sx: { borderRadius: '20px', width: '100%', maxWidth: 360 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          Buy{buyModal && <CategoryIcon category={buyModal.category} size={20} />}{buyModal?.name}
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>Price per unit</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>€{buyModal?.price.toLocaleString()}</Typography>
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
            <IconButton onClick={() => setQty(q => Math.max(1, q - 1))} sx={{ border: '1.5px solid var(--border)', bgcolor: 'var(--surface2)', width: 36, height: 36, borderRadius: '50%' }}>−</IconButton>
            <Typography sx={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700 }}>{qty}</Typography>
            <IconButton onClick={() => setQty(q => q + 1)} sx={{ border: '1.5px solid var(--border)', bgcolor: 'var(--surface2)', width: 36, height: 36, borderRadius: '50%' }}>+</IconButton>
          </Stack>
          <Paper variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', p: '10px 14px', mb: 2, borderRadius: 2, bgcolor: 'var(--teal-50)', borderColor: 'var(--teal-100)' }}>
            <Typography sx={{ fontSize: 14 }}>Total cost</Typography>
            <Typography color="primary.dark" sx={{ fontSize: 14, fontWeight: 700 }}>
              €{buyModal ? (buyModal.price * qty).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0'}
            </Typography>
          </Paper>
          <Typography color="text.secondary" sx={{ fontSize: 12 }}>
            Available cash: €{gameState.portfolio.cash.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setBuyModal(null)} variant="outlined" fullWidth sx={{ py: 1.375, borderRadius: '10px', textTransform: 'none', borderColor: 'var(--border)', color: 'text.primary' }}>Cancel</Button>
          <Button onClick={confirmBuy} variant="contained" color="primary" fullWidth sx={{ py: 1.375, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>Confirm Buy</Button>
        </DialogActions>
      </Dialog>

      {/* Sell dialog */}
      <Dialog
        open={!!sellModal}
        onClose={() => setSellModal(null)}
        slotProps={{ paper: { sx: { borderRadius: '20px', width: '100%', maxWidth: 360 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          Sell{sellModal && <CategoryIcon category={sellModal.category} size={20} />}{sellModal?.name}
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>Price per unit</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>€{sellModal?.price.toLocaleString()}</Typography>
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 2 }}>
            <IconButton onClick={() => setQty(q => Math.max(1, q - 1))} sx={{ border: '1.5px solid var(--border)', bgcolor: 'var(--surface2)', width: 36, height: 36, borderRadius: '50%' }}>−</IconButton>
            <Typography sx={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 700 }}>{qty}</Typography>
            <IconButton onClick={() => setQty(q => Math.min(sellModal?.shares ?? 1, q + 1))} sx={{ border: '1.5px solid var(--border)', bgcolor: 'var(--surface2)', width: 36, height: 36, borderRadius: '50%' }}>+</IconButton>
          </Stack>
          <Paper variant="outlined" sx={{ display: 'flex', justifyContent: 'space-between', p: '10px 14px', mb: 2, borderRadius: 2, bgcolor: 'var(--teal-50)', borderColor: 'var(--teal-100)' }}>
            <Typography sx={{ fontSize: 14 }}>Total proceeds</Typography>
            <Typography color="primary.dark" sx={{ fontSize: 14, fontWeight: 700 }}>
              €{sellModal ? (sellModal.price * qty).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0'}
            </Typography>
          </Paper>
          <Typography color="text.secondary" sx={{ fontSize: 12 }}>
            You own {sellModal?.shares} share{sellModal && sellModal.shares !== 1 ? 's' : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setSellModal(null)} variant="outlined" fullWidth sx={{ py: 1.375, borderRadius: '10px', textTransform: 'none', borderColor: 'var(--border)', color: 'text.primary' }}>Cancel</Button>
          <Button onClick={confirmSell} variant="contained" fullWidth sx={{ py: 1.375, borderRadius: '10px', textTransform: 'none', fontWeight: 700, bgcolor: '#c0392b', '&:hover': { bgcolor: '#a93226' } }}>Confirm Sell</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function PortfolioView({ gameState, totalValue, onSell }: { gameState: GameState; totalValue: number; onSell: (h: Holding) => void }) {
  const gain = totalValue - 1000
  const gainPct = ((gain / 1000) * 100).toFixed(2)
  const isUp = gain >= 0

  return (
    <>
      <Card sx={{ background: 'linear-gradient(135deg, #085041, #1D9E75)', border: 'none', mb: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <CardContent sx={{ color: '#fff' }}>
          <Typography sx={{ fontSize: 12, opacity: 0.75, mb: 0.5 }}>Total Portfolio Value</Typography>
          <Typography sx={{ fontSize: 34, fontWeight: 800, mb: 0.5 }}>
            €{totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography sx={{ fontSize: 13, opacity: 0.85, mb: 2 }}>
            {isUp ? '+' : ''}€{gain.toFixed(2)} · {isUp ? '+' : ''}{gainPct}% since start
          </Typography>
          <Stack direction="row" sx={{ gap: 1 }}>
            {[
              { label: 'Stocks', val: `€${gameState.portfolio.holdings.filter(h => h.category === 'stock').reduce((s, h) => s + h.price * h.shares, 0).toFixed(0)}` },
              { label: 'Bonds',  val: `€${gameState.portfolio.holdings.filter(h => h.category === 'bond').reduce((s, h) => s + h.price * h.shares, 0).toFixed(0)}` },
              { label: 'Cash',   val: `€${gameState.portfolio.cash.toFixed(0)}` },
            ].map(s => (
              <Box key={s.label} sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, p: '8px 10px', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{s.val}</Typography>
                <Typography sx={{ fontSize: 10, opacity: 0.75, mt: 0.25 }}>{s.label}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.8px', display: 'block', mb: 1.5 }}>
            PORTFOLIO PERFORMANCE
          </Typography>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5a7a6e' }} axisLine={false} tickLine={false} />
              <YAxis domain={[950, 1200]} tick={{ fontSize: 11, fill: '#5a7a6e' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={v => [`€${v}`, 'Value']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#1D9E75" strokeWidth={2} fill="url(#tealGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.8px', display: 'block', mb: 1.25 }}>
        YOUR HOLDINGS
      </Typography>
      {gameState.portfolio.holdings.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: 14, textAlign: 'center', py: 4 }}>
          No holdings yet — head to Markets to buy your first asset!
        </Typography>
      ) : (
        gameState.portfolio.holdings.map(h => <HoldingRow key={h.id} holding={h} onSell={onSell} />)
      )}
    </>
  )
}

function HoldingRow({ holding, onSell }: { holding: Holding; onSell: (h: Holding) => void }) {
  const value = holding.price * holding.shares
  const isUp = holding.change >= 0
  return (
    <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '12px 14px', mb: 1, borderRadius: 2 }}>
      <Avatar sx={{ bgcolor: 'var(--teal-50)', borderRadius: '8px', width: 38, height: 38, color: 'var(--teal-600)' }}>
        <CategoryIcon category={holding.category} size={20} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{holding.name}</Typography>
        <Typography variant="caption" color="text.secondary">{holding.ticker} · {holding.shares} shares</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', mr: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>€{value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</Typography>
        <Typography component="div" sx={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }} color={isUp ? 'primary.main' : 'error.main'}>
          {isUp ? <IconArrowUpRight size={12} strokeWidth={1.5} /> : <IconArrowDownRight size={12} strokeWidth={1.5} />}
          {isUp ? '+' : ''}{holding.change}%
        </Typography>
      </Box>
      <Button onClick={() => onSell(holding)} variant="outlined" size="small" sx={{ bgcolor: '#fff5f5', color: '#c0392b', borderColor: '#f5c6c6', borderRadius: '6px', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#fde8e8', borderColor: '#c0392b' } }}>
        SELL
      </Button>
    </Paper>
  )
}

function MarketView({ assets, loading, onBuy, completedLevels, cash }: { assets: MarketAsset[]; loading: boolean; onBuy: (a: MarketAsset) => void; completedLevels: number[]; cash: number }) {
  const [filter, setFilter] = useState<AssetFilter>('all')
  const cats: AssetFilter[] = ['all', 'bond', 'stock', 'crypto', 'forex', 'commodity', 'etf']
  const filtered = (filter === 'all' ? assets : assets.filter(a => a.category === filter))
    .slice().sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '10px 14px', mb: 2, borderRadius: 2, bgcolor: 'var(--teal-50)', borderColor: 'var(--teal-100)' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Available cash</Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#0F6E56' }}>
          €{cash.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </Typography>
      </Paper>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v: AssetFilter | null) => v && setFilter(v)}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2, '& .MuiToggleButtonGroup-grouped': { border: '1.5px solid var(--border) !important', borderRadius: '20px !important', mx: 0 } }}
      >
        {cats.map(c => (
          <ToggleButton key={c} value={c} size="small" sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', px: 1.5, color: 'text.secondary', '&.Mui-selected': { bgcolor: 'var(--teal-50)', color: '#0F6E56', borderColor: '#1D9E75 !important' } }}>
            {c}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Paper key={i} variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '12px 14px', mb: 1, borderRadius: 2 }}>
            <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: '8px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="55%" height={14} sx={{ mb: 0.75 }} />
              <Skeleton width="30%" height={11} />
            </Box>
            <Box sx={{ textAlign: 'right', mr: 1.5 }}>
              <Skeleton width={60} height={14} sx={{ mb: 0.75 }} />
              <Skeleton width={40} height={11} />
            </Box>
            <Skeleton variant="rounded" width={46} height={30} sx={{ borderRadius: '6px' }} />
          </Paper>
        ))
      ) : (
        filtered.map(asset => {
          const unlocked = completedLevels.includes(asset.requiredLevel)
          const isUp = asset.change >= 0
          return (
            <Paper key={asset.id} variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '12px 14px', mb: 1, borderRadius: 2, opacity: unlocked ? 1 : 0.5 }}>
              <Avatar sx={{ bgcolor: unlocked ? 'var(--teal-50)' : '#f5f5f5', borderRadius: '8px', width: 38, height: 38, color: unlocked ? 'var(--teal-600)' : '#aaa' }}>
                <CategoryIcon category={asset.category} size={20} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{asset.name}</Typography>
                <Typography variant="caption" color="text.secondary">{asset.ticker}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', mr: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>€{asset.price.toLocaleString()}</Typography>
                <Typography component="div" sx={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }} color={isUp ? 'primary.main' : 'error.main'}>
                  {isUp ? <IconArrowUpRight size={12} strokeWidth={1.5} /> : <IconArrowDownRight size={12} strokeWidth={1.5} />}
                  {isUp ? '+' : ''}{asset.change}%
                </Typography>
              </Box>
              <Button
                onClick={() => onBuy(asset)}
                variant="outlined"
                size="small"
                startIcon={unlocked ? <IconShoppingCart size={13} strokeWidth={1.5} /> : undefined}
                sx={{ bgcolor: unlocked ? 'var(--teal-50)' : '#f5f5f5', color: unlocked ? '#0F6E56' : '#aaa', borderColor: unlocked ? 'var(--teal-100)' : '#ddd', borderRadius: '6px', fontWeight: 700, textTransform: 'none', minWidth: unlocked ? undefined : 36, '&:hover': { bgcolor: unlocked ? 'var(--teal-100)' : '#f5f5f5', borderColor: unlocked ? '#1D9E75' : '#ddd' } }}
              >
                {unlocked ? 'BUY' : <IconLock size={15} strokeWidth={1.5} />}
              </Button>
            </Paper>
          )
        })
      )}
    </>
  )
}

function LeaderboardView({ data, myValue, profile }: { data: LeaderboardEntry[]; myValue: number; profile: UserProfile }) {
  const updated = data
    .map(r => r.me ? { ...r, value: myValue } : r)
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  function myAvatarSrc() {
    const dicebearUrl = (seed: string) =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&clothesColor=1D9E75,0F6E56,5DCAA5,085041,C08B00&mouth=default,eating,grimace,smile,tongue,twinkle&eyes=closed,default,happy,hearts,side,squint,surprised,wink,winkWacky&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural,unibrowNatural,upDownNatural`
    if (profile.avatarType === 'upload') return profile.avatarValue ?? dicebearUrl(profile.firstName || 'default')
    if (profile.avatarType === 'icon') return dicebearUrl(profile.avatarValue ?? profile.firstName)
    return dicebearUrl(profile.firstName || 'default')
  }

  return (
    <>
      <Alert icon={<IconTrophy size={18} strokeWidth={1.5} />} severity="warning" sx={{ mb: 2, borderRadius: '10px', border: '1px solid #FFD700', bgcolor: '#FFF8E1', color: '#7A5500', '& .MuiAlert-icon': { color: '#C08B00' } }}>
        Weekly Challenge: <strong>Best Diversified Portfolio</strong> — ends Sunday
      </Alert>
      {updated.map(r => {
        const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']
        const rankBg = r.rank <= 3 ? rankColors[r.rank - 1] : '#f0f0f0'
        const rankColor = r.rank === 1 ? '#7A5500' : r.rank <= 3 ? '#444' : '#888'
        return (
          <Paper key={r.name} variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: '10px 14px', mb: 0.75, borderRadius: 2, bgcolor: r.me ? 'var(--teal-50)' : 'background.paper', borderColor: r.me ? 'var(--teal-100)' : 'divider' }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: rankBg, fontSize: 12, fontWeight: 800, color: rankColor }}>{r.rank}</Avatar>
            {r.me && (
              <Avatar src={myAvatarSrc()} sx={{ width: 32, height: 32, bgcolor: 'var(--teal-100)', fontSize: 13, fontWeight: 700, color: '#0F6E56' }}>
                {profile.avatarType === 'initials' ? (profile.firstName[0]?.toUpperCase() ?? '?') : undefined}
              </Avatar>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: r.me ? 700 : 500, fontSize: 13 }}>{r.name} {r.me && '(you)'}</Typography>
              <Typography variant="caption" color="text.secondary">{r.school}</Typography>
            </Box>
            <Typography color={r.me ? 'primary.dark' : 'text.primary'} sx={{ fontWeight: 700, fontSize: 14 }}>€{r.value.toLocaleString()}</Typography>
          </Paper>
        )
      })}
    </>
  )
}
