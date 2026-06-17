export type NavTab = 'education' | 'simulation' | 'realworld'

export interface User {
  email: string
  name: string
}

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  avatarType: 'initials' | 'icon' | 'upload'
  avatarValue: string | null
  school: string | null
  schoolUai: string | null
  schoolCity: string | null
}

export interface GlossaryEntry {
  term: string
  definition: string
  levelId: number
  levelName: string
  savedAt: string
}
export type AssetCategory = 'stock' | 'bond' | 'crypto' | 'forex' | 'commodity' | 'etf'
export type LevelStatus = 'completed' | 'active' | 'locked'

export interface TextBlock {
  type: 'text'
  value: string
}

export interface CalloutBlock {
  type: 'callout'
  label: string
  items: string[]
}

export interface ImportantBlock {
  type: 'important'
  value: string
}

export type ContentBlock = TextBlock | CalloutBlock | ImportantBlock

export interface Quiz {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface SubLesson {
  id: string
  title: string
  content: ContentBlock[]
}

export interface Level {
  id: number
  name: string
  subtitle: string
  icon: string
  desc: string
  unlocks: string
  subLessons: SubLesson[]
  quiz: Quiz[]
  isAI?: boolean
  animation?: object
  glossary?: { term: string; definition: string }[]
}

export interface MarketAsset {
  id: string
  name: string
  ticker: string
  icon: string
  price: number
  change: number
  category: AssetCategory
  requiredLevel: number
}

export interface Holding {
  id: string
  name: string
  ticker: string
  icon: string
  shares: number
  price: number
  change: number
  category: AssetCategory
  requiredLevel?: number
}

export interface Portfolio {
  cash: number
  holdings: Holding[]
}

export interface GameStateData {
  xp: number
  streak: number
  completedLevels: number[]
  completedSubLessons: string[]
  activeLesson: number
  portfolio: Portfolio
  riskProfile: string
  completedGames: string[]
  earnedGameXP: Record<string, number>
}

export interface GameState extends GameStateData {
  portfolioValue: number
  completeLevel: (levelId: number) => void
  completeSubLesson: (id: string) => void
  buyAsset: (asset: MarketAsset, quantity: number) => void
  sellAsset: (holdingId: string, quantity: number) => void
  addXP: (amount: number) => void
  completeGame: (gameId: string, xp: number) => void
  isGameComplete: (gameId: string) => boolean
  resetState: () => void
  savedGlossary: GlossaryEntry[]
  saveGlossaryTerm: (entry: GlossaryEntry) => void
  removeSavedTerm: (term: string) => void
}

export interface LeaderboardEntry {
  rank: number
  name: string
  school: string
  value: number
  me: boolean
}

export interface Platform {
  id: string
  name: string
  color: string
  min: string
  time: string
  assets: string[]
  perk: string
  beginner: boolean
  rating: number
  steps: string[]
  article?: { title: string; source: string; url: string }
}
