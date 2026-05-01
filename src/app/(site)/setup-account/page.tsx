import { Suspense } from "react";
import { SetupAccountForm } from "@/components/setup-account-form";

export default function SetupAccountPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Suspense
        fallback={
          <div className="glass-surface-strong p-8 text-sm text-muted">Loading setup…</div>
        }
      >
        <SetupAccountForm />
      </Suspense>
    </div>
  );
}
