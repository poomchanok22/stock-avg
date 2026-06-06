import { NextRequest, NextResponse } from "next/server"

interface PriceCacheEntry {
  price: number
  currency: string
  updatedAt: number
}

interface PriceResult {
  price: number
  currency: string
  updatedAt: string
}

// Short in-memory cache so the dashboard can poll frequently ("live")
// without hammering Yahoo Finance or tripping its rate limiting.
const cache = new Map<string, PriceCacheEntry>()
const CACHE_TTL = 20 * 1000 // 20 seconds

async function fetchYahooPrice(symbol: string): Promise<{ price: number; currency: string } | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      {
        // Yahoo's unofficial endpoint rejects requests without a browser-like UA
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/json",
        },
        cache: "no-store",
      }
    )
    if (!res.ok) return null

    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    const price = meta?.regularMarketPrice

    if (typeof price !== "number") return null

    return { price, currency: typeof meta?.currency === "string" ? meta.currency : "USD" }
  } catch {
    return null
  }
}

/**
 * GET /api/stock-price?symbols=AAPL,MSFT,QQQM
 * Returns live (or recently cached) quotes for the requested symbols.
 * Response: { prices: { [symbol]: { price, currency, updatedAt } | null } }
 */
export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get("symbols") ?? ""
  const symbols = Array.from(
    new Set(
      symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    )
  )

  if (symbols.length === 0) {
    return NextResponse.json({ error: "ต้องระบุ symbols อย่างน้อยหนึ่งตัว" }, { status: 400 })
  }

  const now = Date.now()
  const prices: Record<string, PriceResult | null> = {}

  await Promise.all(
    symbols.map(async (symbol) => {
      const cached = cache.get(symbol)
      if (cached && now - cached.updatedAt < CACHE_TTL) {
        prices[symbol] = {
          price: cached.price,
          currency: cached.currency,
          updatedAt: new Date(cached.updatedAt).toISOString(),
        }
        return
      }

      const fetched = await fetchYahooPrice(symbol)
      if (fetched) {
        cache.set(symbol, { ...fetched, updatedAt: now })
        prices[symbol] = { ...fetched, updatedAt: new Date(now).toISOString() }
      } else if (cached) {
        // Live fetch failed — serve the last known price rather than nothing
        prices[symbol] = {
          price: cached.price,
          currency: cached.currency,
          updatedAt: new Date(cached.updatedAt).toISOString(),
        }
      } else {
        prices[symbol] = null
      }
    })
  )

  return NextResponse.json({ prices })
}
