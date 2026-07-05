// test2.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const notes = await prisma.note.findMany({
    where: { roomId: null },
    include: { author: true }
  })
  console.log('Personal Notes:', notes.map(n => ({ id: n.id, title: n.title, author: n.author.name })))
}

main().catch(console.error).finally(() => prisma.$disconnect())
