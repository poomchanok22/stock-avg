"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RunningAvgPoint } from "@/lib/calculations";
import { formatNumber } from "@/lib/utils";

interface AVGChartProps {
  data: RunningAvgPoint[];
  currentPrice?: number | null;
  symbol: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="font-mono">${formatNumber(p.value, 4)}</span>
        </p>
      ))}
    </div>
  );
};

export function AVGChart({ data, currentPrice, symbol }: AVGChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            ต้นทุนเฉลี่ยสะสม ({symbol})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูลการซื้อ
        </CardContent>
      </Card>
    );
  }

  // Add current price as final point if available
  const chartData =
    currentPrice && data.length > 0
      ? [...data, { ...data[data.length - 1], date: "ปัจจุบัน", currentPrice }]
      : data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ต้นทุนเฉลี่ยสะสม ({symbol})</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />

            <Line
              type="linear"
              dataKey="avgCost"
              name="ต้นทุนเฉลี่ย"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#6366f1" }}
              activeDot={{ r: 6 }}
            />

            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="#22c55e"
                strokeDasharray="6 3"
                strokeWidth={2}
                label={{
                  value: `ราคาปัจจุบัน $${currentPrice}`,
                  position: "insideBottomRight",
                  fontSize: 11,
                  fill: "#22c55e",
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
