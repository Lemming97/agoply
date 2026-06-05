import { useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import type { Lesson } from '../types'

interface LessonPanelProps {
  lesson: Lesson
  levelId: number
  completed: boolean
  onComplete: () => void
  showToast: (msg: string) => void
}

function renderText(raw: string): string {
  return raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export default function LessonPanel({ lesson, completed, onComplete }: LessonPanelProps) {
  const [answered, setAnswered] = useState<number | null>(null)

  function handleAnswer(idx: number) {
    if (answered !== null) return
    setAnswered(idx)
  }

  const correct = answered === lesson.quiz.correct
  const canComplete = answered === lesson.quiz.correct && !completed

  return (
    <Paper variant="outlined" sx={{ borderColor: 'var(--teal-100)', borderRadius: 'var(--radius)', p: 2.5, mb: 2, mt: '-4px' }}>
      <Typography variant="h6" color="var(--teal-600)" sx={{ fontSize: 16, fontWeight: 700, mb: 1.75 }}>
        📖 {lesson.title}
      </Typography>

      {lesson.content.map((block, i) => {
        if (block.type === 'text') {
          return (
            <Typography
              key={i}
              variant="body2"
              color="text.primary"
              sx={{ fontSize: 13.5, lineHeight: 1.75, mb: 1.75 }}
              dangerouslySetInnerHTML={{ __html: renderText(block.value) }}
            />
          )
        }
        if (block.type === 'callout') {
          return (
            <Alert key={i} icon={false} severity="success" sx={{ bgcolor: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: '10px', mb: 1.75, '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="caption" color="var(--teal-600)" sx={{ fontWeight: 700, letterSpacing: '0.8px', display: 'block', mb: 1 }}>
                {block.label.toUpperCase()}
              </Typography>
              {block.items.map((item, j) => (
                <Typography key={j} variant="body2" sx={{ fontSize: 13, lineHeight: 1.7, mb: 0.5 }}
                  dangerouslySetInnerHTML={{ __html: '• ' + renderText(item) }}
                />
              ))}
            </Alert>
          )
        }
        return null
      })}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        🧠 Challenge: {lesson.quiz.question}
      </Typography>

      {lesson.quiz.options.map((opt, i) => {
        let bg = 'var(--surface)', borderColor = 'var(--border)', color = 'var(--text)'
        if (answered !== null) {
          if (i === lesson.quiz.correct) { bg = 'var(--teal-50)'; borderColor = '#1D9E75'; color = 'var(--teal-600)' }
          else if (i === answered && answered !== lesson.quiz.correct) { bg = 'var(--red-50)'; borderColor = '#E24B4A'; color = '#A32D2D' }
        }
        return (
          <Button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answered !== null}
            variant="outlined"
            sx={{
              display: 'flex', width: '100%', justifyContent: 'flex-start',
              py: '10px', px: '14px', mb: '8px',
              borderColor, borderWidth: '1.5px', borderRadius: '8px',
              bgcolor: bg, color,
              fontSize: '13px', fontWeight: answered !== null && i === lesson.quiz.correct ? 600 : 400,
              textTransform: 'none',
              '&:hover': { bgcolor: bg, borderColor, borderWidth: '1.5px' },
              '&.Mui-disabled': { bgcolor: bg, color, borderColor, borderWidth: '1.5px', opacity: 1 },
            }}
          >
            {opt}
          </Button>
        )
      })}

      {answered !== null && (
        <Alert severity={correct ? 'success' : 'error'} sx={{ mt: 1, borderRadius: '8px', border: `1px solid ${correct ? 'var(--teal-100)' : '#F09595'}`, bgcolor: correct ? 'var(--teal-50)' : 'var(--red-50)', color: correct ? 'var(--teal-600)' : '#A32D2D', '& .MuiAlert-icon': { color: correct ? 'var(--teal-600)' : '#A32D2D' } }}>
          {correct ? 'Correct! ' : 'Not quite. '}{lesson.quiz.explanation}
        </Alert>
      )}

      {canComplete && (
        <Button onClick={onComplete} variant="contained" color="primary" sx={{ mt: 2, borderRadius: '10px', px: 3, py: 1.5, fontSize: 13, fontWeight: 700, textTransform: 'none' }}>
          Complete Level & Earn Rewards 🎉
        </Button>
      )}

      {completed && (
        <Typography color="var(--teal-600)" sx={{ fontSize: 13, fontWeight: 600, mt: 1.5 }}>
          ✅ You've already completed this level!
        </Typography>
      )}
    </Paper>
  )
}
