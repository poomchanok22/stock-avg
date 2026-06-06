import { z } from "zod"

export const createStockSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol too long")
    .toUpperCase(),
  name: z.string().min(1, "Company name is required"),
  currency: z.enum(["USD", "THB"]).default("USD"),
  currentPrice: z.coerce
    .number()
    .positive("Price must be positive")
    .optional()
    .nullable(),
})

export const updateStockSchema = createStockSchema.partial()

export const createPurchaseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  shares: z.coerce
    .number()
    .positive("Shares must be positive")
    .min(0.000001, "Minimum 0.000001 shares"),
  pricePerShare: z.coerce.number().positive("Price must be positive"),
  commission: z.coerce.number().min(0, "Commission cannot be negative").default(0),
  withholdingTax: z.coerce.number().min(0, "Withholding tax cannot be negative").default(0),
  note: z.string().optional().nullable(),
})

export const updatePurchaseSchema = createPurchaseSchema.partial()

export type CreateStockInput = z.infer<typeof createStockSchema>
export type UpdateStockInput = z.infer<typeof updateStockSchema>
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>
