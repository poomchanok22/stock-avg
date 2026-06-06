import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createStockSchema } from "@/schemas/stock"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stocks = await prisma.stock.findMany({
    where: { userId: session.user.id },
    include: { purchases: { orderBy: { date: "asc" } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(stocks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createStockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = await prisma.stock.findFirst({
    where: { symbol: parsed.data.symbol, userId: session.user.id },
  })
  if (existing) {
    return NextResponse.json({ error: "Stock already exists in your portfolio" }, { status: 409 })
  }

  const stock = await prisma.stock.create({
    data: { ...parsed.data, userId: session.user.id },
    include: { purchases: true },
  })

  return NextResponse.json(stock, { status: 201 })
}
