import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'

type Mode = 'login' | 'signup' | 'success'

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean
  onRegister: (firstName: string, lastName: string, email: string, password: string) => 'ok' | 'email_taken'
}

interface RegFields {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

type RegErrors = Record<keyof RegFields, string>

const INITIAL_REG: RegFields = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
const INITIAL_ERR: RegErrors = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }

function getPasswordStrength(pw: string): 'weak' | 'fair' | 'strong' {
  if (pw.length < 8) return 'weak'
  let classes = 0
  if (/[a-z]/.test(pw)) classes++
  if (/[A-Z]/.test(pw)) classes++
  if (/[0-9]/.test(pw)) classes++
  if (/[^a-zA-Z0-9]/.test(pw)) classes++
  return classes >= 3 ? 'strong' : classes >= 2 ? 'fair' : 'weak'
}

const STRENGTH_COLOR = { weak: '#e53935', fair: '#fb8c00', strong: '#1D9E75' }
const STRENGTH_VALUE = { weak: 33, fair: 66, strong: 100 }

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<Mode>('login')

  // Login state
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading]     = useState(false)

  // Registration state
  const [reg, setReg]             = useState<RegFields>(INITIAL_REG)
  const [regErrors, setRegErrors] = useState<RegErrors>(INITIAL_ERR)
  const [showRegPw, setShowRegPw]       = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [regLoading, setRegLoading]     = useState(false)

  function switchMode(next: Mode) {
    setEmail(''); setPassword(''); setShowPw(false); setLoginError('')
    setReg(INITIAL_REG); setRegErrors(INITIAL_ERR)
    setShowRegPw(false); setShowConfirmPw(false)
    setMode(next)
  }

  function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    setLoginError('')
    if (!email.trim() || !password) { setLoginError('Please enter your email and password.'); return }
    setLoading(true)
    setTimeout(() => {
      const ok = onLogin(email, password)
      if (!ok) setLoginError('Incorrect email or password. Try the test account below.')
      setLoading(false)
    }, 400)
  }

  function validateRegField(field: keyof RegFields, value: string): string {
    switch (field) {
      case 'firstName':       return value.trim() ? '' : 'First name is required'
      case 'lastName':        return value.trim() ? '' : 'Last name is required'
      case 'email':           return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address'
      case 'password':        return value.length >= 8 ? '' : 'Password must be at least 8 characters'
      case 'confirmPassword': return value === reg.password ? '' : 'Passwords do not match'
    }
  }

  function handleRegBlur(field: keyof RegFields) {
    setRegErrors(e => ({ ...e, [field]: validateRegField(field, reg[field]) }))
  }

  function handleRegSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    const newErrors = (Object.keys(INITIAL_ERR) as Array<keyof RegFields>).reduce((acc, field) => {
      acc[field] = validateRegField(field, reg[field])
      return acc
    }, { ...INITIAL_ERR })
    setRegErrors(newErrors)
    if (Object.values(newErrors).some(v => v)) return

    setRegLoading(true)
    setTimeout(() => {
      const result = onRegister(reg.firstName.trim(), reg.lastName.trim(), reg.email.trim(), reg.password)
      if (result === 'email_taken') {
        setRegErrors(e => ({ ...e, email: 'An account with this email already exists' }))
        setRegLoading(false)
        return
      }
      setRegLoading(false)
      setMode('success')
      setTimeout(() => onLogin(reg.email.trim(), reg.password), 2000)
    }, 400)
  }

  const pwStrength = getPasswordStrength(reg.password)

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

        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 32px rgba(8,80,65,0.10)', border: '1px solid #D0EDE5' }}>
          <CardContent sx={{ p: 3 }}>

            {/* SUCCESS */}
            {mode === 'success' && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography sx={{ fontSize: 52, mb: 1 }}>🎉</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Account created!</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 14, mb: 2.5 }}>
                  Let's start learning. Taking you to the app…
                </Typography>
                <LinearProgress
                  sx={{
                    borderRadius: 2,
                    height: 6,
                    bgcolor: '#D0EDE5',
                    '& .MuiLinearProgress-bar': { bgcolor: '#1D9E75' },
                  }}
                />
              </Box>
            )}

            {/* LOGIN */}
            {mode === 'login' && (
              <Fade in timeout={280}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome back</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Sign in to continue your investing journey
                  </Typography>

                  {loginError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{loginError}</Alert>
                  )}

                  <form onSubmit={handleLogin}>
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
                              <IconButton onClick={() => setShowPw(s => !s)} edge="end" size="small" tabIndex={-1} sx={{ color: 'text.secondary', fontSize: 14 }}>
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
                      sx={{ borderRadius: '10px', py: 1.375, fontWeight: 700, fontSize: 15, textTransform: 'none', mb: 2 }}
                    >
                      {loading ? 'Signing in…' : 'Sign in'}
                    </Button>
                  </form>

                  <Typography sx={{ textAlign: 'center', fontSize: 13, color: 'text.secondary' }}>
                    Don't have an account?{' '}
                    <Box
                      component="span"
                      onClick={() => switchMode('signup')}
                      sx={{ color: '#0F6E56', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Sign up
                    </Box>
                  </Typography>

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
                </Box>
              </Fade>
            )}

            {/* SIGNUP */}
            {mode === 'signup' && (
              <Fade in timeout={280}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Create your account</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Join Agoply and start your investing journey
                  </Typography>

                  <form onSubmit={handleRegSubmit} noValidate>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                      <TextField
                        label="First name"
                        fullWidth
                        size="small"
                        value={reg.firstName}
                        onChange={e => setReg(r => ({ ...r, firstName: e.target.value }))}
                        onBlur={() => handleRegBlur('firstName')}
                        error={!!regErrors.firstName}
                        helperText={regErrors.firstName}
                        autoComplete="given-name"
                        autoFocus
                        slotProps={{ htmlInput: { 'aria-describedby': regErrors.firstName ? 'firstName-error' : undefined }, formHelperText: { id: 'firstName-error' } }}
                      />
                      <TextField
                        label="Last name"
                        fullWidth
                        size="small"
                        value={reg.lastName}
                        onChange={e => setReg(r => ({ ...r, lastName: e.target.value }))}
                        onBlur={() => handleRegBlur('lastName')}
                        error={!!regErrors.lastName}
                        helperText={regErrors.lastName}
                        autoComplete="family-name"
                        slotProps={{ htmlInput: { 'aria-describedby': regErrors.lastName ? 'lastName-error' : undefined }, formHelperText: { id: 'lastName-error' } }}
                      />
                    </Stack>

                    <TextField
                      label="Email"
                      type="email"
                      fullWidth
                      size="small"
                      value={reg.email}
                      onChange={e => setReg(r => ({ ...r, email: e.target.value }))}
                      onBlur={() => handleRegBlur('email')}
                      error={!!regErrors.email}
                      helperText={regErrors.email}
                      sx={{ mb: 2 }}
                      autoComplete="email"
                      slotProps={{ htmlInput: { 'aria-describedby': regErrors.email ? 'email-error' : undefined }, formHelperText: { id: 'email-error' } }}
                    />

                    <TextField
                      label="Password"
                      type={showRegPw ? 'text' : 'password'}
                      fullWidth
                      size="small"
                      value={reg.password}
                      onChange={e => setReg(r => ({ ...r, password: e.target.value }))}
                      onBlur={() => handleRegBlur('password')}
                      error={!!regErrors.password}
                      helperText={regErrors.password}
                      sx={{ mb: reg.password ? 1 : 2 }}
                      autoComplete="new-password"
                      slotProps={{
                        htmlInput: { 'aria-describedby': regErrors.password ? 'password-error' : undefined },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowRegPw(s => !s)} edge="end" size="small" tabIndex={-1} sx={{ color: 'text.secondary', fontSize: 14 }}>
                                {showRegPw ? 'Hide' : 'Show'}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                        formHelperText: { id: 'password-error' },
                      }}
                    />

                    {reg.password && (
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={STRENGTH_VALUE[pwStrength]}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            bgcolor: '#eee',
                            mb: 1,
                            '& .MuiLinearProgress-bar': { bgcolor: STRENGTH_COLOR[pwStrength], transition: 'transform 0.3s, background-color 0.3s' },
                          }}
                        />
                        {[
                          { label: 'At least 8 characters', met: reg.password.length >= 8 },
                          { label: '1 uppercase letter',    met: /[A-Z]/.test(reg.password) },
                          { label: '1 number',              met: /[0-9]/.test(reg.password) },
                        ].map(({ label, met }) => (
                          <Typography key={label} sx={{ fontSize: 11, fontWeight: 500, color: met ? '#1D9E75' : '#999', display: 'flex', alignItems: 'center', gap: '4px', mb: '2px' }}>
                            {met ? '✓' : '·'} {label}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    <TextField
                      label="Confirm password"
                      type={showConfirmPw ? 'text' : 'password'}
                      fullWidth
                      size="small"
                      value={reg.confirmPassword}
                      onChange={e => setReg(r => ({ ...r, confirmPassword: e.target.value }))}
                      onBlur={() => handleRegBlur('confirmPassword')}
                      error={!!regErrors.confirmPassword}
                      helperText={regErrors.confirmPassword}
                      sx={{ mb: 2.5 }}
                      autoComplete="new-password"
                      slotProps={{
                        htmlInput: { 'aria-describedby': regErrors.confirmPassword ? 'confirmPassword-error' : undefined },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPw(s => !s)} edge="end" size="small" tabIndex={-1} sx={{ color: 'text.secondary', fontSize: 14 }}>
                                {showConfirmPw ? 'Hide' : 'Show'}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                        formHelperText: { id: 'confirmPassword-error' },
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={regLoading}
                      sx={{ borderRadius: '10px', py: 1.375, fontWeight: 700, fontSize: 15, textTransform: 'none', mb: 2 }}
                    >
                      {regLoading ? 'Creating account…' : 'Create account'}
                    </Button>
                  </form>

                  <Typography sx={{ textAlign: 'center', fontSize: 13, color: 'text.secondary' }}>
                    Already have an account?{' '}
                    <Box
                      component="span"
                      onClick={() => switchMode('login')}
                      sx={{ color: '#0F6E56', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Log in
                    </Box>
                  </Typography>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>

        {mode === 'login' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}>
            Your progress is saved automatically between sessions
          </Typography>
        )}
      </Box>
    </Box>
  )
}
