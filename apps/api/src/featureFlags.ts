export interface FeatureFlags {
  enableAgentCatalog: boolean;
  enableEnkaImport: boolean;
  enableAccumulativeImport: boolean;
}

export function getFeatureFlags(): FeatureFlags {
  return {
    enableAgentCatalog: process.env.ENABLE_AGENT_CATALOG === "true",
    enableEnkaImport: process.env.ENABLE_ENKA_IMPORT === "true",
    enableAccumulativeImport: process.env.ENABLE_ACCUMULATIVE_IMPORT === "true"
  };
}
