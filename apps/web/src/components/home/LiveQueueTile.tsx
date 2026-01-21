import { Link } from "react-router-dom";
import { AlertTriangle, Clock, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type QueueStatus = "OPEN" | "CLOSED" | "MAINTENANCE";

export interface QueueTileData {
  id: string;
  name: string;
  status: QueueStatus;
  players: number;
  wait: string;
  requirements: string[];
}

interface LiveQueueTileProps {
  data: QueueTileData;
  eligible: boolean;
  disabledReason?: string;
}

const statusStyles: Record<QueueStatus, string> = {
  OPEN: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  CLOSED: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  MAINTENANCE: "border-rose-500/40 bg-rose-500/10 text-rose-200"
};

export function LiveQueueTile({ data, eligible, disabledReason }: LiveQueueTileProps) {
  const isDisabled = data.status !== "OPEN" || !eligible;
  const tooltipText =
    data.status !== "OPEN" ? "Queue is not available right now." : disabledReason;

  const button = (
    <Button size="sm" disabled={isDisabled}>
      Join queue
    </Button>
  );

  return (
    <Card className="flex h-full flex-col gap-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-ink-900">{data.name}</div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-500">
            {data.requirements.map((req) => (
              <span key={req} className="rounded-full border border-border px-2 py-0.5">
                {req}
              </span>
            ))}
          </div>
        </div>
        <Badge className={statusStyles[data.status]}>{data.status}</Badge>
      </div>

      <div className="grid gap-2 text-sm text-ink-700">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-ink-500" />
          {data.players} players in queue
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-ink-500" />
          Avg wait {data.wait}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <Link className="text-xs text-accent-400" to="/rulesets">
          Queue rules
        </Link>
        {tooltipText ? (
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-300" />
                <span>{tooltipText}</span>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          button
        )}
      </div>
    </Card>
  );
}
