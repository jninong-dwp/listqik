export type PlanId = "subsonic" | "supersonic" | "hypersonic";

export type WizardUpgrade = {
  slug: string;
  name: string;
  description: string;
  toggleAddLabel?: string;
  toggleRemoveLabel?: string;
  price: number;
  ghlProductId: string;
  recommendedFor: PlanId[];
};
