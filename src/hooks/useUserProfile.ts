import { useState, useCallback } from 'react'
import type { UserProfile } from '../types'

const KEY = 'agoply_profile'

function initProfile(name: string, email: string): UserProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as UserProfile
  } catch {}
  const parts = name.trim().split(' ')
  return {
    firstName: parts[0] ?? name,
    lastName: parts.slice(1).join(' '),
    email,
    avatarType: 'initials',
    avatarValue: null,
  }
}

export function useUserProfile(name: string, email: string) {
  const [profile, setProfile] = useState<UserProfile>(() => initProfile(name, email))

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates }
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  return { profile, updateProfile }
}
