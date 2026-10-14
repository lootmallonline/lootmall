import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["pending", "packed", "dispatched", "delivered"];

function when(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });
}

export function StatusTimeline({
  status,
  history,
}: {
  status: OrderStatus;
  history: { status: OrderStatus; created_at: string }[];
}) {
  const times: Partial<Record<OrderStatus, string>> = {};
  [...history]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .forEach((h) => {
      if (!times[h.status]) times[h.status] = h.created_at;
    });

  const steps: OrderStatus[] = status === "cancelled" ? [...STEPS.filter((s) => times[s]), "cancelled"] : STEPS;

  return (
    <ol className="space-y-3" aria-label="Order progress">
      {steps.map((s) => {
        const reached = s === "cancelled" ? true : STEPS.indexOf(s) <= STEPS.indexOf(status === "cancelled" ? "pending" : status) || !!times[s];
        const current = s === status;
        const colour = s === "cancelled" ? "bg-red-600" : reached ? "bg-emerald-600" : "bg-maroon-100";
        return (
          <li key={s} className="flex items-start gap-3">
            <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${colour} ${current ? "ring-4 ring-gold-300" : ""}`} aria-hidden />
            <div>
              <p className={`text-sm ${reached ? "font-semibold" : "text-ink/50"}`}>
                {ORDER_STATUS_LABELS[s]}
                {current && <span className="sr-only"> (current status)</span>}
              </p>
              {times[s] && <p className="text-xs text-ink/60">{when(times[s])}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
