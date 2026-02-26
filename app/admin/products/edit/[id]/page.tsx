import { requireAdmin } from "@/lib/auth";
import ProductFormClient from "../../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;

  const { id } = await params;
  return <ProductFormClient mode="edit" id={id} />;
}