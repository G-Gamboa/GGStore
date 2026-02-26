import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} href={`/c/${c.slug}`}>
            <Card>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-neutral-600">Ver productos</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
