import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

type ListingLike = {
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  mlsName?: string;
  mlsNumber?: string;
  listingId?: string;
  subdivisionName?: string;
  status?: string;
  propertyType?: string;
  price?: number;
  buyerAgentCompPct?: number | null;
  buyerAgentCompType?: "PERCENT" | "AMOUNT" | string;
  buyerAgentCompAmount?: number | null;
  listingStartOn?: Date | null;
  listingEndOn?: Date | null;
  yearBuilt?: number | null;
  description?: string;
  publicRemarks?: string;
  drivingDirections?: string;
  parcelId?: string;
  legalLot?: string;
  legalBlock?: string;
  legalAddition?: string;
  contactPhone?: string;
  contactEmail?: string;
  sellerNames?: string;
  planLabel?: string;
  heroImageUrl?: string;
  listedOn?: Date | null;
  orderedOn?: Date | null;
  expiresOn?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  appointmentPhone?: string;
  appointmentEmail?: string;
};

type ExportContext = {
  listing: ListingLike;
  documents: Array<{ fileName?: string; fileUrl?: string; signatureStatus?: string }>;
  offers: Array<{ buyerName?: string; amount?: number; status?: string }>;
  upgrades: Array<{ upgradeName?: string; amount?: number; status?: string }>;
  openHouses: Array<{ title?: string; startAt?: Date; endAt?: Date; status?: string }>;
};

function fmtDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US");
}

function fmtMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [""];
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildMlsListingSheetPdf(ctx: ExportContext): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([612, 792]);
  const marginX = 36;
  const contentWidth = 612 - marginX * 2;
  let y = 756;

  const ensureSpace = (needed: number) => {
    if (y - needed < 36) {
      page = doc.addPage([612, 792]);
      y = 756;
    }
  };

  const drawHeading = (text: string) => {
    ensureSpace(22);
    page.drawText(text, { x: marginX, y, size: 15, font: bold, color: rgb(0.08, 0.18, 0.38) });
    y -= 18;
  };

  const drawSubHeading = (text: string) => {
    ensureSpace(18);
    page.drawText(text.toUpperCase(), { x: marginX, y, size: 10, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 14;
  };

  const drawField = (label: string, value: string, col: 0 | 1 = 0) => {
    const colGap = 16;
    const colWidth = (contentWidth - colGap) / 2;
    const x = marginX + (col === 1 ? colWidth + colGap : 0);
    const labelSize = 8.5;
    const valueSize = 10;
    const labelY = y;
    page.drawText(`${label}:`, { x, y: labelY, size: labelSize, font: bold, color: rgb(0.2, 0.2, 0.2) });
    const lines = wrapText(value || "—", font, valueSize, colWidth - 2);
    let lineY = labelY - 10;
    for (const line of lines) {
      page.drawText(line, { x, y: lineY, size: valueSize, font, color: rgb(0, 0, 0) });
      lineY -= 12;
    }
    return Math.max(24, 12 + lines.length * 12);
  };

  const drawFullText = (label: string, value: string) => {
    drawSubHeading(label);
    const lines = wrapText(value || "—", font, 10, contentWidth);
    for (const line of lines) {
      ensureSpace(12);
      page.drawText(line, { x: marginX, y, size: 10, font, color: rgb(0, 0, 0) });
      y -= 12;
    }
    y -= 6;
  };

  const l = ctx.listing;
  const fullAddress = [l.street, l.unit, l.city, l.state, l.zip].filter(Boolean).join(", ");
  const legal = [l.legalLot, l.legalBlock, l.legalAddition].filter(Boolean).join(" | ");
  const buyerComp =
    l.buyerAgentCompType === "AMOUNT"
      ? fmtMoney(l.buyerAgentCompAmount)
      : `${typeof l.buyerAgentCompPct === "number" ? l.buyerAgentCompPct : ""}%`;

  drawHeading("RESIDENTIAL LISTING DETAIL");
  page.drawLine({ start: { x: marginX, y: y + 2 }, end: { x: marginX + contentWidth, y: y + 2 }, thickness: 1, color: rgb(0.78, 0.78, 0.78) });
  y -= 8;

  ensureSpace(120);
  const row1 = Math.max(
    drawField("Address", fullAddress, 0),
    drawField("MLS #", l.mlsNumber ?? "", 1),
  );
  y -= row1;
  const row2 = Math.max(
    drawField("City / State / Zip", [l.city, l.state, l.zip].filter(Boolean).join(", "), 0),
    drawField("County", l.county ?? "", 1),
  );
  y -= row2;
  const row3 = Math.max(
    drawField("List Price", fmtMoney(l.price), 0),
    drawField("Status", l.status ?? "", 1),
  );
  y -= row3;
  const row4 = Math.max(
    drawField("Type", l.propertyType?.replaceAll("_", " ") ?? "", 0),
    drawField("Subdivision", l.subdivisionName ?? "", 1),
  );
  y -= row4;
  const row5 = Math.max(
    drawField("Year Built", l.yearBuilt ? String(l.yearBuilt) : "", 0),
    drawField("Buyer Agent Comp", buyerComp, 1),
  );
  y -= row5;

  drawSubHeading("FINANCIAL");
  const f1 = Math.max(
    drawField("Plan", l.planLabel ?? "", 0),
    drawField("Parcel #", l.parcelId ?? "", 1),
  );
  y -= f1;
  const f2 = Math.max(
    drawField("Listed On", fmtDate(l.listedOn), 0),
    drawField("Expires On", fmtDate(l.expiresOn), 1),
  );
  y -= f2;
  const f3 = Math.max(
    drawField("Owner / Seller", l.sellerNames ?? "", 0),
    drawField("Legal", legal, 1),
  );
  y -= f3 + 6;

  drawSubHeading("CONTACT");
  const c1 = Math.max(
    drawField("List Office", "ListQik.com", 0),
    drawField("List Agent", l.contactEmail ?? "", 1),
  );
  y -= c1;
  const c2 = Math.max(
    drawField("To Show Call", l.appointmentPhone || l.contactPhone || "", 0),
    drawField("Email", l.appointmentEmail || l.contactEmail || "", 1),
  );
  y -= c2 + 6;

  drawFullText("PUBLIC REMARKS", l.publicRemarks || l.description || "");
  drawFullText("DIRECTIONS", l.drivingDirections || "See map and listing instructions.");

  drawSubHeading("FEATURES");
  const features = [
    `Hero image: ${l.heroImageUrl ? "Included" : "Not uploaded"}`,
    `Open houses: ${ctx.openHouses.length}`,
    `Documents: ${ctx.documents.length}`,
    `Offers: ${ctx.offers.length}`,
    `Upgrade requests: ${ctx.upgrades.length}`,
  ];
  for (const feature of features) {
    ensureSpace(12);
    page.drawText(`• ${feature}`, { x: marginX + 4, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 12;
  }
  y -= 8;

  drawSubHeading("SOLD INFORMATION");
  const sold1 = Math.max(
    drawField("Original Price", fmtMoney(l.price), 0),
    drawField("SP", "", 1),
  );
  y -= sold1;
  const sold2 = Math.max(
    drawField("CLSD", fmtDate(l.updatedAt || l.createdAt), 0),
    drawField("SP/SqFt", "", 1),
  );
  y -= sold2;

  ensureSpace(42);
  const disclaimer =
    "THIS INFORMATION IS DEEMED RELIABLE, BUT NOT GUARANTEED, AND IS PROVIDED FOR CONSUMER USE ONLY. " +
    "VERIFY ALL APPROXIMATE FIELDS AND MLS-SPECIFIC REQUIREMENTS BEFORE PUBLICATION.";
  const disclaimerLines = wrapText(disclaimer, font, 7.5, contentWidth);
  page.drawLine({ start: { x: marginX, y: y + 8 }, end: { x: marginX + contentWidth, y: y + 8 }, thickness: 0.8, color: rgb(0.75, 0.75, 0.75) });
  for (const line of disclaimerLines) {
    ensureSpace(10);
    page.drawText(line, { x: marginX, y, size: 7.5, font, color: rgb(0.25, 0.25, 0.25) });
    y -= 9;
  }
  y -= 4;
  page.drawText(`Generated ${new Date().toLocaleString("en-US")}`, {
    x: marginX,
    y,
    size: 8,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });

  return doc.save();
}
