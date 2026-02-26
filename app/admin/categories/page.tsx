import { requireAdmin } from "@/lib/auth";
import CategoriesClient from "./ui";

export default async function CategoriesPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;
  return <CategoriesClient />;
}
