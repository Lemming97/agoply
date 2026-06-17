import { useState } from 'react'
import type { User } from '../types'

const TEST_USER = { email: 'test@agoply.com', password: 'agoply123', name: 'Alex' }
const SESSION_KEY = 'agoply_session'
const USERS_KEY = 'agoply_users'

type StoredUser = User & { password: string }

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
    if (email.trim().toLowerCase() === TEST_USER.email && password === TEST_USER.password) {
      const u: User = { email: TEST_USER.email, name: TEST_USER.name }
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return true
    }
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
      const found = users.find(u => u.email === email.trim().toLowerCase() && u.password === password)
      if (found) {
        const u: User = { email: found.email, name: found.name }
        localStorage.setItem(SESSION_KEY, JSON.stringify(u))
        setUser(u)
        return true
      }
    } catch { /* ignore */ }
    return false
  }

  function register(firstName: string, lastName: string, email: string, password: string, school: string | null = null, schoolUai: string | null = null, schoolCity: string | null = null): 'ok' | 'email_taken' {
    const normalizedEmail = email.trim().toLowerCase()
    if (normalizedEmail === TEST_USER.email) return 'email_taken'
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
      if (users.some(u => u.email === normalizedEmail)) return 'email_taken'
      users.push({ email: normalizedEmail, name: `${firstName} ${lastName}`, password })
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      localStorage.setItem('agoply_profile', JSON.stringify({
        firstName, lastName, email: normalizedEmail,
        avatarType: 'initials', avatarValue: null,
        school, schoolUai, schoolCity,
      }))
    } catch { /* ignore */ }
    return 'ok'
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return { user, login, logout, register }
}
