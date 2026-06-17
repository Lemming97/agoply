export type DragDropExercise = {
  id: string
  levelId: number
  subLessonId?: string   // set for embedded exercises only
  prompt: string
  items: string[]        // correct order, index 0 = position 1
}

export const DRAG_DROP_EXERCISES: DragDropExercise[] = [
  // ── Level 1: Bonds ─────────────────────────────────────────────────────────
  {
    id: 'bonds-ex1',
    levelId: 1,
    subLessonId: 'bonds-3',
    prompt: 'Rank these assets from lowest to highest risk',
    items: [
      'Government Bond',
      'Corporate Bond',
      'High-Yield Bond',
      'Stock',
      'Crypto',
    ],
  },
  {
    id: 'bonds-ex2',
    levelId: 1,
    prompt: 'Put these bond lifecycle steps in the correct order',
    items: [
      'Government needs funding',
      'Bond is issued',
      'Investor buys bond',
      'Coupon payments made',
      'Bond matures & principal returned',
    ],
  },

  // ── Level 2: Stocks ─────────────────────────────────────────────────────────
  {
    id: 'stocks-ex1',
    levelId: 2,
    subLessonId: 'stocks-1',
    prompt: 'Put these steps in the correct order',
    items: [
      'Company founded',
      'IPO launched',
      'Shares listed on exchange',
      'Investor buys shares',
      'Dividend payment',
    ],
  },
  {
    id: 'stocks-ex2',
    levelId: 2,
    prompt: 'Rank these investment types from lowest to highest potential return',
    items: [
      'Savings account',
      'Government Bond',
      'Blue-chip Stock',
      'Growth Stock',
      'Crypto',
    ],
  },

  // ── Level 3: Crypto ──────────────────────────────────────────────────────────
  {
    id: 'crypto-ex1',
    levelId: 3,
    subLessonId: 'crypto-2',
    prompt: 'How does a Bitcoin transaction work? Put the steps in order',
    items: [
      'You initiate a transfer',
      'Transaction broadcast to network',
      'Miners validate',
      'Block added to chain',
      'Recipient receives funds',
    ],
  },
  {
    id: 'crypto-ex2',
    levelId: 3,
    prompt: 'Rank these assets from least to most volatile',
    items: [
      'Government Bond',
      'Blue-chip Stock',
      'ETF',
      'Bitcoin',
      'Meme coin',
    ],
  },

  // ── Level 6: ETFs ────────────────────────────────────────────────────────────
  {
    id: 'etfs-ex1',
    levelId: 6,
    subLessonId: 'etfs-1',
    prompt: 'How is an ETF created? Put the steps in order',
    items: [
      'Index is defined',
      'Fund manager creates ETF',
      'Shares issued to market',
      'Investor buys ETF on exchange',
      'ETF tracks index daily',
    ],
  },
  {
    id: 'etfs-ex2',
    levelId: 6,
    prompt: 'Rank these fund types from lowest to highest annual fees',
    items: [
      'Index ETF',
      'Passive Mutual Fund',
      'Active Mutual Fund',
      'Hedge Fund',
    ],
  },

  // ── Level 7: Mutual Funds ────────────────────────────────────────────────────
  {
    id: 'mutualfunds-ex1',
    levelId: 7,
    subLessonId: 'mutual-funds-2',
    prompt: 'Rank these from lowest to highest total cost over 20 years',
    items: [
      'Index ETF (0.05% fee)',
      'Passive Mutual Fund (0.20% fee)',
      'Active Mutual Fund (1.5% fee)',
      'Hedge Fund (2% + 20% profits)',
    ],
  },
  {
    id: 'mutualfunds-ex2',
    levelId: 7,
    prompt: 'How does a mutual fund work? Put the steps in order',
    items: [
      'Investors pool money',
      'Fund manager buys assets',
      'Portfolio grows',
      'NAV calculated daily',
      'Investor redeems shares for cash',
    ],
  },
]

export function getEmbeddedExercise(subLessonId: string): DragDropExercise | null {
  return DRAG_DROP_EXERCISES.find(e => e.subLessonId === subLessonId) ?? null
}

export function getStandaloneExercise(levelId: number): DragDropExercise | null {
  return DRAG_DROP_EXERCISES.find(e => e.levelId === levelId && !e.subLessonId) ?? null
}

export const LEVELS_WITH_EXERCISES = new Set(
  DRAG_DROP_EXERCISES.map(e => e.levelId)
)