import { Container } from "@/components/container";
import { ListingsExplorer } from "@/components/listings-explorer";
import { listings } from "@/data/listings";

export const metadata = {
  title: "Listings",
};

export default function ListingsPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-widest text-white/60">
            LISTINGS INDEX
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Browse inventory. Filter locally.
          </h1>
          <p className="text-base text-muted">
            Everything is local/static for now (typed objects in <span className="font-mono">src/data</span>),
            so you can later swap to CMS/DB without rebuilding UI.
          </p>
        </div>

        <div className="mt-8">
          <ListingsExplorer listings={listings} />
        </div>
      </Container>
    </div>
  );
}

