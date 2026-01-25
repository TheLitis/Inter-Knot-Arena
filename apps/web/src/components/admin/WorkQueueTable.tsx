import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface WorkQueueItem {
  id: string;
  players: string;
  league: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  assignee?: string;
}

interface WorkQueueTableProps {
  items: WorkQueueItem[];
  canAssign: boolean;
  showActions?: boolean;
  loading?: boolean;
}

function statusBadge(status: string) {
  if (status === "OPEN" || status === "NEW") {
    return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "ESCALATED") {
    return "border border-rose-500/40 bg-rose-500/10 text-rose-300";
  }
  if (status === "IN_REVIEW") {
    return "border border-amber-500/40 bg-amber-500/10 text-amber-300";
  }
  return "border border-border bg-ika-700/60 text-ink-700";
}

export function WorkQueueTable({
  items,
  canAssign,
  showActions = true,
  loading = false
}: WorkQueueTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-ika-800/70 p-6 text-sm text-ink-500">
        Loading queue...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-ika-800/70 p-6 text-sm text-ink-500">
        No items in this queue.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-ika-800/70">
      <div className="grid grid-cols-[0.8fr_1.4fr_0.9fr_1.1fr_0.8fr_0.9fr_1.5fr] gap-3 border-b border-border px-4 py-3 text-xs uppercase tracking-[0.2em] text-ink-500">
        <span>ID</span>
        <span>Players</span>
        <span>League</span>
        <span>Time</span>
        <span>Status</span>
        <span>Assignee</span>
        <span>Actions</span>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[0.8fr_1.4fr_0.9fr_1.1fr_0.8fr_0.9fr_1.5fr] gap-3 border-b border-border/50 px-4 py-3 text-sm text-ink-700 last:border-b-0"
        >
          <div className="text-xs text-ink-500">{item.id}</div>
          <div className="text-ink-900">{item.players}</div>
          <div>{item.league}</div>
          <div className="text-xs text-ink-500">
            <div>Created {item.createdAt}</div>
            <div>Updated {item.updatedAt}</div>
          </div>
          <div>
            <Badge className={statusBadge(item.status)}>{item.status}</Badge>
          </div>
          <div className="text-xs text-ink-500">{item.assignee ?? "Unassigned"}</div>
          {showActions ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline">
                Details
              </Button>
              {canAssign ? (
                <Button size="sm" variant="outline">
                  Assign
                </Button>
              ) : null}
              <select className="rounded-md border border-border bg-ika-900/40 px-2 py-1 text-xs text-ink-700">
                <option>NEW</option>
                <option>IN_REVIEW</option>
                <option>ESCALATED</option>
                <option>RESOLVED</option>
              </select>
              <Button size="sm" variant="outline">
                Note
              </Button>
              <Button size="sm" variant="outline">
                Escalate
              </Button>
            </div>
          ) : (
            <div className="text-xs text-ink-500">No actions</div>
          )}
        </div>
      ))}
    </div>
  );
}
