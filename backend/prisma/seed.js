import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const agentPassword = await bcrypt.hash('agent123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartseason.com' },
    update: {},
    create: {
      email: 'admin@smartseason.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN'
    }
  })

  const agent1 = await prisma.user.upsert({
    where: { email: 'john@smartseason.com' },
    update: {},
    create: {
      email: 'john@smartseason.com',
      password: agentPassword,
      name: 'John Kamau',
      role: 'AGENT'
    }
  })

  const agent2 = await prisma.user.upsert({
    where: { email: 'jane@smartseason.com' },
    update: {},
    create: {
      email: 'jane@smartseason.com',
      password: agentPassword,
      name: 'Jane Wanjiru',
      role: 'AGENT'
    }
  })

  const field1 = await prisma.field.upsert({
    where: { id: 'field-001' },
    update: {},
    create: {
      id: 'field-001',
      name: 'Kinangop',
      cropType: 'Maize',
      plantingDate: new Date('2026-02-01'),
      stage: 'GROWING',
      agentId: agent1.id
    }
  })

  const field2 = await prisma.field.upsert({
    where: { id: 'field-002' },
    update: {},
    create: {
      id: 'field-002',
      name: 'Ruiru',
      cropType: 'Wheat',
      plantingDate: new Date('2026-01-15'),
      stage: 'READY',
      agentId: agent1.id
    }
  })

  const field3 = await prisma.field.upsert({
    where: { id: 'field-003' },
    update: {},
    create: {
      id: 'field-003',
      name: 'Limuru',
      cropType: 'Beans',
      plantingDate: new Date('2026-03-01'),
      stage: 'PLANTED',
      agentId: agent2.id
    }
  })

  await prisma.fieldUpdate.createMany({
    data: [
      {
        note: 'Seeds germinated well, good coverage',
        stage: 'GROWING',
        fieldId: field1.id,
        agentId: agent1.id
      },
      {
        note: 'Crop looks healthy, ready for harvest soon',
        stage: 'READY',
        fieldId: field2.id,
        agentId: agent1.id
      },
      {
        note: 'Seeds planted, awaiting germination',
        stage: 'PLANTED',
        fieldId: field3.id,
        agentId: agent2.id
      }
    ]
  })

  console.log('Seeded successfully')
  console.log({ admin, agent1, agent2, field1, field2, field3 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    pool.end()
  })