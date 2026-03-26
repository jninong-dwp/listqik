import Link from "next/link";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <div className="py-14">
      <Container>
        <div className="mx-auto max-w-2xl glass-surface p-8 text-center">
          <div className="text-xs font-semibold tracking-widest text-white/60">
            404
          </div>
          <div className="mt-2 text-2xl font-semibold text-white">
            Route not found.
          </div>
          <p className="mt-3 text-sm text-muted">
            The requested page doesn’t exist (or it’s been redeployed under a new slug).
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
            <Link href="/listings" className="btn-secondary">
              Open Listings
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

