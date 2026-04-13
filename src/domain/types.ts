export type Ecosystem = "npm";

export interface WorkspaceContext {
  rootPath: string;
  workspaceName: string;
  hasPackageJson: boolean;
  manager: Ecosystem;
}

export interface PackageSearchQuery {
  query: string;
  ecosystem: Ecosystem;
  workspace?: WorkspaceContext;
}

export interface PackageLinks {
  npm: string;
  homepage?: string;
  repository?: string;
}

export interface PackageTrustSignals {
  hasRepository: boolean;
  hasHomepage: boolean;
  isScoped: boolean;
  recentlyUpdated: boolean;
}

export interface PackageSearchResult {
  name: string;
  version: string;
  summary: string;
  author?: string;
  downloadsWeekly: number;
  license?: string;
  score: number;
  exactMatch: boolean;
  publishedAt?: string;
  keywords: string[];
  links: PackageLinks;
  trust: PackageTrustSignals;
  reason: string;
}

export interface PackageDetails extends PackageSearchResult {
  versions: string[];
  readmeSnippet?: string;
}

export type InstallMode = "dependency" | "devDependency";

export type InstallProgressCallback = (chunk: string, stream: "stdout" | "stderr") => void;

export interface InstallRequest {
  packageName: string;
  version: string;
  installMode: InstallMode;
  workspace: WorkspaceContext;
  onProgress?: InstallProgressCallback;
}

export interface InstallResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  durationMs: number;
  manifestChanges: string[];
}
