export interface StreakReward {
  streak: number
  cashBonus: number
  label: string
}

export const STREAK_REWARDS: StreakReward[] = [
  { streak: 3,  cashBonus: 50,  label: '3-day streak!' },
  { streak: 5,  cashBonus: 100, label: '5-day streak!' },
  { streak: 7,  cashBonus: 200, label: '1 week streak!' },
  { streak: 14, cashBonus: 300, label: '2 week streak!' },
  { streak: 30, cashBonus: 500, label: '1 month streak!' },
]
