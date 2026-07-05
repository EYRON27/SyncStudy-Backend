import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  // 1. Get a user
  const user = await prisma.user.findFirst()
  if (!user) return console.log("No user found")

  // 2. Create room
  const room = await prisma.room.create({
    data: {
      name: "Test Delete Room",
      code: "TEST12",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "owner"
        }
      }
    }
  })

  // 3. Create note in room
  const note = await prisma.note.create({
    data: {
      title: "Test Note",
      content: "This is a test note",
      roomId: room.id,
      authorId: user.id
    }
  })

  console.log("Created room", room.id, "and note", note.id)

  // 4. Simulate deleteRoom
  const notesToCopy = await prisma.note.findMany({
    where: { roomId: room.id },
    include: { attachments: true }
  })
  
  console.log("Notes to copy:", notesToCopy.length)

  // 5. Delete room via service logic (simulate)
  const axios = require('axios')
  // We can't easily call service directly without mock req/res, let's just do it directly here
  for (const n of notesToCopy) {
    await prisma.note.create({
      data: {
        title: `${n.title || 'Untitled'} (from ${room.name})`,
        content: n.content,
        authorId: user.id,
        roomId: null, // This puts it in Personal Notes
      }
    })
  }
  await prisma.note.deleteMany({ where: { roomId: room.id } })
  await prisma.room.delete({ where: { id: room.id } })

  // 6. Check personal notes
  const personalNotes = await prisma.note.findMany({
    where: { roomId: null, authorId: user.id }
  })
  
  console.log("Personal notes after delete:", personalNotes.map(n => n.title))
}

test().catch(console.error).finally(() => prisma.$disconnect())
