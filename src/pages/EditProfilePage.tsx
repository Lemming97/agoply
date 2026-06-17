import type { ReactNode } from 'react'
import { useState, useRef } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  IconArrowLeft, IconUpload, IconGridDots, IconCircleCheck,
} from '@tabler/icons-react'
import type { UserProfile } from '../types'

const AVATAR_SEEDS = [
  'Lindsey', 'Marcus', 'Sofia',  'James',
  'Aisha',   'Carlos', 'Emma',   'Noah',
  'Zara',    'Luca',   'Maya',   'Kai',
  'Priya',   'Felix',  'Nina',   'Omar',
]

function dicebearUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&clothesColor=1D9E75,0F6E56,5DCAA5,085041,C08B00&mouth=default,eating,grimace,smile,tongue,twinkle&eyes=closed,default,happy,hearts,side,squint,surprised,wink,winkWacky&eyebrows=default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural,unibrowNatural,upDownNatural`
}

interface Props {
  profile: UserProfile
  onSave: (updates: Partial<UserProfile>) => void
  onBack: () => void
  showToast: (msg: ReactNode) => void
}

function getAvatarSrc(p: UserProfile): string | undefined {
  if (p.avatarType === 'upload') return p.avatarValue ?? undefined
  if (p.avatarType === 'icon') return dicebearUrl(p.avatarValue ?? '')
  return dicebearUrl(p.firstName || 'default')
}

export default function EditProfilePage({ profile, onSave, onBack, showToast }: Props) {
  const [draft, setDraft] = useState<UserProfile>({ ...profile })
  const [touched, setTouched] = useState({ firstName: false, lastName: false, email: false })
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const errors = {
    firstName: draft.firstName.trim().length < 1 ? 'Required' : '',
    lastName:  draft.lastName.trim().length < 1  ? 'Required' : '',
    email:     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) ? 'Enter a valid email address' : '',
  }

  const isChanged =
    draft.firstName   !== profile.firstName   ||
    draft.lastName    !== profile.lastName    ||
    draft.email       !== profile.email       ||
    draft.avatarType  !== profile.avatarType  ||
    draft.avatarValue !== profile.avatarValue

  const isValid = !errors.firstName && !errors.lastName && !errors.email
  const canSave = isChanged && isValid

  function blur(field: keyof typeof touched) {
    setTouched(t => ({ ...t, [field]: true }))
  }

  function handleSave() {
    onSave(draft)
    showToast(
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        <IconCircleCheck size={16} strokeWidth={1.5} />
        Profile updated
      </Stack>
    )
    onBack()
  }

  const draftSrc = getAvatarSrc(draft)

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      {/* Back */}
      <Button
        startIcon={<IconArrowLeft size={16} strokeWidth={1.5} />}
        onClick={onBack}
        sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600, px: 0, mb: 2, minWidth: 0 }}
      >
        Back
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Edit Profile</Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Avatar section */}
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.8px', color: 'text.secondary', display: 'block', mb: 1.5 }}>
        AVATAR
      </Typography>
      <Stack sx={{ alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          src={draftSrc}
          sx={{ width: 80, height: 80, fontSize: 32, fontWeight: 800, bgcolor: '#1D9E75', color: '#fff' }}
        >
          {draft.avatarType === 'initials' ? (draft.firstName[0]?.toUpperCase() ?? '?') : undefined}
        </Avatar>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconUpload size={15} strokeWidth={1.5} />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ textTransform: 'none', borderRadius: '8px', fontSize: 13 }}
          >
            Upload photo
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconGridDots size={15} strokeWidth={1.5} />}
            onClick={() => setPickerOpen(true)}
            sx={{ textTransform: 'none', borderRadius: '8px', fontSize: 13 }}
          >
            Choose icon
          </Button>
        </Stack>
        {uploadError && (
          <Typography variant="caption" color="error">{uploadError}</Typography>
        )}
      </Stack>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (!file) return
          if (file.size > 2 * 1024 * 1024) {
            setUploadError('Image must be under 2 MB')
            return
          }
          setUploadError(null)
          const reader = new FileReader()
          reader.onload = ev => {
            setDraft(d => ({ ...d, avatarType: 'upload', avatarValue: ev.target?.result as string }))
          }
          reader.readAsDataURL(file)
          e.target.value = ''
        }}
      />

      <Divider sx={{ mb: 3 }} />

      {/* Form fields */}
      <Stack sx={{ gap: 2.5, mb: 4 }}>
        <TextField
          label="First Name"
          value={draft.firstName}
          onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))}
          onBlur={() => blur('firstName')}
          error={touched.firstName && Boolean(errors.firstName)}
          helperText={touched.firstName ? errors.firstName : ''}
          fullWidth
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
        <TextField
          label="Last Name"
          value={draft.lastName}
          onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))}
          onBlur={() => blur('lastName')}
          error={touched.lastName && Boolean(errors.lastName)}
          helperText={touched.lastName ? errors.lastName : ''}
          fullWidth
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
        <TextField
          label="Email Address"
          type="email"
          value={draft.email}
          onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
          onBlur={() => blur('email')}
          error={touched.email && Boolean(errors.email)}
          helperText={touched.email ? errors.email : ''}
          fullWidth
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        />
      </Stack>

      {/* Actions */}
      <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ textTransform: 'none', borderRadius: '8px', borderColor: 'var(--border)', color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSave}
          onClick={handleSave}
          sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700, px: 3 }}
        >
          Save Changes
        </Button>
      </Stack>

      {/* Avatar picker dialog */}
      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Choose your avatar</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1.5,
              pt: 0.5,
            }}
          >
            {AVATAR_SEEDS.map(seed => {
              const selected = draft.avatarType === 'icon' && draft.avatarValue === seed
              return (
                <Box
                  key={seed}
                  onClick={() => {
                    setDraft(d => ({ ...d, avatarType: 'icon', avatarValue: seed }))
                    setPickerOpen(false)
                  }}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: selected ? '3px solid var(--teal-400)' : '3px solid transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    bgcolor: 'var(--teal-50)',
                    transition: 'transform 0.15s, border-color 0.15s',
                    '&:hover': { transform: 'scale(1.05)' },
                  }}
                >
                  <img
                    src={dicebearUrl(seed)}
                    alt={seed}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  />
                </Box>
              )
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPickerOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
