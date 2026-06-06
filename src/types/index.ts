import type { Stock, Purchase } from "@prisma/client"
import type { StockStats } from "@/lib/calculations"

export type { Stock, Purchase }

export interface StockWithPurchases extends Stock {
  purchases: Purchase[]
}

export interface StockWithStats extends StockWithPurchases {
  stats: StockStats
}

// Extend NextAuth session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
