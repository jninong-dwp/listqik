import { AdminTestEmailForm } from "@/components/admin/admin-test-email-form";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Settings</h2>
        <p className="mt-1 text-sm text-white/65">Admin access and email tooling.</p>
      </header>

      <AdminTestEmailForm />

      <div className="space-y-3 rounded-2xl border border-white/15 bg-black/30 p-4 text-sm text-white/85">
        <h3 className="text-base font-semibold text-emerald-100">Admin access</h3>
        <p>
          Admin access is controlled by <code className="rounded bg-black/40 px-1 py-0.5">ADMIN_EMAILS</code> in
          environment variables.
        </p>
        <p>Add comma-separated emails to grant dashboard admin access, for example:</p>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
ADMIN_EMAILS=concierge@listqik.com,another-admin@listqik.com
        </pre>
        <p className="text-white/60">
          Internal notifications use <code className="rounded bg-black/40 px-1 py-0.5">INTERNAL_NOTIFICATIONS_EMAIL</code>{" "}
          when set, otherwise <code className="rounded bg-black/40 px-1 py-0.5">ADMIN_EMAILS</code>.
        </p>
      </div>
    </div>
  );
}
