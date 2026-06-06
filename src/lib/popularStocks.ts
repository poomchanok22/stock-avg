export interface PopularStock {
  symbol: string
  name: string
  currency: "USD" | "THB"
  group: "magnificent7" | "etf" | "crypto"
}

/**
 * Curated quick-pick list shown in "Add Stock":
 * the "Magnificent Seven" (หุ้น 7 นางฟ้า) US tech giants + popular index ETFs.
 */
export const POPULAR_STOCKS: PopularStock[] = [
  { symbol: "AAPL", name: "Apple Inc.", currency: "USD", group: "magnificent7" },
  { symbol: "MSFT", name: "Microsoft Corporation", currency: "USD", group: "magnificent7" },
  { symbol: "GOOGL", name: "Alphabet Inc. (Class A)", currency: "USD", group: "magnificent7" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", currency: "USD", group: "magnificent7" },
  { symbol: "NVDA", name: "NVIDIA Corporation", currency: "USD", group: "magnificent7" },
  { symbol: "META", name: "Meta Platforms, Inc.", currency: "USD", group: "magnificent7" },
  { symbol: "TSLA", name: "Tesla, Inc.", currency: "USD", group: "magnificent7" },
  { symbol: "QQQM", name: "Invesco NASDAQ 100 ETF", currency: "USD", group: "etf" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", currency: "USD", group: "etf" },
  { symbol: "BTC-USD", name: "Bitcoin USD", currency: "USD", group: "crypto" },
]
