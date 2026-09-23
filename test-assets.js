const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function run() {
  const assets = await prisma.documentAsset.findMany()
  console.log(assets)
}
run().catch(console.error).finally(() => prisma.$disconnect())
