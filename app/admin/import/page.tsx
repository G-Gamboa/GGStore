import { requireAdmin } from "@/lib/auth";
import ImportClient from "./ui";

export default async function ImportPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;
  return <ImportClient />;
}
