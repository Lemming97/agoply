import type { ReactNode } from 'react'
import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  IconArrowLeft, IconBooks, IconSearch, IconBookmarkFilled,
  IconChevronDown, IconChevronUp, IconX, IconCards, IconTarget,
} from '@tabler/icons-react'
import type { GlossaryEntry } from '../types'

interface GlossaryPageProps {
  savedGlossary: GlossaryEntry[]
  onRemoveSavedTerm: (term: string) => void
  onBack: () => void
  showToast: (msg: ReactNode) => void
  onGoToLearn: () => void
  onStartFlashcards: (terms: GlossaryEntry[], scopeLabel: string) => void
}

export default function GlossaryPage({ savedGlossary, onRemoveSavedTerm, onBack, showToast, onGoToLearn, onStartFlashcards }: GlossaryPageProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  // Scope picker dialog state
  const [scopeOpen, setScopeOpen] = useState(false)
  const [scopeStep, setScopeStep] = useState<1 | 2>(1)
  const [selectedLevelName, setSelectedLevelName] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return savedGlossary
    return savedGlossary.filter(e =>
      e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    )
  }, [savedGlossary, search])

  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryEntry[]>()
    const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term))
    for (const entry of sorted) {
      const letter = entry.term[0].toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(entry)
    }
    return map
  }, [filtered])

  // Level groups for scope picker
  const levelGroups = useMemo(() => {
    const map = new Map<string, { levelId: number; levelName: string; count: number }>()
    for (const entry of savedGlossary) {
      const existing = map.get(entry.levelName)
      if (existing) { existing.count++ }
      else { map.set(entry.levelName, { levelId: entry.levelId, levelName: entry.levelName, count: 1 }) }
    }
    return Array.from(map.values()).sort((a, b) => a.levelId - b.levelId)
  }, [savedGlossary])

  function openScopePicker() {
    setScopeStep(1)
    setSelectedLevelName(null)
    setScopeOpen(true)
  }

  function handleStart(scope: 'all' | 'level') {
    if (scope === 'all') {
      onStartFlashcards(savedGlossary, 'All terms')
    } else if (selectedLevelName) {
      const terms = savedGlossary.filter(e => e.levelName === selectedLevelName)
      onStartFlashcards(terms, selectedLevelName)
    }
    setScopeOpen(false)
  }

  const canStartLevel = scopeStep === 2 && selectedLevelName !== null

  return (
    <Box sx={{ pb: savedGlossary.length >= 2 ? 12 : 4 }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', mb: 2.5, gap: 0.5 }}>
        <IconButton onClick={onBack} size="small" sx={{ mt: 0.25, mr: 0.25 }}>
          <IconArrowLeft size={20} strokeWidth={1.5} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>My Glossary</Typography>
          <Typography variant="caption" color="text.secondary">
            {savedGlossary.length} term{savedGlossary.length !== 1 ? 's' : ''} saved
          </Typography>
        </Box>
      </Stack>

      <TextField
        fullWidth
        size="small"
        placeholder="Search terms or definitions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={16} strokeWidth={1.5} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <IconX size={14} strokeWidth={1.5} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />

      {savedGlossary.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 7 }}>
          <IconBooks size={52} strokeWidth={1} color="var(--muted)" />
          <Typography sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>No saved terms yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: 0.5 }}>
            Bookmark terms from lesson glossaries to build your personal reference.
          </Typography>
          <Button
            variant="outlined"
            onClick={onGoToLearn}
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: 'var(--teal-400)', color: 'var(--teal-600)' }}
          >
            Go to Learn →
          </Button>
        </Box>
      )}

      {savedGlossary.length === 1 && (
        <Typography sx={{ textAlign: 'center', color: 'text.disabled', fontFamily: 'var(--font-body)', fontSize: 13, mt: 1, mb: 2 }}>
          Save at least 2 terms to start a flashcard session
        </Typography>
      )}

      {savedGlossary.length > 0 && filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No results for "{search}"
        </Typography>
      )}

      {Array.from(grouped.entries()).map(([letter, entries]) => (
        <Box key={letter} sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
              color: 'var(--teal-600)', bgcolor: 'var(--teal-50)',
              px: 1.5, py: 0.5, borderRadius: 1, mb: 1,
              position: 'sticky', top: 0, zIndex: 1,
            }}
          >
            {letter}
          </Typography>
          {entries.map((entry, idx) => {
            const isExpanded = expanded === entry.term
            return (
              <Box key={entry.term}>
                <Box
                  onClick={() => setExpanded(isExpanded ? null : entry.term)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    py: 1.25, px: 0.5, cursor: 'pointer', borderRadius: 1,
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.025)' },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                      {entry.term}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'var(--font-body)' }}>
                      {entry.levelName}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={e => {
                      e.stopPropagation()
                      onRemoveSavedTerm(entry.term)
                      showToast(`${entry.term} removed from glossary`)
                    }}
                  >
                    <IconBookmarkFilled size={18} color="var(--teal-400)" />
                  </IconButton>
                  {isExpanded
                    ? <IconChevronUp size={16} strokeWidth={1.5} color="var(--muted)" />
                    : <IconChevronDown size={16} strokeWidth={1.5} color="var(--muted)" />
                  }
                </Box>
                <Collapse in={isExpanded}>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'var(--font-body)', lineHeight: 1.7, pl: 0.5, pb: 1.25 }}>
                    {entry.definition}
                  </Typography>
                </Collapse>
                {idx < entries.length - 1 && <Divider />}
              </Box>
            )
          })}
        </Box>
      ))}

      {/* Floating "Study Flashcards" button */}
      {savedGlossary.length >= 2 && (
        <Button
          variant="contained"
          startIcon={<IconCards size={18} strokeWidth={1.5} />}
          onClick={openScopePicker}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '28px',
            bgcolor: 'var(--teal-400)',
            color: 'white',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            textTransform: 'none',
            px: 3,
            py: 1.25,
            boxShadow: '0 4px 20px rgba(15, 110, 86, 0.35)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            '&:hover': { bgcolor: 'var(--teal-600)' },
          }}
        >
          Study Flashcards
        </Button>
      )}

      {/* Scope picker dialog */}
      <Dialog
        open={scopeOpen}
        onClose={() => setScopeOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, pb: 0.25 }}>
          Start Flashcard Session
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', mb: 2 }}>
            What would you like to study?
          </Typography>

          {/* Step 1: scope choice */}
          {scopeStep === 1 && (
            <Stack spacing={1.5}>
              {([
                {
                  icon: <IconBooks size={20} strokeWidth={1.5} color="var(--teal-400)" />,
                  title: 'All saved terms',
                  desc: `Study all ${savedGlossary.length} saved terms`,
                  action: () => handleStart('all'),
                },
                {
                  icon: <IconTarget size={20} strokeWidth={1.5} color="var(--teal-400)" />,
                  title: 'By level',
                  desc: 'Choose a specific level',
                  action: () => { setScopeStep(2) },
                },
              ] as const).map(opt => (
                <Paper
                  key={opt.title}
                  onClick={opt.action}
                  elevation={0}
                  sx={{
                    p: 2, borderRadius: '12px', cursor: 'pointer',
                    border: '2px solid var(--teal-100, #d0ede5)',
                    '&:hover': { borderColor: 'var(--teal-400)', bgcolor: 'var(--teal-50)' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', mb: 0.5 }}>
                    {opt.icon}
                    <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{opt.title}</Typography>
                  </Stack>
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'text.secondary', pl: '28px' }}>{opt.desc}</Typography>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Step 2: pick a level */}
          {scopeStep === 2 && (
            <Box>
              <Button
                size="small"
                onClick={() => { setScopeStep(1); setSelectedLevelName(null) }}
                sx={{ mb: 1.5, textTransform: 'none', color: 'text.secondary', fontFamily: 'var(--font-body)', pl: 0 }}
              >
                ← Back
              </Button>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'text.secondary', mb: 1.5 }}>
                Choose a level to study:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {levelGroups.map(lg => (
                  <Chip
                    key={lg.levelName}
                    label={`${lg.levelName} (${lg.count})`}
                    onClick={() => setSelectedLevelName(lg.levelName)}
                    sx={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: selectedLevelName === lg.levelName ? 700 : 500,
                      bgcolor: selectedLevelName === lg.levelName ? 'var(--teal-400)' : 'var(--teal-50)',
                      color: selectedLevelName === lg.levelName ? 'white' : 'var(--teal-600)',
                      border: '1px solid',
                      borderColor: selectedLevelName === lg.levelName ? 'var(--teal-400)' : 'var(--teal-100)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: selectedLevelName === lg.levelName ? 'var(--teal-600)' : 'var(--teal-100)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        {(scopeStep === 2) && (
          <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
            <Button
              onClick={() => setScopeOpen(false)}
              sx={{ textTransform: 'none', color: 'text.secondary', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!canStartLevel}
              onClick={() => handleStart('level')}
              sx={{
                textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                bgcolor: 'var(--teal-400)', fontFamily: 'var(--font-body)',
                '&:hover': { bgcolor: 'var(--teal-600)' },
                '&.Mui-disabled': { bgcolor: 'var(--teal-100)', color: 'var(--teal-300)' },
              }}
            >
              Start →
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  )
}
