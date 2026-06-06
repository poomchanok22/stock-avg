"use client"

import { TrendingUp, TrendingDown, DollarSign, BarChart2, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStockStore } from "@/store/stockStore"
import { calculateStockStats } from "@/lib/calculations"
import { cn, formatNumber } from "@/lib/utils"

interface SummaryData {
  totalPortfolioValue: number
  totalCost: number
  totalPnl: number
  totalPnlPct: number
  stockCount: number
  thbRate: number
}

export function SummaryCards() {
  const { stocks, exchangeRate } = useStockStore()
  const rate = exchangeRate?.rate ?? 35.5

  const summary = stocks.reduce<SummaryData>(
    (acc, stock) => {
      const stats = calculateStockStats(stock.purchases, stock.currentPrice)
      return {
        totalPortfolioValue: acc.totalPortfolioValue + stats.currentValue,
        totalCost: acc.totalCost + stats.totalCost,
        totalPnl: acc.totalPnl + stats.pnl,
        totalPnlPct: 0, // computed after
        stockCount: acc.stockCount + 1,
        thbRate: rate,
      }
    },
    { totalPortfolioValue: 0, totalCost: 0, totalPnl: 0, totalPnlPct: 0, stockCount: 0, thbRate: rate }
  )

  const totalPnlPct = summary.totalCost > 0 ? (summary.totalPnl / summary.totalCost) * 100 : 0
  const isProfit = summary.totalPnl >= 0

  const cards = [
    {
      title: "มูลค่าพอร์ต",
      icon: DollarSign,
      value: `$${formatNumber(summary.totalPortfolioValue)}`,
      sub: `≈ ฿${formatNumber(summary.totalPortfolioValue * rate, 0)}`,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "ต้นทุนรวม",
      icon: Layers,
      value: `$${formatNumber(summary.totalCost)}`,
      sub: `≈ ฿${formatNumber(summary.totalCost * rate, 0)}`,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "กำไร / ขาดทุน",
      icon: isProfit ? TrendingUp : TrendingDown,
      value: `${isProfit ? "+" : ""}$${formatNumber(Math.abs(summary.totalPnl))}`,
      sub: `${isProfit ? "+" : "-"}฿${formatNumber(Math.abs(summary.totalPnl * rate), 0)}`,
      color: isProfit ? "text-green-500" : "text-red-500",
      bg: isProfit ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20",
      pct: `${isProfit ? "+" : ""}${formatNumber(totalPnlPct)}%`,
    },
    {
      title: "จำนวนหุ้น",
      icon: BarChart2,
      value: `${summary.stockCount} ตัว`,
      sub: `${stocks.reduce((a, s) => a + s.purchases.length, 0)} รายการซื้อ`,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn("rounded-md p-2", card.bg)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
              {card.pct && (
                <span
                  className={cn(
                    "text-sm font-semibold px-2 py-0.5 rounded-full",
                    isProfit
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {card.pct}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
