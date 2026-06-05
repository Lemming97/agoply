import { useState } from 'react'
import type { User } from '../types'

const TEST_USER = { email: 'test@agoply.com', password: 'agoply123', name: 'Alex' }
const SESSION_KEY = 'agoply_session'

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  function login(email: string, password: string): boolean {
    if (
      email.trim().toLowerCase() === TEST_USER.email &&
      password === TEST_USER.password
    ) {
      const u: User = { email: TEST_USER.email, name: TEST_USER.name }
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return true
    }
    return false
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return { user, login, logout }
}
