import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import SettingsForm from "./ui";

export default async function SettingsPage() {
  const user = await requireAdmin();
  if (!user) return <div>Unauthorized. Ve a /admin/login</div>;

  const s = await prisma.settings.findFirst();
  const settings = s ?? await prisma.settings.create({ data: {} });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
