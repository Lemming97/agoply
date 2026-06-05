import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import { Tab as MuiTab } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { NavTab } from '../types'

interface HeaderProps {
  tab: NavTab
  setTab: (tab: NavTab) => void
  xp: number
  streak: number
}

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'education',  label: 'LEARN',    icon: '🎓' },
  { id: 'simulation', label: 'SIMULATE', icon: '📊' },
  { id: 'realworld',  label: 'INVEST',   icon: '🌍' },
]

export default function Header({ tab, setTab, xp, streak }: HeaderProps) {
  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(135deg, #085041 0%, #0F6E56 40%, #1D9E75 100%)',
        boxShadow: '0 2px 16px rgba(8,80,65,0.25)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '12px', width: 42, height: 42, fontSize: 22 }}>
            🌊
          </Avatar>
          <Box>
            <Typography variant="subtitle1" color="#fff" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              AGOPLY
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
              Experience real-time investing through learning & play
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Chip label={`🔥 ${streak}`} sx={{ bgcolor: 'rgba(255,179,0,0.25)', border: '1px solid rgba(255,179,0,0.4)', color: '#FFD54F', fontWeight: 700 }} />
          <Chip label={`⚡ ${xp} XP`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
        </Stack>
      </Toolbar>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as NavTab)}
        variant="fullWidth"
        textColor="inherit"
        sx={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          minHeight: 0,
          '& .MuiTabs-indicator': { backgroundColor: '#FFD700', height: 2 },
          '& .MuiTab-root': { color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.8px', fontSize: 11, minHeight: 56 },
          '& .Mui-selected': { color: '#fff !important', bgcolor: 'rgba(255,255,255,0.12)' },
        }}
      >
        {TABS.map(t => (
          <MuiTab key={t.id} value={t.id} label={t.label} icon={<span style={{ fontSize: 18 }}>{t.icon}</span>} iconPosition="top" />
        ))}
      </Tabs>
    </AppBar>
  )
}
