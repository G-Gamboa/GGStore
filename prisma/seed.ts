import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

async function main() {
  // settings singleton
  const s = await prisma.settings.findFirst();
  if (!s) await prisma.settings.create({ data: { showSoldPublic: false, trackStock: false } });

  // admin user
  const email = (process.env.ADMIN_SEED_EMAIL ?? "admin@ggstore.local").toLowerCase().trim();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, passwordHash } });
  }

  // sample category + product
  const cat = await prisma.category.upsert({
    where: { slug: "licras" },
    update: { name: "Licras" },
    create: { name: "Licras", slug: "licras" },
  });

  await prisma.product.upsert({
    where: { slug: "licra-sample-azul" },
    update: {},
    create: {
      externalId: 22,
      name: "Licra sample azul",
      slug: "licra-sample-azul",
      priceQ: 80,
      brand: "RBX",
      size: "L",
      color: "Azul",
      condition: 10,
      gender: "Mujer",
      status: "AVAILABLE",
      isActive: true,
      categoryId: cat.id,
      imageUrl: null,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
