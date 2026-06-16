import type { ReactElement } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import { Tab as MuiTab } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { IconSchool, IconChartLine, IconWorld, IconFlame, IconBolt } from '@tabler/icons-react'
import type { NavTab, User } from '../types'

interface HeaderProps {
  tab: NavTab
  setTab: (tab: NavTab) => void
  xp: number
  streak: number
  user: User
  onLogout: () => void
}

const TABS: { id: NavTab; label: string; icon: ReactElement }[] = [
  { id: 'education',  label: 'LEARN',    icon: <IconSchool    size={20} strokeWidth={1.5} /> },
  { id: 'simulation', label: 'SIMULATE', icon: <IconChartLine size={20} strokeWidth={1.5} /> },
  { id: 'realworld',  label: 'INVEST',   icon: <IconWorld     size={20} strokeWidth={1.5} /> },
]

export default function Header({ tab, setTab, xp, streak, user, onLogout }: HeaderProps) {
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
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}agoplylogo.svg`}
            alt="Agoply"
            sx={{ width: 40, height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
          <Box>
            <Typography variant="subtitle1" color="#fff" sx={{ fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              AGOPLY
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
              Experience real-time investing through learning & play
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <Chip
            label={
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                <IconFlame size={14} strokeWidth={1.5} />
                <span>{streak}</span>
              </Stack>
            }
            sx={{ bgcolor: 'rgba(255,179,0,0.25)', border: '1px solid rgba(255,179,0,0.4)', color: '#FFD54F', fontWeight: 700 }}
          />
          <Chip
            label={
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                <IconBolt size={14} strokeWidth={1.5} />
                <span>{xp} XP</span>
              </Stack>
            }
            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }}
          />
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 1 }} />
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 800 }}>
            {user.name[0].toUpperCase()}
          </Avatar>
          <Button
            onClick={onLogout}
            size="small"
            sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 600, textTransform: 'none', minWidth: 0, px: 0.75, py: 0.5, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Sign out
          </Button>
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
          <MuiTab key={t.id} value={t.id} label={t.label} icon={t.icon} iconPosition="top" />
        ))}
      </Tabs>
    </AppBar>
  )
}
