import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateStockSchema } from "@/schemas/stock"

async function getStock(id: string, userId: string) {
  return prisma.stock.findFirst({ where: { id, userId }, include: { purchases: { orderBy: { date: "asc" } } } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stock = await getStock(params.id, session.user.id)
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(stock)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stock = await getStock(params.id, session.user.id)
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateStockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const updated = await prisma.stock.update({
    where: { id: params.id },
    data: parsed.data,
    include: { purchases: { orderBy: { date: "asc" } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stock = await getStock(params.id, session.user.id)
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.stock.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
