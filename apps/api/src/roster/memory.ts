import type { PlayerAgentDynamic, PlayerRosterImportSummary, Region } from "@ika/shared";
import { mergePlayerAgentDynamic } from "@ika/shared";
import type { PlayerAgentStateStore } from "./types.js";

function key(uid: string, region: Region): string {
  return `${region}:${uid}`;
}

export function createMemoryRosterStore(): PlayerAgentStateStore {
  const states = new Map<string, Map<string, PlayerAgentDynamic>>();
  const summaries = new Map<string, PlayerRosterImportSummary>();

  return {
    async listStates(uid, region) {
      return Array.from(states.get(key(uid, region))?.values() ?? []);
    },
    async upsertStates(uid, region, incomingStates) {
      const storeKey = key(uid, region);
      const current = states.get(storeKey) ?? new Map<string, PlayerAgentDynamic>();
      for (const incoming of incomingStates) {
        const existing = current.get(incoming.agentId);
        current.set(incoming.agentId, mergePlayerAgentDynamic(existing, incoming));
      }
      states.set(storeKey, current);
    },
    async getImportSummary(uid, region) {
      return summaries.get(key(uid, region)) ?? null;
    },
    async saveImportSummary(uid, region, summary) {
      summaries.set(key(uid, region), summary);
    }
  };
}
