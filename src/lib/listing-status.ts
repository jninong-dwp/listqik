/** Calendar-day helpers for listing go-live vs. stored status. */

export function calendarDayMs(value: Date | string): number {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isListingStartInFuture(listingStartOn: Date | string | null | undefined): boolean {
  if (!listingStartOn) return false;
  const start = listingStartOn instanceof Date ? listingStartOn : new Date(listingStartOn);
  if (!Number.isFinite(start.getTime())) return false;
  return calendarDayMs(start) > calendarDayMs(new Date());
}

export function isListingStartOnOrBeforeToday(listingStartOn: Date | string | null | undefined): boolean {
  if (!listingStartOn) return false;
  const start = listingStartOn instanceof Date ? listingStartOn : new Date(listingStartOn);
  if (!Number.isFinite(start.getTime())) return false;
  return calendarDayMs(start) <= calendarDayMs(new Date());
}

export type ListingStatusValue = "INCOMPLETE" | "ACTIVE" | "PENDING" | "EXPIRED" | "SOLD";

/**
 * Status to persist when finalizing or when the seller changes listing start date.
 * Future start dates stay pending until that calendar day.
 */
export function statusForListingStartDate(
  listingStartOn: Date | string | null | undefined,
): ListingStatusValue {
  return isListingStartInFuture(listingStartOn) ? "PENDING" : "ACTIVE";
}

/** Human-readable badge label in the seller dashboard. */
export function getDisplayListingStatus(
  storedStatus: string,
  listingStartOn: Date | string | null | undefined,
  scheduledActivationPending?: boolean,
): string {
  if (storedStatus === "PENDING" && (scheduledActivationPending || isListingStartInFuture(listingStartOn))) {
    return "Scheduled";
  }
  if (storedStatus === "ACTIVE" && isListingStartInFuture(listingStartOn)) {
    return "Scheduled";
  }
  return storedStatus;
}

export type ListingStatusSyncInput = {
  status: string;
  listingStartOn?: Date | string | null;
  setupFinalizedAt?: Date | string | null;
  scheduledActivationPending?: boolean;
};

export type ListingStatusSyncResult = {
  status: ListingStatusValue;
  scheduledActivationPending: boolean;
  listedOn: Date | null;
  changed: boolean;
};

/**
 * Reconcile stored status with listing start date and scheduled go-live flag.
 * Call before returning listings to the dashboard and after PATCH that touches dates/status.
 */
export function reconcileListingStatus(input: ListingStatusSyncInput): ListingStatusSyncResult {
  const prevStatus = input.status as ListingStatusValue;
  let status = prevStatus;
  let scheduledActivationPending = Boolean(input.scheduledActivationPending);
  let listedOn: Date | null = null;
  let changed = false;

  const finalized = Boolean(input.setupFinalizedAt);
  const start = input.listingStartOn
    ? input.listingStartOn instanceof Date
      ? input.listingStartOn
      : new Date(input.listingStartOn)
    : null;
  const startValid = start && Number.isFinite(start.getTime());

  if (!finalized || !startValid) {
    return { status, scheduledActivationPending, listedOn, changed };
  }

  if (isListingStartInFuture(start)) {
    if (status === "ACTIVE" || status === "INCOMPLETE") {
      status = "PENDING";
      scheduledActivationPending = true;
      changed = status !== prevStatus || scheduledActivationPending !== Boolean(input.scheduledActivationPending);
    }
    return { status, scheduledActivationPending, listedOn, changed };
  }

  if (scheduledActivationPending && isListingStartOnOrBeforeToday(start)) {
    if (status === "PENDING") {
      status = "ACTIVE";
      scheduledActivationPending = false;
      listedOn = new Date();
      changed = true;
    }
  }

  return { status, scheduledActivationPending, listedOn, changed };
}

/** Apply reconcile result onto a Mongoose listing document. Returns whether fields changed. */
export function applyListingStatusSyncToDocument(listing: {
  status: string;
  listingStartOn?: Date | null;
  setupFinalizedAt?: Date | null;
  scheduledActivationPending?: boolean;
  listedOn?: Date | null;
}): boolean {
  const sync = reconcileListingStatus({
    status: listing.status,
    listingStartOn: listing.listingStartOn,
    setupFinalizedAt: listing.setupFinalizedAt,
    scheduledActivationPending: listing.scheduledActivationPending,
  });
  if (!sync.changed) return false;
  listing.status = sync.status;
  listing.scheduledActivationPending = sync.scheduledActivationPending;
  if (sync.listedOn) listing.listedOn = sync.listedOn;
  return true;
}
