import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPurchaseSchema } from "@/schemas/stock"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const stock = await prisma.stock.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!stock) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = createPurchaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const purchase = await prisma.purchase.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      commission: parsed.data.commission ?? 0,
      stockId: params.id,
    },
  })

  return NextResponse.json(purchase, { status: 201 })
}
