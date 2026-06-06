"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { createPurchaseSchema, type CreatePurchaseInput } from "@/schemas/stock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useStockStore } from "@/store/stockStore"
import type { Purchase } from "@/types"
import { formatDateInput, formatNumber } from "@/lib/utils"

type Currency = "USD" | "THB"

interface EditPurchaseModalProps {
  stockId: string
  purchase: Purchase
  open: boolean
  onClose: () => void
}

export function EditPurchaseModal({ stockId, purchase, open, onClose }: EditPurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Default to USD since stored values are always in USD
  const [priceCurrency, setPriceCurrency] = useState<Currency>("USD")
  const [commCurrency, setCommCurrency] = useState<Currency>("USD")
  const [whtCurrency, setWhtCurrency] = useState<Currency>("USD")

  const { updateStock, stocks, exchangeRate } = useStockStore()
  const { toast } = useToast()
  const rate = exchangeRate?.rate ?? 35.5

  const toUSD = (value: number | undefined, currency: Currency) =>
    value == null ? undefined : currency === "THB" ? value / rate : value

  const preview = (value: number | undefined, currency: Currency): string | null => {
    if (!value) return null
    if (currency === "THB") return `≈ $${formatNumber(value / rate, 4)}`
    return `≈ ฿${formatNumber(value * rate, 2)}`
  }

  const form = useForm<CreatePurchaseInput>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: {
      date: formatDateInput(purchase.date),
      shares: purchase.shares,
      pricePerShare: purchase.pricePerShare,
      commission: purchase.commission,
      withholdingTax: purchase.withholdingTax ?? 0,
      note: purchase.note ?? "",
    },
  })

  async function onSubmit(data: CreatePurchaseInput) {
    const payload = {
      ...data,
      pricePerShare: toUSD(data.pricePerShare, priceCurrency) ?? data.pricePerShare,
      commission: toUSD(data.commission, commCurrency) ?? 0,
      withholdingTax: toUSD(data.withholdingTax, whtCurrency) ?? 0,
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/stocks/${stockId}/purchases/${purchase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        toast({ title: "Error", description: json.error, variant: "destructive" })
        return
      }

      const stock = stocks.find((s) => s.id === stockId)
      if (stock) {
        updateStock(stockId, {
          purchases: stock.purchases.map((p) => (p.id === purchase.id ? json : p)),
        })
      }

      toast({ title: "อัพเดทสำเร็จ" })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  async function onDelete() {
    if (!confirm("ต้องการลบรายการนี้?")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/stocks/${stockId}/purchases/${purchase.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        toast({ title: "Error", description: "ลบไม่สำเร็จ", variant: "destructive" })
        return
      }

      const stock = stocks.find((s) => s.id === stockId)
      if (stock) {
        updateStock(stockId, { purchases: stock.purchases.filter((p) => p.id !== purchase.id) })
      }

      toast({ title: "ลบรายการแล้ว" })
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const watchShares = form.watch("shares")
  const watchPrice = form.watch("pricePerShare")
  const watchComm = form.watch("commission") ?? 0
  const watchWHT = form.watch("withholdingTax") ?? 0

  const priceUSD = toUSD(watchPrice, priceCurrency) ?? 0
  const commUSD = toUSD(watchComm, commCurrency) ?? 0
  const whtUSD = toUSD(watchWHT, whtCurrency) ?? 0
  const totalCostUSD = (watchShares ?? 0) * priceUSD + commUSD + whtUSD

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขรายการซื้อ</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่ซื้อ</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shares + Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนหุ้น</FormLabel>
                    <FormControl>
                      <Input
                        type="number" step="0.000001"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ราคาต่อหุ้น</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                        currency={priceCurrency}
                        onCurrencyChange={setPriceCurrency}
                        step="0.0001"
                        preview={preview(field.value, priceCurrency)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Commission + WHT */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ค่าคอมมิชชั่น</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v ?? 0)}
                        currency={commCurrency}
                        onCurrencyChange={setCommCurrency}
                        preview={preview(field.value || undefined, commCurrency)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="withholdingTax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ภาษีหัก ณ ที่จ่าย</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        value={field.value ?? 0}
                        onChange={(v) => field.onChange(v ?? 0)}
                        currency={whtCurrency}
                        onCurrencyChange={setWhtCurrency}
                        preview={preview(field.value || undefined, whtCurrency)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost preview */}
            {totalCostUSD > 0 && (
              <div className="rounded-md bg-muted px-4 py-3 text-sm space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ต้นทุนครั้งนี้ (USD)</span>
                  <span className="font-semibold font-mono">${formatNumber(totalCostUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">≈ THB (rate {rate.toFixed(2)})</span>
                  <span className="font-mono text-muted-foreground">฿{formatNumber(totalCostUSD * rate, 0)}</span>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
                className="sm:mr-auto"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>ยกเลิก</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
