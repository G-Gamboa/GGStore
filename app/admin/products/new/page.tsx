import { requireAdmin } from "@/lib/auth";
import ProductFormClient from "../product-form";

export default async function NewProductPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;

  return <ProductFormClient mode="create" />;
}