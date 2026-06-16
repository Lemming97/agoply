const API_KEY = import.meta.env.VITE_FMP_API_KEY as string

export interface FmpQuote {
  symbol: string
  price: number
  changesPercentage: number
}

export async function fetchQuotes(symbols: string[]): Promise<FmpQuote[]> {
  const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbols.join(',')}&apikey=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FMP ${res.status}`)
  return res.json() as Promise<FmpQuote[]>
}
