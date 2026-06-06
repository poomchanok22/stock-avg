"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Currency = "USD" | "THB"

interface CurrencyInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  currency: Currency
  onCurrencyChange: (c: Currency) => void
  placeholder?: string
  step?: string
  className?: string
  /** Show converted preview e.g. "≈ $5.20" */
  preview?: string | null
}

export function CurrencyInput({
  value,
  onChange,
  currency,
  onCurrencyChange,
  placeholder = "0",
  step = "0.01",
  className,
  preview,
}: CurrencyInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex rounded-md shadow-sm">
        {/* Currency toggle */}
        <div className="flex shrink-0 overflow-hidden rounded-l-md border border-r-0 border-input bg-muted">
          {(["USD", "THB"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCurrencyChange(c)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                currency === c
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/80"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Number input */}
        <Input
          type="number"
          step={step}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className={cn("rounded-l-none border-l-0 focus-visible:ring-offset-0", className)}
        />
      </div>
      {preview && (
        <p className="text-xs text-muted-foreground pl-1">{preview}</p>
      )}
    </div>
  )
}
