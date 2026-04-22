import { ListingSetupView } from "@/components/dashboard/listing-setup-view";

export default async function ListingSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingSetupView listingId={id} />;
}
