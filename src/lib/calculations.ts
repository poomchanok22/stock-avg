import type { Purchase } from "@prisma/client"

export interface StockStats {
  totalShares: number
  totalCost: number
  avgCostPerShare: number
  currentValue: number
  pnl: number
  pnlPercent: number
  breakEvenPrice: number
  runningAvg: RunningAvgPoint[]
}

export interface RunningAvgPoint {
  date: string
  avgCost: number
  shares: number
  totalCost: number
}

/**
 * Calculate all stats for a stock given its purchases and current price.
 */
export function calculateStockStats(
  purchases: Purchase[],
  currentPrice: number | null | undefined
): StockStats {
  if (purchases.length === 0) {
    return {
      totalShares: 0,
      totalCost: 0,
      avgCostPerShare: 0,
      currentValue: 0,
      pnl: 0,
      pnlPercent: 0,
      breakEvenPrice: 0,
      runningAvg: [],
    }
  }

  // Sort by date ascending
  const sorted = [...purchases].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let totalShares = 0
  let totalCost = 0
  const runningAvg: RunningAvgPoint[] = []

  for (const p of sorted) {
    totalShares += p.shares
    totalCost += p.shares * p.pricePerShare + p.commission + (p.withholdingTax ?? 0)
    runningAvg.push({
      date: new Date(p.date).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      avgCost: parseFloat((totalCost / totalShares).toFixed(4)),
      shares: parseFloat(totalShares.toFixed(6)),
      totalCost: parseFloat(totalCost.toFixed(2)),
    })
  }

  const avgCostPerShare = totalCost / totalShares
  const price = currentPrice ?? 0
  const currentValue = totalShares * price
  const pnl = currentValue - totalCost
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0

  return {
    totalShares: parseFloat(totalShares.toFixed(6)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    avgCostPerShare: parseFloat(avgCostPerShare.toFixed(4)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    pnl: parseFloat(pnl.toFixed(2)),
    pnlPercent: parseFloat(pnlPercent.toFixed(2)),
    breakEvenPrice: parseFloat(avgCostPerShare.toFixed(4)),
    runningAvg,
  }
}

/**
 * Calculate how much additional investment is needed at a given buy price
 * to bring average cost down to a target price.
 */
export function calcAveragingDown(
  currentShares: number,
  currentAvg: number,
  buyPrice: number,
  targetAvg: number
): { additionalShares: number; additionalCost: number } | null {
  // (currentShares * currentAvg + additionalShares * buyPrice) / (currentShares + additionalShares) = targetAvg
  // Solve for additionalShares:
  // currentShares * currentAvg + additionalShares * buyPrice = targetAvg * currentShares + targetAvg * additionalShares
  // additionalShares * (buyPrice - targetAvg) = targetAvg * currentShares - currentShares * currentAvg
  // additionalShares = currentShares * (targetAvg - currentAvg) / (buyPrice - targetAvg)

  if (buyPrice === targetAvg) return null // Cannot reach target at this buy price
  if (buyPrice >= currentAvg && targetAvg >= currentAvg) return null // Already below/at target

  const additionalShares =
    (currentShares * (targetAvg - currentAvg)) / (buyPrice - targetAvg)

  if (additionalShares <= 0) return null

  return {
    additionalShares: parseFloat(additionalShares.toFixed(6)),
    additionalCost: parseFloat((additionalShares * buyPrice).toFixed(2)),
  }
}

/**
 * Format currency with symbol
 */
export function formatCurrency(
  amount: number,
  currency: "USD" | "THB" = "USD",
  exchangeRate = 35
): string {
  if (currency === "THB") {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount)
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount)
}

export function usdToThb(usdAmount: number, rate: number): number {
  return parseFloat((usdAmount * rate).toFixed(2))
}
