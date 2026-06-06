import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/schemas/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashedPassword },
      select: { id: true, email: true, name: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (e) {
    console.error("[REGISTER]", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
