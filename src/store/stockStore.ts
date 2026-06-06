import { create } from "zustand"
import type { StockWithPurchases } from "@/types"

interface ExchangeRate {
  rate: number
  updatedAt: string
}

interface StockStore {
  stocks: StockWithPurchases[]
  selectedStockId: string | null
  exchangeRate: ExchangeRate | null
  isLoading: boolean
  error: string | null

  // Actions
  setStocks: (stocks: StockWithPurchases[]) => void
  addStock: (stock: StockWithPurchases) => void
  updateStock: (id: string, stock: Partial<StockWithPurchases>) => void
  removeStock: (id: string) => void
  selectStock: (id: string | null) => void
  setExchangeRate: (rate: ExchangeRate) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Fetch actions
  fetchStocks: () => Promise<void>
  fetchExchangeRate: () => Promise<void>
}

export const useStockStore = create<StockStore>((set, get) => ({
  stocks: [],
  selectedStockId: null,
  exchangeRate: null,
  isLoading: false,
  error: null,

  setStocks: (stocks) => set({ stocks }),
  addStock: (stock) => set((s) => ({ stocks: [...s.stocks, stock] })),
  updateStock: (id, updated) =>
    set((s) => ({
      stocks: s.stocks.map((stock) =>
        stock.id === id ? { ...stock, ...updated } : stock
      ),
    })),
  removeStock: (id) =>
    set((s) => ({
      stocks: s.stocks.filter((stock) => stock.id !== id),
      selectedStockId: s.selectedStockId === id ? null : s.selectedStockId,
    })),
  selectStock: (id) => set({ selectedStockId: id }),
  setExchangeRate: (rate) => set({ exchangeRate: rate }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchStocks: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch("/api/stocks")
      if (!res.ok) throw new Error("Failed to fetch stocks")
      const data = await res.json()
      set({ stocks: data, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  fetchExchangeRate: async () => {
    try {
      const res = await fetch("/api/exchange-rate")
      if (!res.ok) return
      const data = await res.json()
      set({ exchangeRate: { rate: data.rate, updatedAt: data.updatedAt } })
    } catch {
      // Silently fail — fallback rate used in calculations
    }
  },
}))
