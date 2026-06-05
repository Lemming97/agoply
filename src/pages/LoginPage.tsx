import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setTimeout(() => {
      const ok = onLogin(email, password)
      if (!ok) setError('Incorrect email or password. Try the test account below.')
      setLoading(false)
    }, 400)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #E8F8F3 0%, #F8FFFE 50%, #FFF8E1 100%)',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        {/* Branding */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/agoplylogo.svg"
            alt="Agoply"
            sx={{ width: 96, height: 96, objectFit: 'contain', mx: 'auto', mb: 1, display: 'block' }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Experience real-time investing through learning & play
          </Typography>
        </Box>

        {/* Login card */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 32px rgba(8,80,65,0.10)', border: '1px solid #D0EDE5' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Sign in to continue your investing journey
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type={showPw ? 'text' : 'password'}
                fullWidth
                size="small"
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{ mb: 2.5 }}
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPw(s => !s)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                          sx={{ color: 'text.secondary', fontSize: 14 }}
                        >
                          {showPw ? 'Hide' : 'Show'}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ borderRadius: '10px', py: 1.375, fontWeight: 700, fontSize: 15, textTransform: 'none' }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <Divider sx={{ my: 2.5 }} />

            <Alert
              severity="info"
              icon={false}
              sx={{ borderRadius: 2, bgcolor: '#F0F7FF', border: '1px solid #C5DBFF', '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#1a4fa0' }}>
                TEST ACCOUNT
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 12.5 }}>
                Email: <strong>test@agoply.com</strong><br />
                Password: <strong>agoply123</strong>
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}
        >
          Your progress is saved automatically between sessions
        </Typography>
      </Box>
    </Box>
  )
}
