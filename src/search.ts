import type { PackageSearchQuery, PackageSearchResult } from "./types";

export interface PackageSearchClient {
  search(query: PackageSearchQuery): Promise<PackageSearchResult[]>;
}

export class LocalFallbackSearchClient implements PackageSearchClient {
  async search(query: PackageSearchQuery): Promise<PackageSearchResult[]> {
    const normalized = query.query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return [
      {
        name: normalized.includes("http") ? "undici" : "lodash",
        version: "latest",
        summary: "Placeholder search result until the catalog API is wired up.",
        downloadsWeekly: 0,
        license: "MIT",
        trustScore: 0.5,
        reason: "Local fallback result for the initial scaffold."
      }
    ];
  }
}
