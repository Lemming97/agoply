import { useState } from 'react'
import Button from '@mui/material/Button'

function renderText(raw) {
  return raw.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export default function LessonPanel({ lesson, levelId, completed, onComplete, showToast }) {
  const [answered, setAnswered] = useState(null)

  function handleAnswer(idx) {
    if (answered !== null) return
    setAnswered(idx)
  }

  const correct = answered === lesson.quiz.correct
  const canComplete = answered === lesson.quiz.correct && !completed

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1.5px solid var(--teal-100)',
      borderRadius: 'var(--radius)',
      padding: 20,
      marginBottom: 16,
      marginTop: -4,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--teal-600)', marginBottom: 14 }}>
        📖 {lesson.title}
      </h3>

      {/* Content blocks */}
      {lesson.content.map((block, i) => {
        if (block.type === 'text') {
          return (
            <p
              key={i}
              style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text)', marginBottom: 14 }}
              dangerouslySetInnerHTML={{ __html: renderText(block.value) }}
            />
          )
        }
        if (block.type === 'callout') {
          return (
            <div key={i} style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 10, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', letterSpacing: '0.8px', marginBottom: 8 }}>
                {block.label.toUpperCase()}
              </div>
              {block.items.map((item, j) => (
                <div key={j} style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 4, color: 'var(--text)' }}
                  dangerouslySetInnerHTML={{ __html: '• ' + renderText(item) }} />
              ))}
            </div>
          )
        }
        return null
      })}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

      {/* Quiz */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
        🧠 Challenge: {lesson.quiz.question}
      </div>

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
            disableElevation
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-start',
              textAlign: 'left',
              py: '10px',
              px: '14px',
              mb: '8px',
              borderColor,
              borderWidth: '1.5px',
              borderRadius: '8px',
              bgcolor: bg,
              color,
              fontSize: '13px',
              fontWeight: answered !== null && i === lesson.quiz.correct ? 600 : 400,
              textTransform: 'none',
              '&:hover': { bgcolor: bg, borderColor, borderWidth: '1.5px' },
              '&.Mui-disabled': { bgcolor: bg, color, borderColor, borderWidth: '1.5px', opacity: 1 },
            }}
          >
            {opt}
          </Button>
        )
      })}

      {/* Result message */}
      {answered !== null && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          marginTop: 8,
          background: correct ? 'var(--teal-50)' : 'var(--red-50)',
          border: `1px solid ${correct ? 'var(--teal-100)' : '#F09595'}`,
          color: correct ? 'var(--teal-600)' : '#A32D2D',
          lineHeight: 1.6,
        }}>
          {correct ? '✅ Correct! ' : '❌ Not quite. '}{lesson.quiz.explanation}
        </div>
      )}

      {/* Complete button */}
      {canComplete && (
        <Button
          onClick={onComplete}
          variant="contained"
          disableElevation
          sx={{
            mt: 2,
            bgcolor: '#1D9E75',
            color: '#fff',
            borderRadius: '10px',
            px: '24px',
            py: '12px',
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: '#0F6E56' },
          }}
        >
          Complete Level & Earn Rewards 🎉
        </Button>
      )}

      {completed && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--teal-600)', fontWeight: 600 }}>
          ✅ You've already completed this level!
        </div>
      )}
    </div>
  )
}
