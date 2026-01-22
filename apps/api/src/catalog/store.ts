import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentCatalog, AgentStatic, DiscSet, DiscSetCatalog, EnkaMapping } from "@ika/shared";

interface CatalogFile {
  catalogVersion: string;
  agents: Array<Omit<AgentStatic, "catalogVersion">>;
}

interface MappingFile {
  mappingVersion?: string;
  characters?: Record<string, string>;
  weapons?: Record<string, string>;
  discs?: Record<string, string>;
}

interface DiscSetFile {
  catalogVersion: string;
  discSets: DiscSet[];
}

export interface CatalogStore {
  getCatalog(): AgentCatalog;
  getMapping(): EnkaMapping;
  getDiscSets(): DiscSetCatalog;
  getDiscSetMap(): Map<number, DiscSet>;
  reload(): Promise<{ catalogVersion: string; mappingVersion: string }>;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const catalogPath = path.join(repoRoot, "packages", "catalog", "agents.v1.json");
const mappingPathV1 = path.join(repoRoot, "packages", "catalog", "enka-mapping.v1.json");
const mappingPathV2 = path.join(repoRoot, "packages", "catalog", "enka-mapping.v2.json");
const discSetsPath = path.join(repoRoot, "packages", "catalog", "disc-sets.v1.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function tryReadJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(filePath);
  } catch {
    return null;
  }
}

function stripColorTags(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }
  return value.replace(/<color=.*?>|<\/color>/g, "");
}

async function loadCatalog(): Promise<AgentCatalog> {
  const file = await readJsonFile<CatalogFile>(catalogPath);
  const catalogVersion = file.catalogVersion ?? "unknown";
  const agents = (file.agents ?? []).map((agent) => ({
    ...agent,
    catalogVersion
  }));
  return { catalogVersion, agents };
}

async function loadMapping(): Promise<EnkaMapping> {
  const fileV1 = (await tryReadJsonFile<MappingFile>(mappingPathV1)) ?? {};
  const fileV2 = (await tryReadJsonFile<MappingFile>(mappingPathV2)) ?? {};
  return {
    mappingVersion: fileV2.mappingVersion ?? fileV1.mappingVersion ?? "unknown",
    characters: { ...(fileV1.characters ?? {}), ...(fileV2.characters ?? {}) },
    weapons: { ...(fileV1.weapons ?? {}), ...(fileV2.weapons ?? {}) },
    discs: { ...(fileV1.discs ?? {}), ...(fileV2.discs ?? {}) }
  };
}

async function loadDiscSets(): Promise<DiscSetCatalog> {
  const file = await readJsonFile<DiscSetFile>(discSetsPath);
  const catalogVersion = file.catalogVersion ?? "unknown";
  const discSets = (file.discSets ?? []).map((discSet) => ({
    ...discSet,
    twoPieceBonus: stripColorTags(discSet.twoPieceBonus),
    fourPieceBonus: stripColorTags(discSet.fourPieceBonus)
  }));
  return { catalogVersion, discSets };
}

export async function createCatalogStore(): Promise<CatalogStore> {
  let catalog = await loadCatalog();
  let mapping = await loadMapping();
  let discSets = await loadDiscSets();
  let discSetMap = new Map(discSets.discSets.map((discSet) => [discSet.gameId, discSet]));

  return {
    getCatalog: () => catalog,
    getMapping: () => mapping,
    getDiscSets: () => discSets,
    getDiscSetMap: () => discSetMap,
    reload: async () => {
      catalog = await loadCatalog();
      mapping = await loadMapping();
      discSets = await loadDiscSets();
      discSetMap = new Map(discSets.discSets.map((discSet) => [discSet.gameId, discSet]));
      return { catalogVersion: catalog.catalogVersion, mappingVersion: mapping.mappingVersion };
    }
  };
}
