import type { AgentEligibility, AgentStatic, PlayerAgentDynamic } from "@ika/shared";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface PlayerAgentCardProps {
  agent: AgentStatic;
  state?: PlayerAgentDynamic;
  eligibility: AgentEligibility;
}

const sourceLabels: Record<PlayerAgentDynamic["source"], string> = {
  ENKA_SHOWCASE: "Enka",
  VERIFIER_OCR: "Verifier",
  MANUAL: "Manual"
};

export function PlayerAgentCard({ agent, state, eligibility }: PlayerAgentCardProps) {
  const owned = state?.owned ?? false;
  const eligibilityBadge = eligibility.draftEligible ? "Eligible" : "Not eligible";

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
        <Badge
          className={
            owned
              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border border-rose-500/40 bg-rose-500/10 text-rose-200"
          }
        >
          {owned ? "Owned" : "Missing"}
        </Badge>
        {state ? (
          <Badge className="border border-border bg-ika-700/60 text-ink-700">
            {sourceLabels[state.source]}
          </Badge>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
        <span>Level: {state?.level ?? "-"}</span>
        <span>Dupes: {state?.dupes ?? "-"}</span>
        <span>Mindscape: {state?.mindscape ?? "-"}</span>
      </div>

      <div className="mt-3">
        {eligibility.draftEligible ? (
          <Badge className="border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            {eligibilityBadge}
          </Badge>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="border border-rose-500/40 bg-rose-500/10 text-rose-200">
                {eligibilityBadge}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs text-xs">
                {eligibility.reasons.map((reason) => (
                  <div key={reason}>{reason}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
