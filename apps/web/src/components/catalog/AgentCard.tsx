import type { AgentStatic } from "@ika/shared";
import { Badge } from "../ui/badge";

interface AgentCardProps {
  agent: AgentStatic;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-ika-800/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink-900">{agent.name}</div>
          <div className="text-xs text-ink-500">{agent.faction}</div>
        </div>
        <Badge className="border border-border bg-ika-700/60 text-ink-700">{agent.rarity}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <Badge className="border border-border bg-ika-700/60 text-ink-700">{agent.attribute}</Badge>
        <Badge className="border border-border bg-ika-700/60 text-ink-700">{agent.role}</Badge>
        <Badge className="border border-border bg-ika-700/60 text-ink-700">{agent.attackType}</Badge>
      </div>

      {agent.shortDescription ? (
        <p className="mt-3 text-xs text-ink-500">{agent.shortDescription}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {agent.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-ink-500">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
