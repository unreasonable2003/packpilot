import { JsonHttpClient } from "../core/http";
import { assertNonEmptyQuery, assertValidPackageName } from "../core/validation";
import type {
  PackageDetails,
  PackageLinks,
  PackageSearchQuery,
  PackageSearchResult,
  PackageTrustSignals
} from "../domain/types";

export interface PackageSearchClient {
  search(query: PackageSearchQuery): Promise<PackageSearchResult[]>;
  getPackageDetails(packageName: string): Promise<PackageDetails>;
}

interface NpmSearchResponse {
  objects: Array<{
    package: {
      name: string;
      version: string;
      description?: string;
      keywords?: string[];
      date?: string;
      links?: {
        homepage?: string;
        repository?: string;
      };
      author?: {
        name?: string;
      };
      publisher?: {
        username?: string;
      };
      license?: string;
    };
    score?: {
      final?: number;
    };
    searchScore?: number;
  }>;
}

interface NpmDownloadsResponse {
  downloads?: number;
}

interface NpmRegistryMetadata {
  name: string;
  description?: string;
  keywords?: string[];
  readme?: string;
  homepage?: string;
  repository?: string | { url?: string };
  license?: string | { type?: string };
  author?: string | { name?: string };
  versions?: Record<
    string,
    {
      description?: string;
      keywords?: string[];
      homepage?: string;
      repository?: string | { url?: string };
      license?: string | { type?: string };
      author?: string | { name?: string };
    }
  >;
  time?: Record<string, string>;
  "dist-tags"?: {
    latest?: string;
  };
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

function normalizeRepositoryUrl(value?: string | { url?: string }): string | undefined {
  const raw = typeof value === "string" ? value : value?.url;
  if (!raw) {
    return undefined;
  }

  return raw.replace(/^git\+/, "").replace(/\.git$/, "");
}

function normalizeLicense(value?: string | { type?: string }): string | undefined {
  if (!value) {
    return undefined;
  }

  return typeof value === "string" ? value : value.type;
}

function normalizeAuthor(value?: string | { name?: string }): string | undefined {
  if (!value) {
    return undefined;
  }

  return typeof value === "string" ? value : value.name;
}

function buildLinks(
  packageName: string,
  homepage?: string,
  repository?: string | { url?: string }
): PackageLinks {
  return {
    npm: `https://www.npmjs.com/package/${packageName}`,
    homepage,
    repository: normalizeRepositoryUrl(repository)
  };
}

function isRecentlyUpdated(dateText?: string): boolean {
  if (!dateText) {
    return false;
  }

  const publishedAt = Date.parse(dateText);
  if (Number.isNaN(publishedAt)) {
    return false;
  }

  return (Date.now() - publishedAt) / (1000 * 60 * 60 * 24) <= 365;
}

function buildTrustSignals(
  packageName: string,
  links: PackageLinks,
  publishedAt?: string
): PackageTrustSignals {
  return {
    hasRepository: Boolean(links.repository),
    hasHomepage: Boolean(links.homepage),
    isScoped: packageName.startsWith("@"),
    recentlyUpdated: isRecentlyUpdated(publishedAt)
  };
}

function computeScore(searchScore: number, downloadsWeekly: number): number {
  const normalizedDownloads = Math.min(downloadsWeekly / 1_000_000, 1);
  return Number((searchScore * 0.75 + normalizedDownloads * 0.25).toFixed(3));
}

function buildReason(
  query: string,
  packageName: string,
  keywords: string[],
  exactMatch: boolean,
  downloadsWeekly: number
): string {
  if (exactMatch) {
    return "Exact package name match.";
  }

  const loweredQuery = query.trim().toLowerCase();
  const queryWords = loweredQuery.split(/\s+/).filter(Boolean);
  const keywordSet = new Set(keywords.map((keyword) => keyword.toLowerCase()));
  const keywordMatches = queryWords.filter((word) => keywordSet.has(word)).length;

  if (keywordMatches >= 2) {
    return "Strong keyword match for the requested intent.";
  }

  if (downloadsWeekly >= 100_000) {
    return "Relevant npm match with meaningful adoption.";
  }

  if (packageName.toLowerCase().includes(loweredQuery)) {
    return "Name and metadata align with the search query.";
  }

  return "Matched npm package metadata for the current query.";
}

function sortVersions(time?: Record<string, string>, versions?: Record<string, unknown>): string[] {
  if (!versions) {
    return [];
  }

  const timestampEntries = Object.entries(time ?? {})
    .filter(([version]) => version !== "created" && version !== "modified")
    .filter(([version]) => Boolean(versions[version]))
    .sort((left, right) => Date.parse(right[1]) - Date.parse(left[1]))
    .map(([version]) => version);

  if (timestampEntries.length > 0) {
    return timestampEntries.slice(0, 30);
  }

  return Object.keys(versions).slice(-30).reverse();
}

function snippetFromReadme(readme?: string): string | undefined {
  if (!readme) {
    return undefined;
  }

  const compact = readme
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`#>*_\-\[\]\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return compact ? compact.slice(0, 420) : undefined;
}

export class NpmRegistrySearchService implements PackageSearchClient {
  private readonly httpClient: JsonHttpClient;
  private readonly detailsCache = new Map<string, CacheEntry<PackageDetails>>();
  private readonly downloadCache = new Map<string, CacheEntry<number>>();
  private readonly cacheTtlMs = 5 * 60 * 1000;

  constructor(httpClient = new JsonHttpClient()) {
    this.httpClient = httpClient;
  }

  async search(query: PackageSearchQuery): Promise<PackageSearchResult[]> {
    const normalizedQuery = assertNonEmptyQuery(query.query);
    const response = await this.httpClient.getJson<NpmSearchResponse>(
      `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(normalizedQuery)}&size=12`
    );

    const packages = response.objects.map((entry) => {
      const packageInfo = entry.package;
      const links = buildLinks(packageInfo.name, packageInfo.links?.homepage, packageInfo.links?.repository);
      return {
        entry,
        packageInfo,
        links,
        exactMatch: packageInfo.name.toLowerCase() === normalizedQuery.toLowerCase()
      };
    });

    const downloads = await Promise.all(packages.map(async ({ packageInfo }) => this.getWeeklyDownloads(packageInfo.name)));

    return packages
      .map(({ entry, packageInfo, links, exactMatch }, index) => {
        const downloadsWeekly = downloads[index] ?? 0;
        const publishedAt = packageInfo.date;
        const keywords = packageInfo.keywords ?? [];

        return {
          name: packageInfo.name,
          version: packageInfo.version,
          summary: packageInfo.description ?? "No package description provided.",
          author: packageInfo.author?.name ?? packageInfo.publisher?.username,
          downloadsWeekly,
          license: packageInfo.license,
          score: computeScore(entry.searchScore ?? entry.score?.final ?? 0, downloadsWeekly),
          exactMatch,
          publishedAt,
          keywords,
          links,
          trust: buildTrustSignals(packageInfo.name, links, publishedAt),
          reason: buildReason(normalizedQuery, packageInfo.name, keywords, exactMatch, downloadsWeekly)
        };
      })
      .sort((left, right) => {
        if (left.exactMatch !== right.exactMatch) {
          return left.exactMatch ? -1 : 1;
        }

        if (left.score !== right.score) {
          return right.score - left.score;
        }

        return right.downloadsWeekly - left.downloadsWeekly;
      });
  }

  async getPackageDetails(packageName: string): Promise<PackageDetails> {
    const normalizedPackageName = assertValidPackageName(packageName);
    const cached = this.getCachedValue(this.detailsCache, normalizedPackageName);
    if (cached) {
      return cached;
    }

    const metadata = await this.httpClient.getJson<NpmRegistryMetadata>(
      `https://registry.npmjs.org/${encodeURIComponent(normalizedPackageName)}`
    );
    const latestVersion = metadata["dist-tags"]?.latest ?? Object.keys(metadata.versions ?? {})[0] ?? "latest";
    const latestManifest = metadata.versions?.[latestVersion];
    const publishedAt = metadata.time?.[latestVersion];
    const links = buildLinks(
      metadata.name,
      latestManifest?.homepage ?? metadata.homepage,
      latestManifest?.repository ?? metadata.repository
    );
    const downloadsWeekly = await this.getWeeklyDownloads(metadata.name);

    const detail: PackageDetails = {
      name: metadata.name,
      version: latestVersion,
      summary: latestManifest?.description ?? metadata.description ?? "No package description provided.",
      author: normalizeAuthor(latestManifest?.author ?? metadata.author),
      downloadsWeekly,
      license: normalizeLicense(latestManifest?.license ?? metadata.license),
      score: computeScore(1, downloadsWeekly),
      exactMatch: true,
      publishedAt,
      keywords: latestManifest?.keywords ?? metadata.keywords ?? [],
      links,
      trust: buildTrustSignals(metadata.name, links, publishedAt),
      reason: "Loaded directly from the npm registry package metadata.",
      versions: sortVersions(metadata.time, metadata.versions),
      readmeSnippet: snippetFromReadme(metadata.readme)
    };

    this.setCachedValue(this.detailsCache, normalizedPackageName, detail);
    return detail;
  }

  private async getWeeklyDownloads(packageName: string): Promise<number> {
    const cached = this.getCachedValue(this.downloadCache, packageName);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const response = await this.httpClient.getJson<NpmDownloadsResponse>(
        `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`
      );
      const downloads = response.downloads ?? 0;
      this.setCachedValue(this.downloadCache, packageName, downloads);
      return downloads;
    } catch {
      return 0;
    }
  }

  private getCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
    const entry = cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  private setCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void {
    cache.set(key, {
      value,
      expiresAt: Date.now() + this.cacheTtlMs
    });
  }
}
