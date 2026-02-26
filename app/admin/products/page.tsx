import { requireAdmin } from "@/lib/auth";
import ProductsClient from "./ui";

export default async function ProductsPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;
  return <ProductsClient />;
}
