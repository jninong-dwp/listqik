import type { ActivityEvent } from "@/lib/admin-insights";

const toneClass: Record<NonNullable<ActivityEvent["tone"]>, string> = {
  default: "border-white/15 bg-white/5",
  success: "border-emerald-500/30 bg-emerald-950/25",
  warning: "border-amber-500/30 bg-amber-950/20",
  info: "border-sky-500/25 bg-sky-950/20",
};

export function UserActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-white/15 bg-black/30 p-4 text-sm text-white/60">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {events.map((event) => {
        const tone = event.tone ?? "default";
        return (
          <li
            key={event.id}
            className={`rounded-xl border px-4 py-3 text-sm ${toneClass[tone]}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-white/95">{event.title}</span>
              <time className="text-xs text-white/55">{event.atLabel}</time>
            </div>
            {event.detail ? <p className="mt-1 text-white/65">{event.detail}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
