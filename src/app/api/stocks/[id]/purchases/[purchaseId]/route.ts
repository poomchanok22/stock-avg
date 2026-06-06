import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updatePurchaseSchema } from "@/schemas/stock"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; purchaseId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const purchase = await prisma.purchase.findFirst({
    where: { id: params.purchaseId, stockId: params.id, stock: { userId: session.user.id } },
  })
  if (!purchase) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updatePurchaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const updated = await prisma.purchase.update({
    where: { id: params.purchaseId },
    data: {
      ...parsed.data,
      ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; purchaseId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const purchase = await prisma.purchase.findFirst({
    where: { id: params.purchaseId, stockId: params.id, stock: { userId: session.user.id } },
  })
  if (!purchase) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.purchase.delete({ where: { id: params.purchaseId } })

  return NextResponse.json({ success: true })
}
