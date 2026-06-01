import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin@123';

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hash, failedLoginAttempts: 0, lockedAt: null, deletedAt: null },
    create: { email: ADMIN_EMAIL, password: hash },
  });

  console.log('Admin seeded:', { id: user.id, email: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
