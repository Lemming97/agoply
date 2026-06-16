import type { ReactNode } from 'react'
import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import {
  IconArrowLeft, IconBooks, IconSearch, IconBookmarkFilled,
  IconChevronDown, IconChevronUp, IconX,
} from '@tabler/icons-react'
import type { GlossaryEntry } from '../types'

interface GlossaryPageProps {
  savedGlossary: GlossaryEntry[]
  onRemoveSavedTerm: (term: string) => void
  onBack: () => void
  showToast: (msg: ReactNode) => void
  onGoToLearn: () => void
}

export default function GlossaryPage({ savedGlossary, onRemoveSavedTerm, onBack, showToast, onGoToLearn }: GlossaryPageProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

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

  return (
    <Box>
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
    </Box>
  )
}
