import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = process.env.ADMIN_SEED_EMAIL ?? "admin@ggstore.local";
const PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: EMAIL.toLowerCase().trim() },
    update: { passwordHash: hash },
    create: { email: EMAIL.toLowerCase().trim(), passwordHash: hash },
  });

  console.log(`Usuario listo: ${user.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
