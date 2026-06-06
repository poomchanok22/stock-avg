"use client"

import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStockStore } from "@/store/stockStore"
import { calculateStockStats } from "@/lib/calculations"
import { formatNumber, cn } from "@/lib/utils"

export function StockList() {
  const { stocks, selectedStockId, selectStock } = useStockStore()

  if (stocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
        ยังไม่มีหุ้นในพอร์ต<br />กด &ldquo;เพิ่มหุ้น&rdquo; เพื่อเริ่มต้น
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {stocks.map((stock) => {
        const stats = calculateStockStats(stock.purchases, stock.currentPrice)
        const isProfit = stats.pnl >= 0
        const isSelected = selectedStockId === stock.id
        const hasPnl = stock.currentPrice != null && stock.purchases.length > 0

        return (
          <button
            key={stock.id}
            onClick={() => selectStock(isSelected ? null : stock.id)}
            className={cn(
              "w-full text-left transition-all",
              isSelected && "ring-2 ring-primary ring-offset-1 rounded-lg"
            )}
          >
            <Card
              className={cn(
                "hover:bg-muted/50 transition-colors cursor-pointer",
                isSelected && "bg-muted/50"
              )}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        hasPnl
                          ? isProfit
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {stock.symbol.slice(0, 4)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold truncate">{stock.symbol}</span>
                        <Badge variant="outline" className="text-xs h-4 px-1">
                          {stock.currency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {stock.purchases.length > 0 ? (
                      <>
                        <p className="text-sm font-mono font-medium">
                          avg ${formatNumber(stats.avgCostPerShare, 2)}
                        </p>
                        {hasPnl ? (
                          <div
                            className={cn(
                              "flex items-center justify-end gap-0.5 text-xs font-medium",
                              isProfit ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {isProfit ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {isProfit ? "+" : ""}
                            {formatNumber(stats.pnlPercent)}%
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">ยังไม่มีราคาตลาด</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">ยังไม่มีรายการซื้อ</p>
                    )}
                  </div>

                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isSelected && "rotate-90"
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
