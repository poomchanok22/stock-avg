import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean up
  await prisma.purchase.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 12)
  const user = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  })
  console.log(`✅ Created user: ${user.email}`)

  // Create NVDA stock
  const nvda = await prisma.stock.create({
    data: {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      currency: "USD",
      currentPrice: 205.10,
      userId: user.id,
      purchases: {
        create: [
          {
            date: new Date("2024-01-15"),
            shares: 0.5,
            pricePerShare: 210.0,
            commission: 0,
            note: "Initial buy",
          },
          {
            date: new Date("2024-02-20"),
            shares: 0.5,
            pricePerShare: 220.0,
            commission: 0,
            note: "Added on dip",
          },
          {
            date: new Date("2024-03-10"),
            shares: 0.4644959,
            pricePerShare: 195.5,
            commission: 0,
            note: "Averaged down",
          },
        ],
      },
    },
  })
  console.log(`✅ Created stock: ${nvda.symbol} with 3 purchases`)

  // Create AAPL stock
  const aapl = await prisma.stock.create({
    data: {
      symbol: "AAPL",
      name: "Apple Inc.",
      currency: "USD",
      currentPrice: 189.5,
      userId: user.id,
      purchases: {
        create: [
          {
            date: new Date("2024-01-05"),
            shares: 2,
            pricePerShare: 185.0,
            commission: 1.5,
            note: "Long-term hold",
          },
          {
            date: new Date("2024-03-01"),
            shares: 1,
            pricePerShare: 178.0,
            commission: 0,
          },
        ],
      },
    },
  })
  console.log(`✅ Created stock: ${aapl.symbol} with 2 purchases`)

  // Create TSLA stock
  const tsla = await prisma.stock.create({
    data: {
      symbol: "TSLA",
      name: "Tesla Inc.",
      currency: "USD",
      currentPrice: 175.0,
      userId: user.id,
      purchases: {
        create: [
          {
            date: new Date("2024-02-01"),
            shares: 1,
            pricePerShare: 200.0,
            commission: 0,
            note: "Speculative",
          },
        ],
      },
    },
  })
  console.log(`✅ Created stock: ${tsla.symbol} with 1 purchase`)

  console.log("\n🎉 Seed complete!")
  console.log("📧 Login: demo@example.com")
  console.log("🔑 Password: demo1234")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
