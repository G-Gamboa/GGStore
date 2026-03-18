import { prisma } from "@/lib/prisma";

export async function getProductByExternalId(externalId: number) {
  return prisma.product.findFirst({
    where: { externalId },
    include: { category: true },
  });
}

export async function updateProductStatusByExternalId(
  externalId: number,
  status: "AVAILABLE" | "RESERVED" | "SOLD"
) {
  return prisma.product.update({
    where: { externalId },
    data: {
      status,
      soldAt: status === "SOLD" ? new Date() : null,
    },
    include: { category: true },
  });
}

export function formatProductText(product: any) {
  return [
    `ID: ${product.externalId ?? "-"}`,
    `Nombre: ${product.name}`,
    `Precio: Q${product.priceQ}`,
    `Categoría: ${product.category?.name ?? "-"}`,
    `Marca: ${product.brand ?? "-"}`,
    `Talla: ${product.size ?? "-"}`,
    `Color: ${product.color ?? "-"}`,
    `Género: ${product.gender ?? "-"}`,
    `Estado: ${product.status}`,
  ].join("\n");
}