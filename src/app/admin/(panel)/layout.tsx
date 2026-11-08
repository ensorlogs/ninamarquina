import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <AdminNav email={user.email ?? ""} />
      <main className="px-5 py-8 md:px-12 md:py-12">{children}</main>
    </div>
  );
}
