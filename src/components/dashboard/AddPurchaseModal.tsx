"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import {
  createPurchaseSchema,
  type CreatePurchaseInput,
} from "@/schemas/stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useStockStore } from "@/store/stockStore";
import { formatDateInput, formatNumber } from "@/lib/utils";

type Currency = "USD" | "THB";

interface AddPurchaseModalProps {
  stockId: string;
  stockSymbol: string;
}

export function AddPurchaseModal({
  stockId,
  stockSymbol,
}: AddPurchaseModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Currency selectors per field
  const [priceCurrency, setPriceCurrency] = useState<Currency>("USD");
  const [commCurrency, setCommCurrency] = useState<Currency>("USD");
  const [whtCurrency, setWhtCurrency] = useState<Currency>("USD");

  const { updateStock, stocks, exchangeRate } = useStockStore();
  const { toast } = useToast();
  const rate = exchangeRate?.rate ?? 35.5;

  const toUSD = (value: number | undefined, currency: Currency) =>
    value == null ? undefined : currency === "THB" ? value / rate : value;

  const preview = (
    value: number | undefined,
    currency: Currency,
  ): string | null => {
    if (!value) return null;
    if (currency === "THB") return `≈ $${formatNumber(value / rate, 4)}`;
    return `≈ ฿${formatNumber(value * rate, 2)}`;
  };

  const form = useForm<CreatePurchaseInput>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: {
      date: formatDateInput(new Date()),
      shares: undefined,
      pricePerShare: undefined,
      commission: 0,
      withholdingTax: 0,
      note: "",
    },
  });

  function resetForm() {
    form.reset({
      date: formatDateInput(new Date()),
      shares: undefined,
      pricePerShare: undefined,
      commission: 0,
      withholdingTax: 0,
      note: "",
    });
    setPriceCurrency("USD");
    setCommCurrency("USD");
    setWhtCurrency("USD");
  }

  async function onSubmit(data: CreatePurchaseInput) {
    // Convert all values to USD before saving
    const payload = {
      ...data,
      pricePerShare:
        toUSD(data.pricePerShare, priceCurrency) ?? data.pricePerShare,
      commission: toUSD(data.commission, commCurrency) ?? 0,
      withholdingTax: toUSD(data.withholdingTax, whtCurrency) ?? 0,
    };

    setIsLoading(true);
    try {
      const res = await fetch(`/api/stocks/${stockId}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: json.error,
          variant: "destructive",
        });
        return;
      }

      const stock = stocks.find((s) => s.id === stockId);
      if (stock) {
        updateStock(stockId, { purchases: [...stock.purchases, json] });
      }

      toast({
        title: "บันทึกการซื้อแล้ว",
        description: `เพิ่มรายการซื้อ ${stockSymbol} สำเร็จ`,
      });
      resetForm();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const watchShares = form.watch("shares");
  const watchPrice = form.watch("pricePerShare");
  const watchComm = form.watch("commission") ?? 0;
  const watchWHT = form.watch("withholdingTax") ?? 0;

  // Total cost always displayed in USD
  const priceUSD = toUSD(watchPrice, priceCurrency) ?? 0;
  const commUSD = toUSD(watchComm, commCurrency) ?? 0;
  const whtUSD = toUSD(watchWHT, whtCurrency) ?? 0;
  const totalCostUSD = (watchShares ?? 0) * priceUSD + commUSD + whtUSD;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          เพิ่มรายการซื้อ
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>บันทึกการซื้อ {stockSymbol}</DialogTitle>
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
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shares + Price per share */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shares"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนหุ้น</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          )
                        }
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
                        onChange={field.onChange}
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

            {/* Commission + Withholding Tax */}
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
                        preview={preview(
                          field.value || undefined,
                          commCurrency,
                        )}
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
                  <FormLabel>หมายเหตุ (ไม่บังคับ)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="เช่น ซื้อเพิ่มตอนราคาลง"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost preview */}
            {totalCostUSD > 0 && (
              <div className="rounded-md bg-muted px-4 py-3 text-sm space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ต้นทุนครั้งนี้ (USD)
                  </span>
                  <span className="font-semibold font-mono">
                    ${formatNumber(totalCostUSD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ≈ THB (rate {rate.toFixed(2)})
                  </span>
                  <span className="font-mono text-muted-foreground">
                    ฿{formatNumber(totalCostUSD * rate, 0)}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                }}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
