import 'dotenv/config'
import { PrismaClient, Role } from './generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is required for backfill')
}

const adapter = new PrismaPg({
  connectionString,
  ssl: false,
})

const prisma = new PrismaClient({ adapter })

type PersonName = { firstName: string; lastName: string }

function splitName(fullName: string | null, email: string): PersonName {
  const safeName = (fullName ?? '').trim()
  if (safeName) {
    const parts = safeName.split(/\s+/)
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ') || 'Unknown'
    return { firstName, lastName }
  }
  const prefix = email.split('@')[0] || 'User'
  return { firstName: prefix, lastName: 'Unknown' }
}

function splitWorkerName(name: string | null): PersonName {
  const safeName = (name ?? '').trim()
  if (!safeName) return { firstName: 'Worker', lastName: 'Unknown' }
  const parts = safeName.split(/\s+/)
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || 'Unknown'
  return { firstName, lastName }
}

function shouldCreateEmployee(roles: Role[]): boolean {
  const staffRoles: Role[] = [
    'EMPLOYEE',
    'RH',
    'MANAGER',
    'ADMIN',
    'SUPER_ADMIN',
    'TEACHER',
    'SITE_MANAGER',
  ]
  return roles.some((role) => staffRoles.includes(role))
}

async function ensurePersonForUser(user: {
  id: string
  email: string
  name: string | null
  companyId: string
  personId: string | null
}) {
  if (user.personId) {
    const existing = await prisma.person.findUnique({
      where: { id: user.personId },
      select: { id: true },
    })
    if (existing) return user.personId
  }

  const { firstName, lastName } = splitName(user.name, user.email)
  const person = await prisma.person.create({
    data: {
      companyId: user.companyId,
      firstName,
      lastName,
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { personId: person.id },
  })

  return person.id
}

async function ensurePersonForStudent(student: {
  id: string
  firstName: string
  lastName: string
  companyId: string
  personId: string | null
}) {
  if (student.personId) return
  const person = await prisma.person.create({
    data: {
      companyId: student.companyId,
      firstName: student.firstName,
      lastName: student.lastName,
    },
  })
  await prisma.student.update({
    where: { id: student.id },
    data: { personId: person.id },
  })
}

async function ensurePersonForConstructionWorker(worker: {
  id: string
  name: string
  companyId: string
  personId: string | null
}) {
  if (worker.personId) return
  const { firstName, lastName } = splitWorkerName(worker.name)
  const person = await prisma.person.create({
    data: {
      companyId: worker.companyId,
      firstName,
      lastName,
    },
  })
  await prisma.constructionWorker.update({
    where: { id: worker.id },
    data: { personId: person.id },
  })
}

async function main() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      roles: true,
      companyId: true,
      personId: true,
    },
  })

  for (const user of users) {
    const personId = await ensurePersonForUser(user)

    const uniqueRoles = Array.from(new Set(user.roles))
    for (const role of uniqueRoles) {
      await prisma.userRole.upsert({
        where: { userId_role: { userId: user.id, role } },
        update: { deletedAt: null },
        create: {
          companyId: user.companyId,
          userId: user.id,
          role,
        },
      })
    }

    if (shouldCreateEmployee(user.roles)) {
      const existingEmployee = await prisma.employee.findFirst({
        where: { userId: user.id, deletedAt: null },
        select: { id: true },
      })
      if (!existingEmployee) {
        await prisma.employee.create({
          data: {
            companyId: user.companyId,
            userId: user.id,
            personId,
          },
        })
      }
    }
  }

  const students = await prisma.student.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyId: true,
      personId: true,
    },
  })
  for (const student of students) {
    await ensurePersonForStudent(student)
  }

  const workers = await prisma.constructionWorker.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      companyId: true,
      personId: true,
    },
  })
  for (const worker of workers) {
    await ensurePersonForConstructionWorker(worker)
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
