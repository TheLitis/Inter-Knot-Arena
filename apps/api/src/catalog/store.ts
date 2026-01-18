import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentCatalog, AgentStatic, EnkaMapping } from "@ika/shared";

interface CatalogFile {
  catalogVersion: string;
  agents: Array<Omit<AgentStatic, "catalogVersion">>;
}

interface MappingFile {
  mappingVersion: string;
  characters: Record<string, string>;
  weapons: Record<string, string>;
  discs: Record<string, string>;
}

export interface CatalogStore {
  getCatalog(): AgentCatalog;
  getMapping(): EnkaMapping;
  reload(): Promise<{ catalogVersion: string; mappingVersion: string }>;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const catalogPath = path.join(repoRoot, "packages", "catalog", "agents.v1.json");
const mappingPath = path.join(repoRoot, "packages", "catalog", "enka-mapping.v1.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
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
  const file = await readJsonFile<MappingFile>(mappingPath);
  return {
    mappingVersion: file.mappingVersion ?? "unknown",
    characters: file.characters ?? {},
    weapons: file.weapons ?? {},
    discs: file.discs ?? {}
  };
}

export async function createCatalogStore(): Promise<CatalogStore> {
  let catalog = await loadCatalog();
  let mapping = await loadMapping();

  return {
    getCatalog: () => catalog,
    getMapping: () => mapping,
    reload: async () => {
      catalog = await loadCatalog();
      mapping = await loadMapping();
      return { catalogVersion: catalog.catalogVersion, mappingVersion: mapping.mappingVersion };
    }
  };
}
