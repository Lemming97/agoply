import { useState } from 'react'
import type { GlossaryEntry } from '../types'

export type FlashcardSession = {
  deck: GlossaryEntry[]
  currentIndex: number
  gotIt: GlossaryEntry[]
  reviewing: GlossaryEntry[]
  isComplete: boolean
  score: number
  totalStarted: number
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function useFlashcardSession() {
  const [session, setSession] = useState<FlashcardSession | null>(null)

  function startSession(terms: GlossaryEntry[]) {
    setSession({
      deck: shuffle(terms),
      currentIndex: 0,
      gotIt: [],
      reviewing: [],
      isComplete: false,
      score: 0,
      totalStarted: terms.length,
    })
  }

  function markGotIt() {
    setSession(s => {
      if (!s || s.deck.length === 0) return s
      const current = s.deck[0]
      const newDeck = s.deck.slice(1)
      const newGotIt = [...s.gotIt, current]
      const isComplete = newDeck.length === 0
      const firstTryCount = newGotIt.length - s.reviewing.length
      const score = isComplete ? Math.round((firstTryCount / s.totalStarted) * 100) : s.score
      return { ...s, deck: newDeck, gotIt: newGotIt, isComplete, score }
    })
  }

  function markReview() {
    setSession(s => {
      if (!s || s.deck.length === 0) return s
      const current = s.deck[0]
      const remaining = s.deck.slice(1)
      const minInsert = Math.min(2, remaining.length)
      const insertIdx = Math.min(
        minInsert + Math.floor(Math.random() * Math.max(1, remaining.length - minInsert + 1)),
        remaining.length,
      )
      const newDeck = [...remaining.slice(0, insertIdx), current, ...remaining.slice(insertIdx)]
      const alreadyReviewing = s.reviewing.some(r => r.term === current.term)
      const newReviewing = alreadyReviewing ? s.reviewing : [...s.reviewing, current]
      return { ...s, deck: newDeck, reviewing: newReviewing }
    })
  }

  return { session, startSession, markGotIt, markReview }
}
