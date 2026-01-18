import type { EnkaMapping, PlayerAgentDynamic } from "@ika/shared";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractShowcaseAgents(payload: unknown): unknown[] {
  const root = asRecord(payload);
  if (!root) {
    return [];
  }

  const candidates = [
    root.showcase,
    root.showcaseAgents,
    root.data,
    root.playerInfo,
    root.player
  ];

  for (const candidate of candidates) {
    const record = asRecord(candidate);
    if (!record) {
      continue;
    }
    const agents = record.agents ?? record.characters ?? record.showcaseAgents ?? record.avatarInfoList;
    const list = asArray(agents);
    if (list.length) {
      return list;
    }
  }

  return [];
}

function extractId(record: UnknownRecord): string | null {
  return (
    asString(record.characterId) ??
    asString(record.character_id) ??
    asString(record.avatarId) ??
    asString(record.id)
  );
}

function normalizeWeapon(record: UnknownRecord, mapping: EnkaMapping, unknownIds: string[]) {
  const weaponRecord = asRecord(record.weapon ?? record.weaponInfo);
  if (!weaponRecord) {
    return undefined;
  }
  const rawId = asString(weaponRecord.weaponId ?? weaponRecord.id);
  if (!rawId) {
    return undefined;
  }
  const mapped = mapping.weapons[rawId];
  if (!mapped) {
    unknownIds.push(`weapon:${rawId}`);
  }
  return {
    weaponId: mapped ?? `enka:${rawId}`,
    level: asNumber(weaponRecord.level),
    rarity: asString(weaponRecord.rarity)
  };
}

function normalizeDiscs(record: UnknownRecord, mapping: EnkaMapping, unknownIds: string[]) {
  const discs = asArray(record.discs ?? record.diskDrives ?? record.equipment);
  if (!discs.length) {
    return undefined;
  }

  const normalized = discs
    .map((disc) => {
      const discRecord = asRecord(disc);
      if (!discRecord) {
        return null;
      }
      const rawId = asString(discRecord.discId ?? discRecord.id);
      if (!rawId) {
        return null;
      }
      const mapped = mapping.discs[rawId];
      if (!mapped) {
        unknownIds.push(`disc:${rawId}`);
      }
      return {
        discId: mapped ?? `enka:${rawId}`,
        slot: asNumber(discRecord.slot),
        set: asString(discRecord.set),
        mainStat: asString(discRecord.mainStat),
        subStats: asArray(discRecord.subStats).map((value) => String(value))
      };
    })
    .filter((value) => value !== null);

  return normalized.length ? normalized : undefined;
}

function normalizeSkills(record: UnknownRecord): Record<string, number> | undefined {
  const skills = asRecord(record.skills ?? record.skillLevels ?? record.skillMap);
  if (!skills) {
    return undefined;
  }
  const entries = Object.entries(skills)
    .map(([key, value]) => [key, asNumber(value)] as const)
    .filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return undefined;
  }
  return Object.fromEntries(entries) as Record<string, number>;
}

export function normalizeEnkaPayload(
  payload: unknown,
  mapping: EnkaMapping,
  timestampIso: string
): { agents: PlayerAgentDynamic[]; unknownIds: string[] } {
  const unknownIds: string[] = [];
  const agents = extractShowcaseAgents(payload)
    .map((item) => {
      const record = asRecord(item);
      if (!record) {
        return null;
      }
      const rawId = extractId(record);
      if (!rawId) {
        return null;
      }
      const agentId = mapping.characters[rawId];
      if (!agentId) {
        unknownIds.push(`character:${rawId}`);
        return null;
      }

      const dynamic: PlayerAgentDynamic = {
        agentId,
        owned: true,
        level: asNumber(record.level ?? record.characterLevel),
        dupes: asNumber(record.dupes ?? record.rank),
        mindscape: asNumber(record.mindscape ?? record.resonance),
        weapon: normalizeWeapon(record, mapping, unknownIds),
        discs: normalizeDiscs(record, mapping, unknownIds),
        skills: normalizeSkills(record),
        source: "ENKA_SHOWCASE",
        updatedAt: timestampIso
      };

      return dynamic;
    })
    .filter((value) => value !== null) as PlayerAgentDynamic[];

  return { agents, unknownIds };
}
