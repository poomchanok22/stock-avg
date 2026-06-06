"use client"

import { useEffect } from "react"
import { Header } from "@/components/dashboard/Header"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { StockList } from "@/components/dashboard/StockList"
import { StockDetail } from "@/components/dashboard/StockDetail"
import { AddStockModal } from "@/components/dashboard/AddStockModal"
import { useStockStore } from "@/store/stockStore"
import { Loader2 } from "lucide-react"

export function DashboardClient() {
  const { fetchStocks, fetchExchangeRate, refreshLivePrices, isLoading, selectedStockId } = useStockStore()

  useEffect(() => {
    fetchStocks()
    fetchExchangeRate()
  }, [fetchStocks, fetchExchangeRate])

  // Keep current prices "running with the market": poll live quotes
  // for every symbol in the portfolio on a steady interval.
  useEffect(() => {
    const LIVE_PRICE_INTERVAL = 20_000 // 20s — matches the price API's cache TTL
    refreshLivePrices()
    const id = setInterval(() => {
      refreshLivePrices()
    }, LIVE_PRICE_INTERVAL)
    return () => clearInterval(id)
  }, [refreshLivePrices])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-6 space-y-6">
        <SummaryCards />

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left: Stock List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">พอร์ตหุ้น</h2>
              <AddStockModal />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <StockList />
            )}
          </div>

          {/* Right: Stock Detail */}
          <div>
            <StockDetail />
          </div>
        </div>
      </main>
    </div>
  )
}
