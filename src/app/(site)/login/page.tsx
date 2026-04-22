import { Suspense } from "react";
import { Container } from "@/components/container";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Container className="py-16">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md glass-surface-strong p-8 text-sm text-muted">Loading…</div>
        }
      >
        <LoginForm />
      </Suspense>
    </Container>
  );
}
