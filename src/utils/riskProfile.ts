import type { AssetCategory, SimulationStats } from '../types'

export type RiskLabel = 'Very Cautious' | 'Cautious' | 'Balanced Growth' | 'Growth' | 'Aggressive Growth'

export interface RiskBehavior {
  label: string
  description: string
  impact: 'cautious' | 'balanced' | 'aggressive'
  icon: string
}

export interface RiskProfileResult {
  label: RiskLabel
  score: number
  color: string
  allocation: string
  behaviors: RiskBehavior[]
  confidence: 'low' | 'medium' | 'high'
}

const LABEL_COLORS: Record<RiskLabel, string> = {
  'Very Cautious':   'var(--blue-400)',
  'Cautious':        '#3AAFA9',
  'Balanced Growth': '#1D9E75',
  'Growth':          '#FFB300',
  'Aggressive Growth': '#E24B4A',
}

const LABEL_ALLOCATIONS: Record<RiskLabel, string> = {
  'Very Cautious':   '80% Bonds · 15% ETFs · 5% Stocks',
  'Cautious':        '60% Bonds · 25% ETFs · 15% Stocks',
  'Balanced Growth': '50% ETFs · 30% Stocks · 20% Bonds',
  'Growth':          '55% Stocks · 30% ETFs · 15% Crypto',
  'Aggressive Growth': '60% Stocks · 25% Crypto · 15% Commodities',
}

function labelForScore(score: number): RiskLabel {
  if (score <= 20) return 'Very Cautious'
  if (score <= 40) return 'Cautious'
  if (score <= 60) return 'Balanced Growth'
  if (score <= 80) return 'Growth'
  return 'Aggressive Growth'
}

function pullToward(score: number, target: number, amount: number): number {
  if (score > target) return Math.max(target, score - amount)
  if (score < target) return Math.min(target, score + amount)
  return score
}

function traded(stats: SimulationStats, category: AssetCategory): boolean {
  return stats.assetCategoriesTraded.includes(category)
}

export function calculateRiskProfile(stats: SimulationStats, completedLevels: number[]): RiskProfileResult {
  void completedLevels // scoring is driven entirely by simulation behavior, not lesson progress
  let score = 50
  const behaviors: RiskBehavior[] = []

  // Portfolio composition isn't passed in, so "only bonds" is approximated
  // from the categories ever traded.
  const onlyBonds = stats.assetCategoriesTraded.length === 1 && stats.assetCategoriesTraded[0] === 'bond'

  if (stats.cashHeldPct > 50) {
    score -= 15
    behaviors.push({ label: 'Holds mostly cash', description: 'You kept over 50% in cash — a cautious approach', impact: 'cautious', icon: 'IconWallet' })
  }
  if (onlyBonds) {
    score -= 15
    behaviors.push({ label: 'Bond-focused', description: 'You favored low-risk fixed income assets', impact: 'cautious', icon: 'IconBuildingBank' })
  }
  if (!traded(stats, 'crypto')) {
    score -= 5
  }
  if (stats.diversificationScore < 2) {
    score -= 10
    behaviors.push({ label: 'Low diversification', description: 'You mostly stuck to one type of asset', impact: 'cautious', icon: 'IconChartPie' })
  }
  if (stats.sellCount > stats.buyCount) {
    score -= 5
    behaviors.push({ label: 'Sells more than buys', description: 'You sold more often than you bought — a defensive pattern', impact: 'cautious', icon: 'IconTrendingDown' })
  }
  if (stats.wentBelowHalf) {
    score -= 10
    behaviors.push({ label: 'Recovered from a big loss', description: 'Your portfolio once dropped below half its starting value', impact: 'cautious', icon: 'IconAlertTriangle' })
  }
  if (stats.totalTrades < 3) {
    score -= 8
    behaviors.push({ label: 'Limited activity', description: 'You have made very few trades so far', impact: 'cautious', icon: 'IconHourglass' })
  }

  if (traded(stats, 'crypto')) {
    score += 20
    behaviors.push({ label: 'Crypto investor', description: 'You traded cryptocurrency — a high-risk asset', impact: 'aggressive', icon: 'IconCurrencyBitcoin' })
  }
  if (traded(stats, 'commodity')) {
    score += 10
    behaviors.push({ label: 'Commodities trader', description: 'You traded commodities like gold or oil — volatile but diversifying', impact: 'aggressive', icon: 'IconBarrel' })
  }
  if (stats.largestSinglePosition > 60) {
    score += 15
    behaviors.push({ label: 'Concentrated positions', description: 'You put over 60% in one asset', impact: 'aggressive', icon: 'IconTarget' })
  }
  if (stats.totalTrades > 10) {
    score += 10
    behaviors.push({ label: 'Active trader', description: 'You made over 10 trades — an active style', impact: 'aggressive', icon: 'IconRefresh' })
  }
  if (stats.buyCount > stats.sellCount * 2) {
    score += 8
    behaviors.push({ label: 'Buys aggressively', description: 'You buy much more often than you sell', impact: 'aggressive', icon: 'IconTrendingUp' })
  }
  if (stats.beatBenchmark) {
    score += 10
    behaviors.push({ label: 'Beat the benchmark', description: 'Your portfolio outperformed the 5% benchmark', impact: 'balanced', icon: 'IconTrophy' })
  }
  if (stats.diversificationScore >= 4) {
    score += 5
    behaviors.push({ label: 'Well diversified', description: 'You spread investments across multiple asset types', impact: 'balanced', icon: 'IconChartPie' })
  }

  if (stats.diversificationScore >= 2 && stats.diversificationScore <= 4) {
    score = pullToward(score, 50, 5)
  }
  if (stats.portfolioReturn >= 3 && stats.portfolioReturn <= 15) {
    score = pullToward(score, 50, 5)
    behaviors.push({ label: 'Measured risk-taking', description: 'Your returns reflect a balanced, measured approach to risk', impact: 'balanced', icon: 'IconEqual' })
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  const label = labelForScore(score)
  const confidence: RiskProfileResult['confidence'] =
    stats.totalTrades < 3 ? 'low' : stats.totalTrades <= 8 ? 'medium' : 'high'

  return {
    label,
    score,
    color: LABEL_COLORS[label],
    allocation: LABEL_ALLOCATIONS[label],
    behaviors,
    confidence,
  }
}
