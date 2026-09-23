import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function run() {
  const t = await prisma.invoiceTemplate.findFirst()
  console.log(t?.htmlContent.split("</style>")[1].substring(0, 1000))
}
run().catch(console.error).finally(() => prisma.$disconnect())
