"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AVGChart } from "@/components/dashboard/AVGChart";
import { AddPurchaseModal } from "@/components/dashboard/AddPurchaseModal";
import { EditPurchaseModal } from "@/components/dashboard/EditPurchaseModal";
import { useStockStore } from "@/store/stockStore";
import { calculateStockStats } from "@/lib/calculations";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import type { Purchase } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export function StockDetail() {
  const { stocks, selectedStockId, updateStock, removeStock, exchangeRate } =
    useStockStore();
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const { toast } = useToast();

  const rate = exchangeRate?.rate ?? 35.5;
  const stock = stocks.find((s) => s.id === selectedStockId);

  if (!stock) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>เลือกหุ้นเพื่อดูรายละเอียด</p>
        </div>
      </Card>
    );
  }

  const stats = calculateStockStats(stock.purchases, stock.currentPrice);
  const isProfit = stats.pnl >= 0;

  async function saveCurrentPrice() {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0 || !stock) return;

    setIsSavingPrice(true);
    try {
      const res = await fetch(`/api/stocks/${stock.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPrice: price }),
      });
      if (res.ok) {
        updateStock(stock.id, { currentPrice: price });
        toast({ title: "อัพเดทราคาแล้ว" });
        setEditingPrice(false);
      }
    } finally {
      setIsSavingPrice(false);
    }
  }

  async function deleteStock() {
    if (!stock) return;
    if (!confirm(`ต้องการลบ ${stock.symbol} ออกจากพอร์ต?`)) return;
    const res = await fetch(`/api/stocks/${stock.id}`, { method: "DELETE" });
    if (res.ok) {
      removeStock(stock.id);
      toast({ title: `ลบ ${stock.symbol} แล้ว` });
    }
  }

  return (
    <div className="space-y-4">
      {/* Stock Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold">{stock.symbol}</h2>
                <Badge variant="outline">{stock.currency}</Badge>
              </div>
              <p className="text-muted-foreground">{stock.name}</p>
            </div>

            <div className="flex gap-2">
              <AddPurchaseModal stockId={stock.id} stockSymbol={stock.symbol} />
              <Button variant="outline" size="sm" onClick={deleteStock}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Current price editor */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                ราคาปัจจุบัน:
              </span>
              {editingPrice ? (
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 w-28 text-sm font-mono"
                    type="number"
                    step="0.0001"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveCurrentPrice()}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={saveCurrentPrice}
                    disabled={isSavingPrice}
                  >
                    บันทึก
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => setEditingPrice(false)}
                  >
                    ยกเลิก
                  </Button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-1 text-lg font-bold hover:text-primary transition-colors"
                  onClick={() => {
                    setEditingPrice(true);
                    setPriceInput(String(stock.currentPrice ?? ""));
                  }}
                >
                  {stock.currentPrice ? `$${stock.currentPrice}` : "—"}
                  <Edit3 className="h-3.5 w-3.5 opacity-50" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            label: "จำนวนหุ้นรวม",
            value: formatNumber(stats.totalShares, 6),
            sub: null,
          },
          {
            label: "ต้นทุนรวม",
            value: `$${formatNumber(stats.totalCost)}`,
            sub: `฿${formatNumber(stats.totalCost * rate, 0)}`,
          },
          {
            label: "ต้นทุนเฉลี่ย/หุ้น",
            value: `$${formatNumber(stats.avgCostPerShare, 4)}`,
            sub: `฿${formatNumber(stats.avgCostPerShare * rate, 2)}`,
          },
          {
            label: "มูลค่าปัจจุบัน",
            value: stock.currentPrice
              ? `$${formatNumber(stats.currentValue)}`
              : "—",
            sub: stock.currentPrice
              ? `฿${formatNumber(stats.currentValue * rate, 0)}`
              : null,
          },
          {
            label: "กำไร / ขาดทุน",
            value: stock.currentPrice
              ? `${isProfit ? "+" : ""}$${formatNumber(Math.abs(stats.pnl))}`
              : "—",
            sub: stock.currentPrice
              ? `${isProfit ? "+" : "-"}฿${formatNumber(Math.abs(stats.pnl) * rate, 0)}`
              : null,
            highlight: stock.currentPrice
              ? isProfit
                ? "profit"
                : "loss"
              : null,
          },
          {
            label: "% กำไร / ขาดทุน",
            value: stock.currentPrice
              ? `${isProfit ? "+" : ""}${formatNumber(stats.pnlPercent)}%`
              : "—",
            sub: null,
            highlight: stock.currentPrice
              ? isProfit
                ? "profit"
                : "loss"
              : null,
          },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p
                className={cn(
                  "text-xl font-bold mt-0.5",
                  item.highlight === "profit" && "text-green-500",
                  item.highlight === "loss" && "text-red-500",
                )}
              >
                {item.value}
              </p>
              {item.sub && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <AVGChart
        data={stats.runningAvg}
        currentPrice={stock.currentPrice}
        symbol={stock.symbol}
      />

      {/* Purchase Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            รายการซื้อทั้งหมด ({stock.purchases.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stock.purchases.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              ยังไม่มีรายการซื้อ กด &ldquo;เพิ่มรายการซื้อ&rdquo; เพื่อเริ่มต้น
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="text-right">จำนวนหุ้น</TableHead>
                  <TableHead className="text-right">ราคา/หุ้น</TableHead>
                  <TableHead className="text-right">ค่าคอม</TableHead>
                  <TableHead className="text-right">ภาษีหัก ณ จ่าย</TableHead>
                  <TableHead className="text-right">รวม</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...stock.purchases]
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {formatDate(p.date)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatNumber(p.shares, 6)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${formatNumber(p.pricePerShare, 4)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {p.commission > 0
                          ? `$${formatNumber(p.commission)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {(p.withholdingTax ?? 0) > 0
                          ? `$${formatNumber(p.withholdingTax ?? 0)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        $
                        {formatNumber(
                          p.shares * p.pricePerShare +
                            p.commission +
                            (p.withholdingTax ?? 0),
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingPurchase(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingPurchase && (
        <EditPurchaseModal
          stockId={stock.id}
          purchase={editingPurchase}
          open={!!editingPurchase}
          onClose={() => setEditingPurchase(null)}
        />
      )}
    </div>
  );
}
