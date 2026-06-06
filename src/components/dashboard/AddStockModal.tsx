"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Loader2 } from "lucide-react"
import { createStockSchema, type CreateStockInput } from "@/schemas/stock"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useStockStore } from "@/store/stockStore"

export function AddStockModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addStock } = useStockStore()
  const { toast } = useToast()

  const form = useForm<CreateStockInput>({
    resolver: zodResolver(createStockSchema),
    defaultValues: { symbol: "", name: "", currency: "USD", currentPrice: undefined },
  })

  async function onSubmit(data: CreateStockInput) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/stocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) {
        toast({ title: "Error", description: json.error, variant: "destructive" })
        return
      }

      addStock(json)
      toast({ title: "เพิ่มหุ้นสำเร็จ", description: `เพิ่ม ${json.symbol} เข้าพอร์ตแล้ว` })
      form.reset()
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มหุ้น
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มหุ้นใหม่</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticker Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="NVDA"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>สกุลเงิน</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD (ดอลลาร์)</SelectItem>
                        <SelectItem value="THB">THB (บาท)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อบริษัท</FormLabel>
                  <FormControl>
                    <Input placeholder="NVIDIA Corporation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาปัจจุบัน (ไม่บังคับ)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="205.10"
                      type="number"
                      step="0.0001"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เพิ่มหุ้น
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
