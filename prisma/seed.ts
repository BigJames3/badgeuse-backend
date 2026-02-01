import 'dotenv/config'
import { randomBytes, scryptSync } from 'node:crypto'
import { PrismaClient, Role } from './generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is required for seeding')
}

const adapter = new PrismaPg({
  connectionString,
  ssl: false,
})

const prisma = new PrismaClient({ adapter })

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'

  const tenants: Array<{
    code: string
    name: string
    users: Array<{ email: string; name: string; role: Role; password: string }>
  }> = [
    {
      code: process.env.SEED_COMPANY_CODE ?? 'DEFAULT',
      name: process.env.SEED_COMPANY_NAME ?? 'Default Company',
      users: [
        {
          email: adminEmail,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          password: adminPassword,
        },
        {
          email: process.env.SEED_RH_EMAIL ?? 'rh@default.com',
          name: 'RH Manager',
          role: 'RH',
          password: process.env.SEED_RH_PASSWORD ?? 'ChangeMe123!',
        },
        {
          email: process.env.SEED_MANAGER_EMAIL ?? 'manager@default.com',
          name: 'Manager',
          role: 'MANAGER',
          password: process.env.SEED_MANAGER_PASSWORD ?? 'ChangeMe123!',
        },
        {
          email: process.env.SEED_EMPLOYEE_EMAIL ?? 'employee@default.com',
          name: 'Employee',
          role: 'EMPLOYEE',
          password: process.env.SEED_EMPLOYEE_PASSWORD ?? 'ChangeMe123!',
        },
      ],
    },
    {
      code: process.env.SEED_COMPANY_CODE_2 ?? 'SECOND',
      name: process.env.SEED_COMPANY_NAME_2 ?? 'Second Company',
      users: [
        {
          email: process.env.SEED_RH_EMAIL_2 ?? 'rh@second.com',
          name: 'RH Second',
          role: 'RH',
          password: process.env.SEED_RH_PASSWORD_2 ?? 'ChangeMe123!',
        },
        {
          email: process.env.SEED_MANAGER_EMAIL_2 ?? 'manager@second.com',
          name: 'Manager Second',
          role: 'MANAGER',
          password: process.env.SEED_MANAGER_PASSWORD_2 ?? 'ChangeMe123!',
        },
        {
          email: process.env.SEED_EMPLOYEE_EMAIL_2 ?? 'employee@second.com',
          name: 'Employee Second',
          role: 'EMPLOYEE',
          password: process.env.SEED_EMPLOYEE_PASSWORD_2 ?? 'ChangeMe123!',
        },
      ],
    },
  ]

  for (const tenant of tenants) {
    const company = await prisma.company.upsert({
      where: { code: tenant.code },
      update: { name: tenant.name },
      create: { code: tenant.code, name: tenant.name },
    })

    for (const u of tenant.users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          roles: [u.role],
          companyId: company.id,
        },
        create: {
          email: u.email,
          name: u.name,
          passwordHash: hashPassword(u.password),
          roles: [u.role],
          companyId: company.id,
        },
      })
    }
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
