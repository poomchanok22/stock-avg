import { NextResponse } from "next/server"

// Cache exchange rate in memory for 1 hour
let cache: { rate: number; updatedAt: string } | null = null
let cacheTime = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET() {
  const now = Date.now()

  if (cache && now - cacheTime < CACHE_TTL) {
    return NextResponse.json(cache)
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error("Exchange rate fetch failed")

    const data = await res.json()
    const thbRate = data.rates?.THB ?? 35.5

    cache = { rate: thbRate, updatedAt: new Date().toISOString() }
    cacheTime = now

    return NextResponse.json(cache)
  } catch {
    // Fallback rate
    return NextResponse.json({ rate: 35.5, updatedAt: new Date().toISOString() })
  }
}
