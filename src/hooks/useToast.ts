import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export function useToast() {
  const [toast, setToast] = useState<ReactNode>(null)

  const showToast = useCallback((msg: ReactNode) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  return { toast, showToast }
}
