import { useState } from 'react'

const STORAGE_KEY = 'agoply_dragdrop'

type DragDropStorage = {
  completedExercises: string[]
  earnedXP: Record<string, number>
}

const DEFAULT: DragDropStorage = { completedExercises: [], earnedXP: {} }

export function useDragDropState() {
  const [data, setData] = useState<DragDropStorage>(() => {
    try {
      return (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as DragDropStorage) ?? DEFAULT
    } catch {
      return DEFAULT
    }
  })

  function markCompleted(exerciseId: string, xp: number) {
    setData(prev => {
      if (prev.completedExercises.includes(exerciseId)) return prev
      const next: DragDropStorage = {
        completedExercises: [...prev.completedExercises, exerciseId],
        earnedXP: { ...prev.earnedXP, [exerciseId]: xp },
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function isCompleted(exerciseId: string): boolean {
    return data.completedExercises.includes(exerciseId)
  }

  return { isCompleted, markCompleted }
}