"use client"

import { signOut, useSession } from "next-auth/react"
import { TrendingUp, LogOut, User, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStockStore } from "@/store/stockStore"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const { data: session } = useSession()
  const { exchangeRate, fetchExchangeRate } = useStockStore()
  const initials = session?.user?.name?.slice(0, 2).toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Stock AVG</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {exchangeRate && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs font-mono">
                USD/THB {exchangeRate.rate.toFixed(2)}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={fetchExchangeRate}
                title="Refresh exchange rate"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
